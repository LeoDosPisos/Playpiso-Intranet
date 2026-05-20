 Plano de Deploy: Playpiso Intranet no Railway

 Contexto

 O sistema tem 3 serviços + banco de dados que precisam ser hospedados para viabilizar testes e uso real:

 - Frontend — React 19 + Vite + MSAL (SSO via Microsoft Entra ID)
 - proposta-api — ASP.NET Core 9 + Dapper + DbUp (migrações automáticas)
 - pptx-generator — Python FastAPI (geração do .pptx)
 - PostgreSQL — plugin gerenciado do Railway

 O ponto crítico é o SSO: o App Registration no Entra ID tem window.location.origin como redirect URI (dinâmico, ok), mas precisa ter a URL do Railway
 cadastrada. Também há uma API exposta (api://<client-id>/access_as_user) que o frontend precisa requisitar com Bearer token.

 ---
 Serviços no Railway

 ┌────────────────┬─────────────────────────────────────────┬───────────────────────────┐
 │    Serviço     │        Root directory no Railway        │           Porta           │
 ├────────────────┼─────────────────────────────────────────┼───────────────────────────┤
 │ pptx-generator │ Backend/services/pptx-generator-service │ Railway injeta $PORT      │
 ├────────────────┼─────────────────────────────────────────┼───────────────────────────┤
 │ proposta-api   │ Backend/                                │ 8080 (fixo no Dockerfile) │
 ├────────────────┼─────────────────────────────────────────┼───────────────────────────┤
 │ frontend       │ Frontend/                               │ 80 (nginx)                │
 ├────────────────┼─────────────────────────────────────────┼───────────────────────────┤
 │ postgres       │ Plugin gerenciado                       │ —                         │
 └────────────────┴─────────────────────────────────────────┴───────────────────────────┘

 ---
 Mudanças de Código (fazer antes de qualquer deploy)

 1. Python CORS — Backend/services/pptx-generator-service/main.py

 Linha 23-28: substituir allow_origins hardcoded por leitura de env var.

 Antes:
 app.add_middleware(
     CORSMiddleware,
     allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
     allow_methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type"],
 )

 Depois: adicionar import os no topo do arquivo (após os outros imports), e substituir:
 _cors_origins_raw = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
 _cors_origins = [o.strip() for o in _cors_origins_raw.split(",") if o.strip()]

 app.add_middleware(
     CORSMiddleware,
     allow_origins=_cors_origins,
     allow_methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type"],
 )

 2. Python Dockerfile — Backend/services/pptx-generator-service/Dockerfile

 Linha 7: mudar CMD de exec form para shell form para que $PORT do Railway seja expandido:

 Antes:
 CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

 Depois:
 CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]

 3. Frontend Dockerfile (arquivo novo) — Frontend/Dockerfile

 FROM node:22-alpine AS build
 WORKDIR /app

 ARG VITE_API_URL
 ARG VITE_PROPOSTA_API_URL
 ARG VITE_API_SCOPE
 ARG VITE_AZURE_CLIENT_ID
 ARG VITE_AZURE_TENANT_ID

 ENV VITE_API_URL=$VITE_API_URL
 ENV VITE_PROPOSTA_API_URL=$VITE_PROPOSTA_API_URL
 ENV VITE_API_SCOPE=$VITE_API_SCOPE
 ENV VITE_AZURE_CLIENT_ID=$VITE_AZURE_CLIENT_ID
 ENV VITE_AZURE_TENANT_ID=$VITE_AZURE_TENANT_ID

 COPY package.json package-lock.json ./
 RUN npm ci
 COPY . .
 RUN npm run build

 FROM nginx:alpine
 COPY --from=build /app/dist /usr/share/nginx/html
 COPY nginx.conf /etc/nginx/conf.d/default.conf
 EXPOSE 80

 4. nginx config (arquivo novo) — Frontend/nginx.conf

 Necessário para React Router: sem isso, /historico retorna 404 ao recarregar a página.

 server {
     listen 80;
     root /usr/share/nginx/html;
     index index.html;

     location / {
         try_files $uri $uri/ /index.html;
     }
 }

 Nenhuma mudança no Backend/Dockerfile ou Backend/PlaypisoIntranet/Program.cs — o Dockerfile já usa porta 8080 fixa, e o connection string será passado
  diretamente no formato Npgsql via variável de ambiente do Railway.

 ---
 Variáveis de Ambiente por Serviço

 pptx-generator

 ┌──────────────────────┬───────────────────────────────────────┐
 │       Variável       │                 Valor                 │
 ├──────────────────────┼───────────────────────────────────────┤
 │ CORS_ALLOWED_ORIGINS │ https://<URL-do-frontend>.railway.app │
 └──────────────────────┴───────────────────────────────────────┘

 (Railway injeta PORT automaticamente)

 proposta-api

 ┌─────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │        Variável         │                                                         Valor                                                         │
 ├─────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ ASPNETCORE_ENVIRONMENT  │ Production                                                                                                            │
 ├─────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ ConnectionStrings__Defa │ Host=${{Postgres.PGHOST}};Port=${{Postgres.PGPORT}};Database=${{Postgres.PGDATABASE}};Username=${{Postgres.PGUSER}};P │
 │ ult                     │ assword=${{Postgres.PGPASSWORD}};SSL Mode=Require;Trust Server Certificate=true                                       │
 ├─────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ PptxGeneratorUrl        │ https://<URL-do-pptx-generator>.railway.app                                                                           │
 ├─────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ AzureAd__Instance       │ https://login.microsoftonline.com/                                                                                    │
 ├─────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ AzureAd__TenantId       │ a75f3ed1-64d2-4473-b836-0b7cb2db1542                                                                                  │
 ├─────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ AzureAd__ClientId       │ d59319c0-6b41-497f-b233-447c78d9d391                                                                                  │
 ├─────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ AzureAd__Audience       │ api://d59319c0-6b41-497f-b233-447c78d9d391                                                                            │
 ├─────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Cors__AllowedOrigins__0 │ https://<URL-do-frontend>.railway.app                                                                                 │
 ├─────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ AllowedUsers__ObjectIds │ b7a688cf-e36a-4eb1-97da-36efed5dd2fe                                                                                  │
 │ __0                     │                                                                                                                       │
 ├─────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ AllowedUsers__ObjectIds │ 4bd71798-cd86-4238-a1ef-b29572feda64                                                                                  │
 │ __1                     │                                                                                                                       │
 ├─────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ AllowedUsers__AdminObje │ 4bd71798-cd86-4238-a1ef-b29572feda64                                                                                  │
 │ ctIds__0                │                                                                                                                       │
 └─────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

 ▎ Nota Railway: ${{Postgres.PGHOST}} é a sintaxe de referência de variável do Railway — ele expande automaticamente para o valor do plugin PostgreSQL
 ▎ ao salvar. O nome "Postgres" deve corresponder ao nome que você der ao plugin na UI.

 frontend (build arguments, não runtime variables)

 No Railway, esses valores entram em Build Arguments (Settings > Build), não em Variables. O Dockerfile os recebe via ARG.

 ┌───────────────────────┬───────────────────────────────────────────────────────────┐
 │    Build Argument     │                           Valor                           │
 ├───────────────────────┼───────────────────────────────────────────────────────────┤
 │ VITE_API_URL          │ https://<URL-do-pptx-generator>.railway.app               │
 ├───────────────────────┼───────────────────────────────────────────────────────────┤
 │ VITE_PROPOSTA_API_URL │ https://<URL-da-proposta-api>.railway.app                 │
 ├───────────────────────┼───────────────────────────────────────────────────────────┤
 │ VITE_API_SCOPE        │ api://d59319c0-6b41-497f-b233-447c78d9d391/access_as_user │
 ├───────────────────────┼───────────────────────────────────────────────────────────┤
 │ VITE_AZURE_CLIENT_ID  │ d59319c0-6b41-497f-b233-447c78d9d391                      │
 ├───────────────────────┼───────────────────────────────────────────────────────────┤
 │ VITE_AZURE_TENANT_ID  │ a75f3ed1-64d2-4473-b836-0b7cb2db1542                      │
 └───────────────────────┴───────────────────────────────────────────────────────────┘

 ▎ VITE_API_SCOPE não pode ficar vazio em produção. No .env.development está vazio, e o código verifica if (!API_SCOPE) return base — sem o scope,
 ▎ nenhum Bearer token é enviado para a proposta-api e todas as chamadas retornam 401.

 ---
 Mudança no Azure AD (Portal)

 Azure Active Directory → App Registrations → d59319c0-... → Authentication → Redirect URIs

 Adicionar: https://<URL-do-frontend>.railway.app

 Manter http://localhost:5173 (para desenvolvimento local).

 Não alterar nada em "Expose an API" — o scope api://d59319c0-.../access_as_user já está correto.

 ---
 Ordem de Deploy (resolve o problema de chicken-and-egg das URLs)

 1. Commit dos 4 arquivos de código (main.py, Dockerfile python, Frontend/Dockerfile, Frontend/nginx.conf)

 2. Railway: criar projeto → adicionar plugin PostgreSQL

 3. Deploy pptx-generator (usar CORS_ALLOWED_ORIGINS=http://placeholder por enquanto)
    → Anotar a URL gerada: https://pptx-generator-xxx.railway.app

 4. Deploy proposta-api
    → Configurar PptxGeneratorUrl com a URL do passo 3
    → Anotar a URL gerada: https://proposta-api-xxx.railway.app

 5. Deploy frontend
    → Configurar todos os build arguments com as URLs dos passos 3 e 4

 6. Azure AD: adicionar a URL do frontend do passo 5 nos redirect URIs

 7. Atualizar CORS_ALLOWED_ORIGINS do pptx-generator com a URL real do frontend
    → Railway faz redeploy automático

 8. Atualizar Cors__AllowedOrigins__0 da proposta-api com a URL real do frontend
    → Railway faz redeploy automático

 ---
 Verificação

 1. pptx-generator health: GET https://<pptx-url>/health → {"status": "ok"}
 2. proposta-api auth: GET https://<api-url>/api/proposals sem token → deve retornar 401 (correto)
 3. Migrations: logs da proposta-api no Railway → procurar "Successfully upgraded database"
 4. Login: abrir URL do frontend → redireciona para login Microsoft → volta para o app
 5. CORS no browser: DevTools > Network → chamadas para a API não devem ter erros de CORS
 6. E2E: logar → preencher formulário → gerar → baixar o .pptx

 ---
 Arquivos Críticos

 - Backend/services/pptx-generator-service/main.py — linha 23 (CORS)
 - Backend/services/pptx-generator-service/Dockerfile — linha 7 (CMD)
 - Frontend/Dockerfile — arquivo novo
 - Frontend/nginx.conf — arquivo novo
 - Backend/PlaypisoIntranet/Program.cs — referência (sem mudança)
 - Backend/Dockerfile — referência (sem mudança, já correto)