# pptx-generator-service

Microserviço FastAPI responsável por montar propostas comerciais em formato `.pptx`. Recebe do frontend a lista ordenada de slides, os dados do formulário e os grupos de produto, abre os templates `.pptx` correspondentes, substitui os placeholders e devolve o arquivo final em bytes.

---

## Como executar localmente

```bash
python -m venv .venv
source .venv/bin/activate        # Linux/Mac
# .venv\Scripts\activate         # Windows

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Variável de ambiente opcional:

| Variável | Padrão | Descrição |
|---|---|---|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Origins permitidos pelo CORS (separados por vírgula) |
| `PORT` | `8000` | Injetado automaticamente pelo Railway/Azure |

---

## Endpoints

| Endpoint | Método | Descrição |
|---|---|---|
| `/health` | GET | Verificação de saúde |
| `/slides-disponiveis` | GET | Lista slideIds com template `.pptx` presente em disco |
| `/gerar-proposta` | POST | Monta e retorna o `.pptx` |

### `GET /health`

```json
{ "status": "ok" }
```

### `GET /slides-disponiveis`

Retorna lista de strings com os `slideId`s que possuem arquivo `.pptx` mapeado e presente em `slides/`. O frontend usa esta lista para saber quais produtos estão disponíveis para seleção.

```json
["capa", "dados_cliente", "hero_beach_tenis", "investimento_beach_tenis", ...]
```

### `POST /gerar-proposta`

Retorna os bytes do arquivo `.pptx` com `Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation`.

---

## Payload de `/gerar-proposta`

### Formato atual (campo `slides`)

```json
{
  "slides": [
    {
      "slideId": "capa",
      "templateFile": "slides/global/capa.pptx"
    },
    {
      "slideId": "dados_cliente",
      "templateFile": "slides/global/dados_cliente.pptx"
    },
    {
      "slideId": "fechamentos_quadra_tenis",
      "templateFile": "slides/quadra_tenis/fechamentos_base.pptx",
      "dynamic": "fechamentos",
      "groupIndex": 0
    },
    {
      "slideId": "investimento_piso_asfaltico_quadra_tenis",
      "templateFile": "slides/quadra_tenis/investimento_piso_asfaltico.pptx"
    }
  ],
  "globalValues": {
    "nome_razao_social": "Condomínio Exemplo",
    "nome_contato": "Maria Silva",
    "endereco_obra": "Rua Exemplo, 100",
    "local_obra": "São Paulo, SP",
    "telefone": "(11) 99999-9999",
    "email": "maria@exemplo.com",
    "numero_proposta": "P-2026-001",
    "data_solicitacao": "2026-05-01",
    "data_envio": "2026-05-20"
  },
  "productGroups": [
    {
      "productId": "quadra_tenis",
      "quantity": 1,
      "variantId": "piso_asfaltico",
      "values": {
        "largura": 10.97,
        "comprimento": 23.77,
        "area_total": 260.66,
        "possui_playcushion": true,
        "possui_alambrado": true,
        "sistema_alambrado": "gaiola",
        "altura_alambrado_fundos": 4.0,
        "galvanizacao": "fogo",
        "possui_iluminacao": false,
        "travamento": ["travamento_superior", "travamento_inferior"]
      },
      "sumarioText": "1 Quadra de Tênis — Piso Asfáltico com PlayCushion",
      "investimentoRows": ["Piso Asfáltico", "PlayCushion", "Alambrado"]
    }
  ]
}
```

### Formato legado (campo `slideIds`)

Ainda suportado, mas depreciado. Substitui `slides` por uma lista de strings:

```json
{
  "slideIds": ["capa", "dados_cliente", "sumario", "hero_beach_tenis"],
  "globalValues": { ... },
  "productGroups": [ ... ]
}
```

### Campos de `globalValues` reconhecidos nos templates

| Campo | Formato | Observação |
|---|---|---|
| `nome_razao_social` | string | |
| `nome_contato` | string | |
| `endereco_obra` | string | |
| `local_obra` | string | |
| `telefone` | string | |
| `email` | string | |
| `numero_proposta` | string | |
| `data_solicitacao` | `YYYY-MM-DD` | Convertida para `DD/MM/YYYY` |
| `data_envio` | `YYYY-MM-DD` | Convertida para `DD/MM/YYYY` |

---

## Arquitetura

### Fluxo de montagem (`build_presentation` em `slide_merger.py`)

```
req.slides (lista de SlideEntryRequest)
  ↓
Para cada slide_entry:
  ├─ dynamic == "fechamentos"  → compose_fechamentos()
  │     Abre fechamentos_base.pptx como canvas
  │     Cola verticalmente as secao_{alambrado,iluminacao,...}.pptx ativas
  │     Até 3 seções por slide; 4+ divide em 2 slides
  │
  ├─ dynamic == "acessorios"   → compose_acessorios()
  │     Abre acessorios_base.pptx como canvas
  │     Cola verticalmente as secao_acessorio_{basquete,...}.pptx ativas
  │     Até 4 seções por slide
  │
  └─ (normal)
        Abre templateFile como Presentation
        _copy_slide() — deepcopy do XML + remapeamento de imagens
        _replace_placeholders() — substitui {{ chave }} em textos e tabelas
  ↓
merged.save(BytesIO) → retorna bytes
```

### `SLIDE_FILE_MAP`

Dicionário em `slide_merger.py` que mapeia `slideId` → caminho relativo a `slides/`. Tem 36 entradas organizadas em seções:

- **global pré-produto**: capa, portfolio, sobre_empresa, pilares, parceiros, dados_cliente, sumario
- **beach_tenis**: hero, areia_rio, areia_quartzo, protecao_eva, acessorio, investimento
- **quadra_tenis**: hero (3 variantes), specs (3), playcushion, cores, detalhe_construtivo (2), investimento (3)
- **quadra_poliesportiva**: hero, specs, cores, investimento
- **global pós-produto**: condicoes_pagamento (3 variantes), prazos_garantia, regras, consideracoes_gerais, encerramento

Slides dinâmicos (`fechamentos_*`, `acessorios_*`) **não entram** no `SLIDE_FILE_MAP` — o `templateFile` vem diretamente no request.

### `_build_context`

Constrói o dicionário de substituição de placeholders:

- Campos globais: datas formatadas, sumário (texto corrido ou numerado para multi-produto)
- Campos do grupo de produto: todos os `group.values` + derivados calculados:
  - `travamento_descricao` — ex: "Instalação de travamento superior e inferior"
  - `alambrado_descricao` / `descricao_alambrado` — ex: "Sistema gaiola: alambrado com fundo e laterais de 4,00m;"
  - `dimensoes_portoes` — ex: "2,00m x 1,20m"
  - `area_alambrado`, `area_playcushion`, `qtde_iluminacao`, `qtde_eva`
  - `galvanizacao` — mapeado de `"fogo"` → `"a fogo"`
  - `sistema_alambrado` — mapeado de `"gaiola"` → `"Gaiola"`

### `_copy_slide`

Copia um slide preservando imagens: para cada relação de imagem (`r:embed`) na origem, cria uma nova `ImagePart` com nome único (`/ppt/media/m{counter}{ext}`) e remapeia os atributos no XML copiado via deepcopy.

### Slides dinâmicos (`compose_fechamentos`, `compose_acessorios`)

Composição vertical: abre o slide base como canvas, lê cada componente (`secao_*.pptx`), mede sua altura real (borda inferior dos shapes) e cola os elements com deslocamento Y acumulado via `_shift_shape_top`. Após montar todos os shapes, chama `_replace_placeholders` no slide resultante.

### `_replace_placeholders`

Percorre todos os shapes do slide (text frames e tabelas). Para cada parágrafo com `{{`, concatena o texto de todos os runs, aplica as substituições e recoloca tudo no `runs[0]`, limpando os runs subsequentes — preserva a formatação (fonte, tamanho, cor) do primeiro run.

Aceita ambas as formas: `{{ chave }}` e `{{chave}}`.

---

## Placeholders disponíveis nos templates

```
{{ nome_razao_social }}        {{ nome_contato }}            {{ telefone }}
{{ email }}                    {{ endereco_obra }}            {{ local_obra }}
{{ numero_proposta }}          {{ data_solicitacao }}         {{ data_envio }}
{{ sumario }}

{{ quantity }}                 {{ area_total_fmt }}           {{ area_fmt }}
{{ area_tela_superior }}       {{ area_playcushion }}         {{ area_alambrado }}
{{ qtde_iluminacao }}          {{ qtde_tela_superior }}       {{ qtde_eva }}
{{ qtde_acessorios_esportivos }}

{{ kit_saibro }}               {{ cor_tela_superior }}
{{ galvanizacao }}             {{ sistema_alambrado }}        {{ sistema_alabrado }}
{{ travamento_descricao }}     {{ alambrado_descricao }}      {{ descricao_alambrado }}
{{ dimensoes_portoes }}        {{ acessorios_esportivos_descricao }}

+ qualquer chave de group.values (ex: {{ largura }}, {{ comprimento }}, {{ possui_alambrado }})
```

> `{{ sistema_alabrado }}` é um alias de `{{ sistema_alambrado }}` — existe para compatibilidade com um typo em `investimento_piso_asfaltico.pptx` (quadra_poli).

---

## Estrutura de arquivos de slides

```
slides/
├── global/
│   ├── capa.pptx                      # slide de abertura
│   ├── sumario.pptx
│   ├── dados_cliente.pptx
│   ├── sobre_empresa.pptx
│   ├── pilares.pptx
│   ├── portfolio.pptx
│   ├── parceiros.pptx
│   ├── condicoes_pagamento_direto_a.pptx
│   ├── condicoes_pagamento_direto_b.pptx
│   ├── condicoes_pagamento_playpiso.pptx
│   ├── prazos_garantia.pptx
│   ├── regras_contratada.pptx
│   ├── regras_contratante.pptx
│   ├── consideracoes_gerais.pptx
│   └── encerramento.pptx
│
├── beach_tenis/
│   ├── hero.pptx
│   ├── areia_rio.pptx
│   ├── areia_quartzo.pptx
│   ├── protecao_eva.pptx
│   ├── acessorio.pptx
│   ├── investimento.pptx
│   ├── fechamentos_base.pptx          # canvas para compose_fechamentos
│   ├── secao_alambrado.pptx
│   ├── secao_iluminacao.pptx
│   ├── secao_tela_superior.pptx
│   └── secao_tela_sombreamento.pptx
│
├── quadra_tenis/
│   ├── hero_{piso_asfaltico,saibro,grama}.pptx
│   ├── specs_{piso_asfaltico,saibro,grama}.pptx
│   ├── playcushion.pptx
│   ├── cores_piso_asfaltico.pptx
│   ├── detalhe_construtivo.pptx       # com playcushion
│   ├── detalhe_construtivo_sem_playcushion.pptx
│   ├── kit_saibro_quadra_tenis.pptx
│   ├── acessorio_piso_asfaltico.pptx
│   ├── investimento_{piso_asfaltico,saibro,grama}.pptx
│   ├── fechamentos_base.pptx
│   └── secao_{alambrado,iluminacao,tela_superior,tela_sombreamento}.pptx
│
└── quadra_poli/
    ├── hero_piso_asfaltico.pptx
    ├── specs_piso_asfaltico.pptx
    ├── cores_piso_asfaltico.pptx
    ├── investimento_piso_asfaltico.pptx
    ├── acessorios_base.pptx           # canvas para compose_acessorios
    ├── fechamentos_base.pptx
    ├── secao_alambrado.pptx
    ├── secao_iluminacao.pptx
    ├── secao_tela_superior.pptx
    ├── secao_tela_sombreamento.pptx
    └── secao_acessorio_{basquete_adulto_metalica,basquete_adulto_hidraulica,
                          basquete_adulto_comum,basquete_juvenil,
                          volei,tenis,futsal_padrao,futsal_mini_trave}.pptx
```

---

## Como adicionar um novo slide estático

1. Criar o arquivo `.pptx` em `slides/<produto>/nome.pptx`
2. Adicionar a entrada em `SLIDE_FILE_MAP` em `slide_merger.py`:
   ```python
   "meu_novo_slide": "quadra_tenis/meu_novo_slide.pptx",
   ```
3. Adicionar o `slideId` e o `templateFile` no `slideRegistry.ts` do frontend

## Como adicionar um novo produto

1. Criar o diretório `slides/<novo_produto>/` com os arquivos de template
2. Adicionar o mapeamento em `_PRODUCT_SLIDES_DIR` (`slide_merger.py`):
   ```python
   "meu_produto": "meu_produto_dir",
   ```
3. Adicionar as entradas de slides em `SLIDE_FILE_MAP`
4. Se o produto tiver **fechamentos**: criar `fechamentos_base.pptx` e `secao_{alambrado,...}.pptx`
5. Se o produto tiver **acessórios**: criar `acessorios_base.pptx`, `secao_acessorio_*.pptx` e adicionar a lógica em `_get_active_acessorios_sections`
6. Adicionar os campos derivados necessários em `_build_context` se os placeholders do produto exigirem formatação especial

---

## `slide_builders.py`

Contém construtores programáticos de slides (`build_dados_cliente`, `build_sumario`, `build_investimento`). **Não são chamados pelo fluxo principal** — o serviço usa exclusivamente a abordagem de templates `.pptx`. Mantidos como referência caso seja necessário gerar slides via código no futuro.

---

## Testes manuais

```bash
# Verificar se o serviço está no ar
curl http://localhost:8000/health

# Ver slides disponíveis
curl http://localhost:8000/slides-disponiveis

# Gerar proposta a partir de um arquivo de payload
curl -X POST http://localhost:8000/gerar-proposta \
  -H "Content-Type: application/json" \
  -d @payload-exemplo.json \
  --output proposta.pptx
```

A documentação interativa da API está disponível em `http://localhost:8000/docs` (Swagger UI gerado automaticamente pelo FastAPI).
