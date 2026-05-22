# Troubleshooting de Problemas em Produção

Guia para diagnosticar problemas reportados por usuários reais. Diferente de [`infra-azure-cicd.md`](./infra-azure-cicd.md) (problemas no pipeline) e de [`infra-azure-terraform-plan.md`](./infra-azure-terraform-plan.md) (problemas no provisionamento), aqui o foco é **runtime** — a aplicação está no ar mas algo não funciona para alguns usuários.

## Sintoma típico: "funciona pra mim, falha pros outros"

Mensagens dos browsers afetados:
- **Chrome / Firefox:** `NetworkError when attempting to fetch resource`
- **Safari (macOS / iOS):** `Load failed`
- Console F12 pode mostrar status code da request (importante para diagnóstico).

A causa varia. Diagnostique nessa ordem:

---

## Causa #1 — Cold start (mais provável)

**Assinatura característica:** primeira tentativa falha; usuário tenta de novo na hora e funciona.

### Mecanismo

Os Container Apps estão configurados com `min_replicas = 0` em `infra/modules/container-apps/main.tf` — escalam a zero quando ociosos por ~5 min, para zerar custos de compute. Quando uma request chega com container dormindo:

1. Azure Container Apps Environment detecta o request e dispara scale-up.
2. Container puxa imagem do ACR (cached na maioria das vezes, ~5s).
3. Container inicia. Para a C# API, o **DbUp** roda migrations no startup e abre conexão com PostgreSQL.
4. Aplicação fica pronta para responder. Tempo total: **20-60s**.

Enquanto isso, o browser do usuário pode timeoutar:
- Safari: ~60s (sente mais)
- Firefox: ~90s
- Chrome: ~5 min

Se timeoutar antes do container responder, browser mostra "NetworkError" / "Load failed".

**Por que usuários frequentes (você) não veem o problema:** containers ficam quentes — sempre respondem em ms.

### Mitigação implementada

[`.github/workflows/keep-warm.yml`](../../../.github/workflows/keep-warm.yml) dispara `curl` nos dois Container Apps a cada 10 min durante horário comercial (08h-19h Brasil, seg-sex), mantendo-os quentes.

**Limites:**
- Cobre 08h-19h dias úteis. Fora desse intervalo (noite, fim de semana, feriado), primeira request ainda cold-starta.
- GitHub Actions tem precisão mínima de 5 min e pode atrasar alguns minutos sob carga global; cadência de 10 min é margem segura contra o sleep de 5 min do Container Apps.
- Para teste manual: `gh workflow run keep-warm.yml`.

### Confirmação

Se o usuário reporta intermitência com padrão "primeira falha, segunda OK", causa quase certa. Para verificar:

```bash
# Estado dos containers no momento
make status   # coluna runningStatus

# Logs em tempo real durante reprodução
az containerapp logs show \
  --name playpiso-proposta-dev-api \
  --resource-group playpiso-proposta-dev-rg \
  --follow
```

Esperado em cold start: linhas de startup do .NET e do DbUp aparecem antes da primeira resposta.

### Quando isso não basta

Se o keep-warm está rodando mas usuários ainda sentem cold start (porque o uso fora do horário comercial é frequente), considerar:

- **`min_replicas = 1`** em `infra/modules/container-apps/main.tf` — resolve 100% mas custa ~$10-15/mês a mais (2 containers ligados 24/7).
- **Loader amigável no frontend** — interceptar requests demoradas (>3s) e mostrar "Acordando o sistema..." em vez de erro genérico.

---

## Causa #2 — Admin consent não dado

**Assinatura característica:** erro consistente para todos os usuários do mesmo tenant, nunca funciona, independe de cold start.

### Mecanismo

O MSAL no frontend pede dois consents distintos:

1. **No login:** scopes `openid`, `profile`, `email`, `User.Read` — consent automático (Microsoft Graph básico).
2. **Ao chamar a API:** scope `api://d59319c0-6b41-497f-b233-447c78d9d391/access_as_user` — exige que **um admin tenha feito "Grant admin consent for Playpiso"** OU que cada usuário aceite individualmente uma tela de consent.

O código atual em `Frontend/src/pages/FormPropostaComercial/generation/buildPresentation.ts` silencia falhas de `acquireTokenSilent` (catch vazio), enviando request sem Bearer → backend retorna 401 → frontend mostra "NetworkError" genérico.

### Verificação

1. Portal Azure → **Azure Active Directory** → **App registrations** → app `d59319c0-6b41-497f-b233-447c78d9d391`.
2. Aba **API permissions**.
3. Procurar `access_as_user` na lista.
4. Conferir coluna **Status**: ✅ "Granted for Playpiso" (verde) é o esperado.

### Correção

Click **Grant admin consent for Playpiso**. Aplica imediatamente a todos os usuários do tenant.

---

## Causa #3 — Safari ITP (Intelligent Tracking Prevention)

**Assinatura característica:** falha só em Safari (macOS / iOS), funciona em Chrome/Firefox na mesma máquina.

### Mecanismo

Safari bloqueia agressivamente cookies de terceiros e iframes ocultos (mecanismo ITP). MSAL usa um iframe oculto para renovar tokens silenciosamente; Safari pode bloquear, fazendo `acquireTokenSilent` falhar consistentemente.

### Mitigação recomendada (não implementada hoje)

Em `Frontend/src/auth/msalConfig.ts`:

```typescript
cache: {
  cacheLocation: 'localStorage',       // antes: 'sessionStorage'
  storeAuthStateInCookie: true,        // adiciona fallback de cookie 1st-party
}
```

`localStorage` persiste o cache de token entre sessões. `storeAuthStateInCookie: true` é recomendação oficial da MSAL para browsers com ITP.

---

## Causa #4 — CORS mismatch

**Assinatura característica:** todos os browsers mostram CORS error no console (não apenas "NetworkError" genérico). Acontece para todos os usuários, inclusive você.

### Verificação

```bash
# Conferir env var configurada no Container App
az containerapp show \
  --name playpiso-proposta-dev-api \
  --resource-group playpiso-proposta-dev-rg \
  --query "properties.template.containers[0].env[?name=='Cors__AllowedOrigins__0'].value" -o tsv
```

Esperado: URL do Static Web App exatamente igual (mesmo protocolo, sem trailing slash). Diferenças invisíveis (http vs https, slash final) quebram o match.

### Correção

Editar `infra/modules/container-apps/main.tf`, ajustar `Cors__AllowedOrigins__0` para refletir a URL real do SWA. Depois `make deploy`.

---

## Pegadinhas conhecidas

Coisas que confundem ao diagnosticar — vale ter no radar:

### `AllowedUsers__ObjectIds__*` no Container App é ignorada

O Terraform em `infra/modules/container-apps/main.tf` passa env vars `AllowedUsers__ObjectIds__0` e `__1`. Elas **não fazem nada** porque a classe `AllowedUsersOptions.cs` no backend só tem o campo `AdminObjectIds`. **Não existe allowlist global hoje** — qualquer usuário autenticado do tenant correto pode usar o sistema.

Se você quiser allowlist real, precisa adicionar `public List<string> ObjectIds { get; set; } = []` na classe + middleware/policy que valida. Mudança arquitetural separada.

### MSAL é single-tenant

`Frontend/src/auth/msalConfig.ts` usa `authority = https://login.microsoftonline.com/<TENANT_ID>` — só aceita contas do tenant PLAYPISO. Tentativas com:

- Contas Microsoft pessoais (Outlook, Hotmail) → recusadas no login.
- Contas de outros tenants (outra empresa) → recusadas no login.

Sintoma: usuário vê erro do próprio Azure AD na tela de login (não chega na aplicação).

### `getAuthHeaders()` silencia falhas de token

```typescript
try {
  const { accessToken } = await msalInstance.acquireTokenSilent({ scopes: [API_SCOPE], account })
  return { ...base, Authorization: `Bearer ${accessToken}` }
} catch {
  return base  // ← oculta o erro
}
```

Qualquer falha aqui (consent não dado, ITP, popup bloqueado, token expirado) gera request sem Bearer → API retorna 401 → frontend mostra mensagem genérica. Para diagnosticar de verdade, é preciso abrir F12 e ver o status da request.

**Melhoria futura recomendada:** trocar por fallback interativo + erro visível:

```typescript
} catch (silentError) {
  console.warn('acquireTokenSilent failed', silentError)
  try {
    const { accessToken } = await msalInstance.acquireTokenPopup({ scopes: [API_SCOPE], account })
    return { ...base, Authorization: `Bearer ${accessToken}` }
  } catch {
    throw new Error('Falha ao autenticar com a API. Tente recarregar a página.')
  }
}
```

---

## Como diagnosticar quando o problema não bate em nenhum padrão acima

1. **F12 no dispositivo afetado** → Network tab → reproduzir o erro → ver status code:
   - `401 Unauthorized` → problema de token (Causa #2 ou #3).
   - `403 Forbidden` → admin tentando acessar recurso que não é dele (raro com `AllowedUsersOptions` atual).
   - `0` / timeout / "(failed) net::ERR_*` → cold start ou conectividade.
   - `CORS error` explícito → Causa #4.
   - `500 Internal Server Error` → bug na aplicação; ver logs do Container App.

2. **`az containerapp logs show --follow`** durante reprodução:
   - Erros de migration (DbUp) — falha no startup; revisão antiga mantida.
   - Erros de conexão DB — Postgres pausado? Connection string errada? Key Vault inacessível?
   - Stack traces da aplicação.

3. **Application Insights** → Failures: agrupa exceções por similaridade, mostra tendências.

4. **Reproduzir local** com `docker compose up --build` — se não reproduz local, é específico do ambiente Azure (auth, env vars, networking).

---

## Melhorias futuras possíveis (não implementadas)

Lista de melhorias que tornariam diagnósticos futuros mais fáceis:

- **`min_replicas = 1`** — remove cold start completamente. Custo: ~$10-15/mês.
- **Loader amigável no frontend** durante requests >3s ("Acordando o sistema...") para cold starts não cobertos pelo keep-warm.
- **`acquireTokenPopup` como fallback** em `getAuthHeaders()` — força tela de consent visível em vez de falhar silenciosamente.
- **`localStorage` + `storeAuthStateInCookie: true`** no MSAL — melhora compatibilidade com Safari.
- **Health endpoint padronizado** na C# API (`/health` igual ao do PPTX Generator) — facilita keep-warm e monitoring.
- **Application Insights alerts** — disparar email/Slack quando taxa de erro passa de X%.
- **Allowlist global de usuários no backend** — caso queira controlar quem usa, criar `ObjectIds` em `AllowedUsersOptions` e middleware que valida.
