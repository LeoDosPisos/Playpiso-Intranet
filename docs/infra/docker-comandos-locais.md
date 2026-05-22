# Comandos Docker — operação local

Referência rápida para operar o stack local definido em [`compose.yaml`](../../compose.yaml) (serviços `postgres`, `pptx-generator`, `proposta-api`, `frontend`) e também os comandos `docker` puros mais úteis fora do contexto do Compose.

Para infra cloud (Azure Container Apps / ACR), ver [`docs/infra/azure/`](azure/).

## Quando usar este doc

- Subir/parar o ambiente de desenvolvimento local.
- Liberar espaço em disco apagando imagens e cache antigos.
- Inspecionar containers e imagens fora do escopo do compose deste projeto.

Todos os comandos da seção "Compose" pressupõem que você está na **raiz do repositório** (onde mora o `compose.yaml`).

---

## Ativar containers

### Compose (stack do projeto)

```bash
# Sobe todos os serviços e fica preso no log (Ctrl+C para parar)
docker compose up

# Sobe em background (detached) — recomendado no dia a dia
docker compose up -d

# Sobe só um serviço específico (ex.: só o banco para rodar API/Front nativo)
docker compose up -d postgres

# Força rebuild antes de subir — após mudança de código ou de Dockerfile
docker compose up --build

# Religa containers já criados e parados (mais rápido que 'up', não rebuilda)
docker compose start
```

### Comandos genéricos

```bash
# Religa um container parado pelo nome ou ID
docker start <container>

# Cria e roda um container avulso (raro fora do compose; útil pra testes pontuais)
docker run --rm -it postgres:16-alpine psql -h host.docker.internal -U postgres
```

### Como descobrir nomes

```bash
# Lista os serviços definidos no compose.yaml
docker compose config --services

# Lista containers em execução (nome, status, portas)
docker ps

# Inclui também containers parados
docker ps -a
```

---

## Desativar containers

### Compose (stack do projeto)

```bash
# Para os containers mas mantém eles criados (rápido de religar com 'start')
docker compose stop

# Para apenas um serviço
docker compose stop frontend

# Para E remove containers + network do compose (volumes ficam — banco preservado)
docker compose down

# Igual ao anterior + remove volumes (APAGA os dados do Postgres local!)
docker compose down -v
```

> **Atenção com `-v`:** apaga os dados persistidos no PostgreSQL local. Use só quando quiser ambiente totalmente limpo ou for testar migrações do zero.

### Comandos genéricos

```bash
# Para um container pelo nome ou ID (SIGTERM, espera até 10s)
docker stop <container>

# Força a parada imediata (SIGKILL) — use só se 'stop' travar
docker kill <container>

# Remove um container já parado
docker rm <container>

# Remove todos os containers parados de uma vez
docker container prune
```

---

## Deletar imagens

### Compose (stack do projeto)

```bash
# Para containers e remove só as imagens CONSTRUÍDAS pelo projeto
# (proposta-api, frontend, pptx-generator). Não toca em postgres:16-alpine.
docker compose down --rmi local

# Remove TODAS as imagens referenciadas no compose, inclusive baixadas
# (postgres:16-alpine etc.). No próximo 'up' tudo será re-baixado/rebuildado.
docker compose down --rmi all
```

### Comandos genéricos

```bash
# Lista todas as imagens locais (repo, tag, ID, tamanho)
docker image ls

# Remove uma imagem específica (pelo nome:tag ou ID)
docker rmi <imagem>

# Remove imagens "dangling" (sem tag, geralmente sobras de rebuilds)
docker image prune

# Remove TODAS as imagens não referenciadas por nenhum container (mais agressivo)
docker image prune -a
```

### Cache de build

O cache do BuildKit pode crescer vários GBs ao longo do tempo:

```bash
# Mostra quanto o cache de build está ocupando
docker builder du

# Limpa todo o cache de build
docker builder prune

# Limpa apenas cache mais antigo que 48h (mais conservador)
docker builder prune --filter "until=48h"
```

### Limpeza geral

```bash
# Visão geral do uso de disco do Docker (imagens, containers, volumes, cache)
docker system df

# Remove containers parados + imagens não usadas + networks órfãs + cache de build
docker system prune

# Mesmo que acima + remove volumes não usados (APAGA dados persistidos!)
docker system prune --volumes
```

> **Atenção com `--volumes` no `system prune`:** apaga o volume do Postgres local junto com qualquer outro volume não montado. Equivale a `docker compose down -v` em escala global.

---

## Cheatsheet

| Objetivo | Comando |
|---|---|
| Subir tudo em background | `docker compose up -d` |
| Subir só o banco | `docker compose up -d postgres` |
| Rebuild + subir | `docker compose up --build` |
| Religar containers já criados | `docker compose start` |
| Pausar (mantém containers) | `docker compose stop` |
| Parar e remover containers | `docker compose down` |
| Parar e apagar banco local | `docker compose down -v` |
| Remover imagens do projeto | `docker compose down --rmi local` |
| Listar imagens | `docker image ls` |
| Remover uma imagem | `docker rmi <imagem>` |
| Remover imagens dangling | `docker image prune` |
| Limpar cache de build | `docker builder prune` |
| Limpeza geral (segura) | `docker system prune` |
| Limpeza total + volumes | `docker system prune --volumes` |
| Ver uso de disco do Docker | `docker system df` |
| Listar serviços do compose | `docker compose config --services` |
| Listar containers em execução | `docker ps` |
