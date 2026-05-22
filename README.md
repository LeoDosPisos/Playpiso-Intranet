# Playpiso Intranet

Sistema interno da Playpiso para geração de propostas comerciais (.pptx) a partir de um formulário web, com acesso controlado via SSO (Microsoft Entra ID).

---

## Arquitetura

```
Browser (usuário)
    │
    ├──► Frontend  (React + Vite)         porta 3000 / 5173
    │        │
    │        ├──► proposta-api  (C# .NET 9)    porta 8080
    │        │        │
    │        │        └──► pptx-generator  (Python FastAPI)   porta 8000
    │        │                    │
    │        │             ┌──────┘
    │        │             ▼
    │        └──► pptx-generator  (chamada direta para geração)
    │
    └── Auth: Microsoft Entra ID (SSO, JWT Bearer)
```

| Componente        | Tecnologia              | Responsabilidade                              |
|-------------------|-------------------------|-----------------------------------------------|
| `frontend`        | React 19 + Vite + MSAL  | UI, formulário de proposta, histórico         |
| `proposta-api`    | ASP.NET Core 9 + Dapper | CRUD de propostas, validação JWT, migrações   |
| `pptx-generator`  | Python 3.12 + FastAPI   | Geração do arquivo .pptx a partir dos dados   |
| `postgres`        | PostgreSQL 16           | Persistência de propostas e grupos de produto |

---

## Pré-requisitos

### Para rodar com Docker Compose
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclui Docker Compose v2)

### Para rodar de forma nativa (desenvolvimento)
- [Node.js 22+](https://nodejs.org/)
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Python 3.12+](https://www.python.org/downloads/)
- [PostgreSQL 16](https://www.postgresql.org/download/) rodando localmente

---

## Modo 1 — Docker Compose (recomendado para testar antes do deploy)

Sobe todos os componentes containerizados com um único comando.

**Limitação:** o SSO (login Microsoft) não funciona neste modo porque requer HTTPS e redirect URI registrado. A API roda em modo `Development`, que desativa a autenticação — ideal para verificar banco de dados, migrações, endpoints e geração de PPTX.

### Inicializar

```bash
# Na raiz do repositório
docker compose up --build
```

Na primeira execução, o Docker baixa as imagens base e compila os projetos — pode levar alguns minutos. Nas execuções seguintes sem `--build` é muito mais rápido.

### Acessar os componentes

| Componente       | URL                            | Observação                                       |
|------------------|--------------------------------|--------------------------------------------------|
| **Frontend**     | http://localhost:3000          | Interface web (login SSO desativado neste modo)  |
| **proposta-api** | http://localhost:8080          | REST API — sem autenticação em modo Development  |
| **pptx-generator** | http://localhost:8000        | Gerador de .pptx                                 |
| **PostgreSQL**   | `localhost:5432`               | Banco `proposta_comercial`, user/pass: `postgres`|

### Verificar se está tudo funcionando

```bash
# Saúde do pptx-generator
curl http://localhost:8000/health

# Listar propostas (deve retornar [] na primeira vez)
curl http://localhost:8080/api/proposals

# Ver slides disponíveis para geração
curl http://localhost:8000/slides-disponiveis
```

### Parar os serviços

```bash
docker compose down          # Para e remove os containers (banco é apagado)
docker compose down -v       # Igual ao acima + remove volumes (dados do banco)
docker compose stop          # Apenas para, mantém os containers pausados
```

> Para a referência completa (ativar, desativar, deletar imagens, limpar cache, comandos `docker` genéricos): ver [`docs/infra/docker-comandos-locais.md`](docs/infra/docker-comandos-locais.md).

### Reconstruir apenas um serviço

```bash
docker compose up --build proposta-api   # Reconstrói e reinicia só a API C#
docker compose up --build frontend       # Reconstrói só o frontend
```

### Ver logs em tempo real

```bash
docker compose logs -f                  # Todos os serviços
docker compose logs -f proposta-api     # Só a API C#
docker compose logs -f pptx-generator   # Só o gerador Python
```

---

## Modo 2 — Desenvolvimento nativo (com SSO funcionando)

Roda cada componente diretamente na máquina, sem Docker. O SSO funciona porque `http://localhost:5173` já está registrado como redirect URI no App Registration do Entra ID.

### 1. PostgreSQL

Certifique-se de que há um PostgreSQL rodando localmente na porta `5432` com um banco chamado `proposta_comercial`:

```bash
# Via psql
createdb proposta_comercial
```

Ou use o próprio Docker só para o banco:

```bash
docker compose up postgres
```

### 2. pptx-generator

```bash
cd Backend/services/pptx-generator-service

# Criar e ativar ambiente virtual (recomendado)
python -m venv .venv
source .venv/bin/activate        # Linux/Mac
# .venv\Scripts\activate         # Windows

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

Acessível em: **http://localhost:8000**
Documentação automática da API: **http://localhost:8000/docs**

### 3. proposta-api

O arquivo `appsettings.Development.json` já tem o connection string para o banco local (`localhost:5432`). Nenhuma variável de ambiente extra é necessária para desenvolvimento.

```bash
cd Backend/PlaypisoIntranet

dotnet run
```

Acessível em: **http://localhost:8080**
As migrações DbUp rodam automaticamente na inicialização.

### 4. Frontend

```bash
cd Frontend

npm install
npm run dev
```

Acessível em: **http://localhost:5173**

O arquivo `Frontend/.env.development` já tem todas as variáveis configuradas para apontar para os serviços locais. O SSO vai funcionar — ao abrir o app, você será redirecionado para o login Microsoft.

---

## Variáveis de ambiente

### Frontend (`Frontend/.env.development` — já configurado)

| Variável                | Valor em dev              | Descrição                                     |
|-------------------------|---------------------------|-----------------------------------------------|
| `VITE_API_URL`          | `http://localhost:8000`   | URL do pptx-generator                         |
| `VITE_PROPOSTA_API_URL` | `http://localhost:5204`   | URL da proposta-api                           |
| `VITE_API_SCOPE`        | *(vazio em dev)*          | Scope do Bearer token (obrigatório em produção) |
| `VITE_AZURE_CLIENT_ID`  | `d59319c0-...`            | App Registration ID                           |
| `VITE_AZURE_TENANT_ID`  | `a75f3ed1-...`            | Tenant ID do Entra ID                         |

> Em produção, `VITE_API_SCOPE` deve ser `api://d59319c0-6b41-497f-b233-447c78d9d391/access_as_user`. Se ficar vazio, o frontend não envia o Bearer token e a API retorna 401 em todas as chamadas.

### proposta-api (`Backend/PlaypisoIntranet/appsettings.Development.json` — já configurado)

Em desenvolvimento, a autenticação Azure AD é desativada (policy `AllowedUsers` retorna `true` para todos). O connection string usa `localhost:5432`.

Para produção, as variáveis são injetadas via Railway (ver seção de deploy abaixo).

### pptx-generator

| Variável               | Padrão                                      | Descrição                       |
|------------------------|---------------------------------------------|---------------------------------|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:5173`| Origins permitidos pelo CORS    |
| `PORT`                 | `8000`                                      | Injetado automaticamente pelo Railway |

---

## Limpeza de imagens e cache Docker

Para o conjunto completo de comandos de operação local — ativar, desativar, remover imagens, limpar cache de build e limpeza geral — ver [`docs/infra/docker-comandos-locais.md`](docs/infra/docker-comandos-locais.md). Atalhos mais usados no dia a dia:

```bash
docker compose up --build <serviço>   # rebuild + reinicia um serviço alterado
docker compose down --rmi local       # remove containers + imagens do projeto
docker builder prune                  # libera cache de build
docker system prune                   # limpeza geral (containers/imagens não usados)
```

---

## Deploy na Azure (Azure Container Apps + Static Web Apps)

A infraestrutura é provisionada com **Terraform** e o CI/CD é feito via **GitHub Actions** (push na `main` dispara deploy automático).

| Serviço          | Recurso Azure                    | Porta |
|------------------|----------------------------------|-------|
| `frontend`       | Azure Static Web Apps (Free)     | —     |
| `proposta-api`   | Container App — ingress externo  | 8080  |
| `pptx-generator` | Container App — ingress externo  | 8000  |
| `postgres`       | PostgreSQL Flexible Server       | 5432  |

### 1. Provisionar infraestrutura (uma vez)

Requer [Terraform ≥ 1.7](https://developer.hashicorp.com/terraform/install) e [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli).

```bash
az login
az account set --subscription "<SUBSCRIPTION_ID>"

cd infra/environments/dev
cp backend.tf.example backend.tf         # preencher storage account para estado remoto
cp terraform.tfvars.example terraform.tfvars

export TF_VAR_db_admin_password="<SENHA_FORTE>"
export TF_VAR_azure_tenant_id="a75f3ed1-64d2-4473-b836-0b7cb2db1542"
export TF_VAR_azure_client_id="d59319c0-6b41-497f-b233-447c78d9d391"

terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

Anote os outputs — eles serão os valores dos GitHub Secrets:

```bash
terraform output frontend_url       # → VITE_PROPOSTA_API_URL base + Azure AD redirect URI
terraform output backend_fqdn       # → VITE_PROPOSTA_API_URL (com https://)
terraform output microservice_fqdn  # → VITE_API_URL (com https://)
terraform output acr_login_server   # → ACR_LOGIN_SERVER
terraform output -raw static_web_app_token  # → AZURE_STATIC_WEB_APPS_API_TOKEN
```

### 2. Configurar GitHub Secrets

No repositório: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Valor |
|--------|-------|
| `AZURE_CREDENTIALS` | JSON do service principal (`az ad sp create-for-rbac --role contributor --scopes /subscriptions/<ID>/resourceGroups/<RG> --json-auth`) |
| `AZURE_RESOURCE_GROUP` | ex: `playpiso-proposta-dev-rg` |
| `ACR_LOGIN_SERVER` | output `acr_login_server` |
| `ACR_USERNAME` | admin username do ACR |
| `ACR_PASSWORD` | admin password do ACR |
| `ACA_PPTX_NAME` | nome do Container App pptx-generator (ex: `playpiso-proposta-dev-pptx`) |
| `ACA_API_NAME` | nome do Container App proposta-api (ex: `playpiso-proposta-dev-api`) |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | output `static_web_app_token` |
| `VITE_API_URL` | `https://` + output `microservice_fqdn` |
| `VITE_PROPOSTA_API_URL` | `https://` + output `backend_fqdn` |
| `VITE_API_SCOPE` | `api://d59319c0-6b41-497f-b233-447c78d9d391/access_as_user` |
| `VITE_AZURE_CLIENT_ID` | `d59319c0-6b41-497f-b233-447c78d9d391` |
| `VITE_AZURE_TENANT_ID` | `a75f3ed1-64d2-4473-b836-0b7cb2db1542` |

### 3. Registrar redirect URI no Azure AD

**Portal Azure → Azure Active Directory → App Registrations → `d59319c0-...` → Authentication → Redirect URIs**

Adicionar: `https://<output frontend_url>`

### 4. Primeiro deploy

Com os secrets configurados, faça push para `main`. O workflow `.github/workflows/deploy.yml` vai:
1. Construir e publicar as imagens no ACR (pptx-generator e proposta-api, em paralelo)
2. Fazer build do frontend com as variáveis `VITE_*` e publicar no Static Web App
3. Atualizar cada Container App com a nova imagem

### Arquitetura Terraform (`infra/`)

Documentação detalhada: `infra/README.md`

---

## Estrutura de arquivos relevantes

```
.
├── docker-compose.yml                          # Orquestração local (dev sem SSO)
├── .github/
│   └── workflows/
│       └── deploy.yml                          # CI/CD: build → ACR → Container Apps + SWA
├── Frontend/
│   ├── Dockerfile                              # Build multi-stage (node + nginx) — usado no Docker Compose
│   ├── nginx.conf                              # Config nginx — usado no Docker Compose
│   ├── public/
│   │   └── staticwebapp.config.json            # SPA routing para Azure Static Web Apps
│   ├── .env.development                        # Variáveis de ambiente para dev local
│   └── src/
│       └── auth/msalConfig.ts                  # Configuração MSAL (Entra ID)
├── Backend/
│   ├── Dockerfile                              # Build multi-stage (.NET 9)
│   ├── PlaypisoIntranet/
│   │   ├── appsettings.json                    # Config produção (sem secrets)
│   │   ├── appsettings.Development.json        # Config dev local (sem auth)
│   │   └── Migrations/                         # Scripts SQL do DbUp
│   └── services/
│       └── pptx-generator-service/
│           ├── Dockerfile                      # Python slim
│           ├── main.py                         # Entrypoint FastAPI
│           └── requirements.txt
└── infra/
    ├── README.md                               # Instruções Terraform
    └── environments/dev/                       # Variáveis e composição para dev
        └── modules/                            # ACR, Container Apps, PostgreSQL, SWA, Key Vault
```
