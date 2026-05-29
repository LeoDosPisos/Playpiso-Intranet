# CLAUDE.md — pptx-generator-service (Python 3.12 + FastAPI)

> **Fonte de verdade:** os módulos `.py` deste diretório. A doc `ARCHITECTURE.md` está
> parcialmente desatualizada (descreve um `slide_merger.py` monolítico anterior à
> modularização) — confie no código.
> **Mapa geral do repo:** ver `../../../CLAUDE.md` (raiz).
> _Última verificação: 2026-05-29._

Gera a proposta comercial `.pptx` a partir dos dados do formulário, copiando slides-template
e substituindo placeholders.

## Endpoints (`main.py`)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/gerar-proposta` | recebe os dados e devolve o `.pptx` |
| `GET`  | `/slides-disponiveis` | lista os slides registrados |
| `GET`  | `/health` | healthcheck |

Doc da rota principal: `docs/routes/POST-gerar-proposta.md`. Docs automáticas: `/docs`.

## Módulos

| Arquivo | Responsabilidade |
|---|---|
| `main.py` | app FastAPI, CORS, modelos Pydantic, endpoints |
| `slide_registry.py` | registro de slides: arquivo-template, seções condicionais, ordem |
| `context_builder.py` | monta o contexto (dados + formatadores) usado na substituição |
| `placeholder_engine.py` | substituição de placeholders nos parágrafos/shapes |
| `slide_copier.py` | cópia de slides/backgrounds entre apresentações |
| `dynamic_composer.py` | composição dinâmica (fechamentos, acessórios, seções ativas) |
| `presentation_builder.py` | orquestra a montagem final da apresentação |
| `slide_merger.py` | merge legado (em desmonte — preferir os módulos acima) |
| `slide_builders.py` | construtores programáticos (não utilizado) |
| `investimento/builder.py`, `investimento/catalog.py` | linhas e catálogo de investimento |

## Templates de slide

`slides/<produto>/*.pptx` — um diretório por produto: `quadra_tenis`, `quadra_poli`,
`beach_tenis`, `padel`, `pickleball`, `softplay`, mais `_comum/` e `global/`. Cada `.pptx` é
um template com placeholders; o nome do arquivo é referenciado pelo `slideRegistry` do
frontend (`templateFile`) e pelo registry deste serviço.

## Convenções

- Texto técnico em **snake_case** (espelha o `field_id` do frontend). Renomear um campo no
  frontend que chega aqui exige acertar a chave correspondente.
- Campos ocultos por regra condicional não chegam no payload — não assuma presença.

## Comandos

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
pytest                       # tests/ cobre build_presentation e investimento
```
