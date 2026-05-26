# Limpeza do Banco de Dados Azure

Procedimento para zerar todas as propostas em produção via `Backend/scripts/cleanup_all_data.sql`, conectando ao Postgres Azure pelo **Cloud Shell** (sem precisar liberar IP no firewall) e lendo credenciais do **Key Vault**.

> ⚠️ **Operação destrutiva e irreversível.** O script apaga tudo de `proposals` (e em cascata `proposal_product_groups`). Use só em dev/staging ou quando explicitamente acordado que os dados de produção podem ser descartados. Cada execução fica registrada em `audit_cleanup_log` com `current_user` Postgres e timestamp.

---

## Pré-requisitos

| Requisito | Como obter |
|---|---|
| Conta Azure AD no tenant Playpiso | Já é o caso se você acessa o portal |
| Role **Key Vault Secrets User** (ou superior) em `playpiso-proposta-dev-kv` | Pedir a quem administra o vault (Access policies / RBAC) |
| Role **Reader** no resource group `playpiso-proposta-dev-rg` | Suficiente pra enxergar os recursos no portal |
| Migration `V008__create_audit_cleanup_log.sql` já aplicada em prod | Aplicada automaticamente pelo DbUp no boot da API após o deploy que inclui a V008. Verificar nos logs do Container App (`schemaversions` contém `V008`) |

Tudo é feito do navegador via Cloud Shell — não precisa ter `psql` instalado localmente.

---

## Recursos Azure envolvidos

| Recurso | Nome (ambiente dev) |
|---|---|
| Resource Group | `playpiso-proposta-dev-rg` |
| Postgres Flexible Server | `playpiso-proposta-dev-db` |
| FQDN do servidor | `playpiso-proposta-dev-db.postgres.database.azure.com` |
| Banco | `proposta_comercial` |
| Admin Postgres | `pgadmin` |
| Key Vault | `playpiso-proposta-dev-kv` |
| Secret com connection string | `db-connection-string` |

---

## Passo a passo

### 1. Abrir o Cloud Shell

No [portal Azure](https://portal.azure.com), clicar no ícone `>_` (canto superior direito) → escolher **Bash**.

- Na primeira vez, o portal pede pra criar uma Storage Account de suporte ao Cloud Shell. Aceitar o default (a sessão fica persistente entre logins).
- O Cloud Shell já vem com `az`, `psql` e `bash` instalados — nada pra preparar.

### 2. Confirmar contexto da subscription

```bash
az account show --query '{subscription:name, tenant:tenantId}' -o table
```

Se a subscription listada não for a do Playpiso, trocar:

```bash
az account list --query '[].{name:name, id:id}' -o table
az account set --subscription "<nome ou id da subscription correta>"
```

### 3. Recuperar a connection string do Key Vault

```bash
CONN=$(az keyvault secret show \
  --vault-name playpiso-proposta-dev-kv \
  --name db-connection-string \
  --query value -o tsv)
```

> Não rode `echo $CONN` — a senha do banco fica no histórico do shell. Pra inspecionar com segurança:
> ```bash
> echo "$CONN" | sed 's/Password=[^;]*/Password=***/'
> ```

Se der erro `Forbidden` ou `(Forbidden)`, sua conta não tem permissão de leitura nos secrets. Pedir a role **Key Vault Secrets User** no vault `playpiso-proposta-dev-kv`.

### 4. Converter para variáveis de ambiente do `psql`

A string no vault está no formato Npgsql/ADO.NET (`Host=...;Port=...;Database=...;Username=...;Password=...;SSL Mode=Require`). O `psql` lê do formato libpq via variáveis `PG*`:

```bash
eval $(echo "$CONN" | awk -F';' '{
  for(i=1;i<=NF;i++){
    split($i, kv, "=");
    gsub(/ /, "", kv[1]);
    if (kv[1]=="Host")                       print "export PGHOST="kv[2];
    if (kv[1]=="Port")                       print "export PGPORT="kv[2];
    if (kv[1]=="Database")                   print "export PGDATABASE="kv[2];
    if (kv[1]=="Username")                   print "export PGUSER="kv[2];
    if (kv[1]=="Password")                   print "export PGPASSWORD=\""kv[2]"\"";
    if (kv[1]=="SSLMode" || kv[1]=="SslMode") print "export PGSSLMODE=require";
  }
}')
export PGSSLMODE=${PGSSLMODE:-require}
```

A última linha garante `sslmode=require` mesmo se a string não tiver esse campo explícito (Azure Postgres exige TLS).

Conferir (sem expor senha):

```bash
echo "PGHOST=$PGHOST  PGUSER=$PGUSER  PGDATABASE=$PGDATABASE  PGSSLMODE=$PGSSLMODE"
```

Esperado:
```
PGHOST=playpiso-proposta-dev-db.postgres.database.azure.com  PGUSER=pgadmin  PGDATABASE=proposta_comercial  PGSSLMODE=require
```

### 5. Testar a conexão

```bash
psql -c "SELECT current_user, current_database(), now();"
```

Saída esperada (uma linha de dados):
```
 current_user | current_database  |              now
--------------+-------------------+-------------------------------
 pgadmin      | proposta_comercial| 2026-05-26 17:30:42.123+00
```

### 6. Subir o script para o Cloud Shell

**Opção A — colar inline** (recomendado, o script é curto):

```bash
cat > cleanup_all_data.sql <<'EOF'
-- Limpa TODAS as propostas e grupos de produto, registrando a operação em audit_cleanup_log.
BEGIN;

WITH counts AS (
  SELECT
    (SELECT COUNT(*) FROM proposals)               AS p_count,
    (SELECT COUNT(*) FROM proposal_product_groups) AS g_count
)
INSERT INTO audit_cleanup_log (
  executed_by_postgres_user,
  proposals_deleted,
  product_groups_deleted,
  notes
)
SELECT
  current_user,
  p_count,
  g_count,
  'Manual cleanup via cleanup_all_data.sql'
FROM counts;

TRUNCATE TABLE proposals CASCADE;

COMMIT;

SELECT * FROM audit_cleanup_log ORDER BY executed_at DESC LIMIT 5;
SELECT COUNT(*) AS remaining_proposals FROM proposals;
SELECT COUNT(*) AS remaining_groups    FROM proposal_product_groups;
EOF
```

**Opção B — upload pela UI**: no Cloud Shell, botão **"Upload/Download files"** (ícone de pasta com seta) → **Upload** → selecionar o `Backend/scripts/cleanup_all_data.sql` do seu clone local.

### 7. (Opcional) Conferir o estrago antes de executar

```bash
psql -c "SELECT
  (SELECT COUNT(*) FROM proposals)               AS proposals,
  (SELECT COUNT(*) FROM proposal_product_groups) AS groups;"
```

Anota os números pra cruzar com o que aparecer no `audit_cleanup_log` depois.

### 8. Executar o script

```bash
psql -f cleanup_all_data.sql
```

Saída esperada:
```
BEGIN
INSERT 0 1
TRUNCATE TABLE
COMMIT
 id |          executed_at          | executed_by_postgres_user | proposals_deleted | product_groups_deleted | ...
----+-------------------------------+---------------------------+-------------------+------------------------+----
  1 | 2026-05-26 17:32:01.456+00    | pgadmin                   |                42 |                   137  | ...
 remaining_proposals
---------------------
                   0
 remaining_groups
------------------
                0
```

### 9. Confirmar o audit log 

```bash
psql -c "SELECT executed_at, executed_by_postgres_user, proposals_deleted, product_groups_deleted
         FROM audit_cleanup_log
         ORDER BY executed_at DESC
         LIMIT 3;"
```

A primeira linha tem que ser a execução que você acabou de fazer, com as contagens batendo com o passo 7.

### 10. Limpar variáveis sensíveis da sessão

```bash
unset PGHOST PGPORT PGDATABASE PGUSER PGPASSWORD PGSSLMODE CONN
rm -f cleanup_all_data.sql
```

O Cloud Shell também expira a sessão por inatividade, mas higiene custa nada.

---

## Troubleshooting

### `FATAL: SSL connection is required`
Faltou `PGSSLMODE=require`. Reaplica o passo 4 ou exporta manualmente: `export PGSSLMODE=require`.

### `(Forbidden)` no `az keyvault secret show`
Sua conta não tem permissão de leitura no Key Vault. Solicitar a role **Key Vault Secrets User** em `playpiso-proposta-dev-kv` (RBAC do vault ou Access Policies, dependendo do modelo configurado).

### `could not translate host name`
Variável `PGHOST` vazia ou errada. Conferir:
```bash
echo "$PGHOST"  # deve imprimir playpiso-proposta-dev-db.postgres.database.azure.com
```
Se vazio, refazer o passo 4 — provavelmente o `awk` não encontrou a chave (ex: o secret tem nomes de campo diferentes).

### `relation "audit_cleanup_log" does not exist`
A migration V008 ainda não rodou nesse banco. Verificar os logs do Container App da API depois do último deploy — o DbUp loga cada script aplicado. Se a migration realmente não chegou, fazer o deploy da branch que contém `V008__create_audit_cleanup_log.sql` e tentar de novo.

### `TRUNCATE` trava (não responde)
Outra sessão está segurando lock na tabela. Listar:
```sql
SELECT pid, usename, state, query
FROM pg_stat_activity
WHERE datname = 'proposta_comercial' AND pid <> pg_backend_pid();
```
Se for alguma sessão antiga/órfã, encerrar com `SELECT pg_terminate_backend(<pid>);`. **Cuidado**: não matar sessão de outro operador legítimo nem da própria API se ela estiver atendendo tráfego.

### Conexão expira (`server closed the connection unexpectedly`)
Azure Postgres tem timeout de conexão ociosa (~30 min). Reabra a sessão `psql` e reexecute. Como o script é atômico (`BEGIN/COMMIT`), uma execução interrompida no meio é desfeita.

---

## Referências cruzadas

- Script executado: [`Backend/scripts/cleanup_all_data.sql`](../../../Backend/scripts/cleanup_all_data.sql)
- Migration que cria a tabela de auditoria: [`Backend/PlaypisoIntranet/Migrations/V008__create_audit_cleanup_log.sql`](../../../Backend/PlaypisoIntranet/Migrations/V008__create_audit_cleanup_log.sql)
- Outras tarefas operacionais Azure: [`infra-azure-tarefas-manuais.md`](./infra-azure-tarefas-manuais.md)
- Diagnóstico de problemas em prod: [`infra-azure-troubleshooting-runtime.md`](./infra-azure-troubleshooting-runtime.md)
