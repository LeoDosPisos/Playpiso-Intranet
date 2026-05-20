# Banco local de desenvolvimento

Este diretório contém o `compose.yaml` usado para subir as dependências locais de banco de dados do backend.

> Ambiente local/dev apenas. Não use essas credenciais ou configurações em produção.

## Subir os containers

A partir da raiz do repositório:

```bash
docker compose -f Backend/db/compose.yaml up -d
```

## Serviços

PostgreSQL:

- Host: `localhost`
- Porta: `5432`
- Database: `proposta_comercial`
- Usuario: `postgres`
- Senha: `postgres`

pgAdmin:

- URL: `http://localhost:5050`
- Email: `admin@playpiso.com.br`
- Senha: `admin`

## Parar os containers

```bash
docker compose -f Backend/db/compose.yaml down
```

Para remover tambem o volume local com os dados do PostgreSQL:

```bash
docker compose -f Backend/db/compose.yaml down -v
```
