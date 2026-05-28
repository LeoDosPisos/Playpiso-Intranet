# pptx-generator-service

Microservico FastAPI responsavel por gerar propostas comerciais em `.pptx` para a Playpiso.

Ele recebe do frontend uma lista ordenada de slides, dados globais do cliente e grupos de produtos. A partir disso, abre templates `.pptx`, monta slides dinamicos quando necessario, substitui placeholders e devolve uma apresentacao final em bytes.

---

## 1. Visao Geral

Este repositorio nao gera a apresentacao a partir de HTML ou PDF. O fluxo principal usa templates reais do PowerPoint armazenados em `slides/`.

Em termos praticos:

1. O frontend decide quais slides entram na proposta e em qual ordem.
2. O backend valida apenas o contrato basico do request via Pydantic.
3. O backend abre cada template `.pptx` correspondente.
4. Os placeholders no formato `{{ chave }}` sao substituidos por valores do request ou por valores derivados.
5. Alguns slides especiais sao compostos dinamicamente, como fechamentos, acessorios e investimento.
6. O arquivo final e salvo em memoria e retornado pela API.

O servico e especialmente util porque preserva layout, imagens, fontes e elementos visuais criados no PowerPoint, enquanto automatiza os dados comerciais variaveis.

---

## 2. Como Executar Localmente

Entre na pasta do servico:

```bash
cd Backend/services/pptx-generator-service
```

Crie e ative um ambiente virtual:

```bash
python -m venv .venv
source .venv/bin/activate
```

Instale as dependencias:

```bash
pip install -r requirements.txt
```

Suba a API:

```bash
uvicorn main:app --reload --port 8000
```

A documentacao interativa fica em:

```text
http://localhost:8000/docs
```

### Variaveis de ambiente

| Variavel | Padrao | Uso |
|---|---|---|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Lista de origins permitidos pelo CORS, separados por virgula. |
| `PORT` | `8000` | Usado pelo ambiente de deploy quando aplicavel. |

---

## 3. Endpoints

| Metodo | Endpoint | Descricao |
|---|---|---|
| `GET` | `/health` | Verifica se o servico esta no ar. |
| `GET` | `/slides-disponiveis` | Retorna os `slideId`s estaticos que possuem template em disco. |
| `POST` | `/gerar-proposta` | Gera e retorna a proposta `.pptx`. |

### `GET /health`

Resposta esperada:

```json
{ "status": "ok" }
```

### `GET /slides-disponiveis`

Retorna uma lista de `slideId`s registrados em `slide_registry.py` cujo arquivo `.pptx` existe em `slides/`.

Exemplo:

```json
[
  "capa",
  "dados_cliente",
  "sumario",
  "hero_beach_tenis"
]
```

Observacao: slides dinamicos como `fechamentos_*`, `acessorios_*` e `investimento_*` podem nao aparecer nessa lista porque sao resolvidos por compositores especificos no request.

### `POST /gerar-proposta`

Retorna o arquivo `.pptx` com:

```text
Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation
Content-Disposition: attachment; filename="proposta.pptx"
```

Teste manual:

```bash
curl -X POST http://localhost:8000/gerar-proposta \
  -H "Content-Type: application/json" \
  -d @payload-exemplo.json \
  --output proposta.pptx
```

---

## 4. Payload de Geracao

O formato principal usa o campo `slides`, uma lista rica em que cada item informa o slide, o template e, quando necessario, metadados de composicao.

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
      "templateFile": "slides/_comum/fechamentos_base.pptx",
      "dynamic": "fechamentos",
      "groupIndex": 0
    },
    {
      "slideId": "investimento_piso_asfaltico_quadra_tenis",
      "templateFile": "slides/global/investimento_base.pptx",
      "dynamic": "investimento",
      "groupIndex": 0
    }
  ],
  "globalValues": {
    "nome_razao_social": "Condominio Exemplo",
    "nome_contato": "Maria Silva",
    "cpf_cnpj": "12345678000199",
    "endereco_cliente": "Rua Exemplo, 100",
    "local_obra": "Sao Paulo, SP",
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
        "comprimento_alambrado_laterais": 23.77,
        "altura_alambrado_laterais": 4.0,
        "comprimento_alambrado_fundos": 10.97,
        "galvanizacao": "fogo",
        "possui_iluminacao": false,
        "travamento": ["travamento_superior", "travamento_inferior"]
      },
      "sumarioText": "Quadra de Tenis - Piso Asfaltico com PlayCushion",
      "investimentoRows": []
    }
  ]
}
```

### Campos de `slides`

| Campo | Tipo | Obrigatorio | Descricao |
|---|---:|---:|---|
| `slideId` | string | Sim | Identificador logico do slide. |
| `templateFile` | string | Sim | Caminho enviado pelo frontend, normalmente iniciando com `slides/`. |
| `dynamic` | string ou null | Nao | Define um compositor especial: `fechamentos`, `acessorios` ou `investimento`. |
| `groupIndex` | int ou null | Nao | Indice do grupo de produto em `productGroups`. Necessario para slides de produto em propostas multi-produto. |

### Campos de `globalValues`

| Campo | Descricao |
|---|---|
| `nome_razao_social` | Nome ou razao social do cliente. |
| `nome_contato` | Pessoa de contato. |
| `cpf_cnpj` | Documento do cliente. O backend deriva `tipo_doc` e `n_doc`. |
| `endereco_cliente` | Endereco cadastral do cliente. |
| `local_obra` | Local onde a obra sera realizada. |
| `telefone` | Telefone de contato. |
| `email` | Email de contato. |
| `numero_proposta` | Numero da proposta. Tambem fica disponivel como `np`. |
| `data_solicitacao` | Data no formato `YYYY-MM-DD`. Tambem fica disponivel como `ds`. |
| `data_envio` | Data no formato `YYYY-MM-DD`. Tambem fica disponivel como `de`. |

As datas sao convertidas para `DD/MM/YYYY`.

### Campos de `productGroups`

| Campo | Descricao |
|---|---|
| `productId` | Produto principal. Exemplos: `quadra_tenis`, `quadra_poliesportiva`, `beach_tenis`, `padel`, `pickleball`, `softplay`. |
| `quantity` | Quantidade do produto no grupo. |
| `variantId` | Variante comercial. Exemplos: `piso_asfaltico`, `assoalho`, `poliuretano`, `saibro`. |
| `values` | Dados especificos do formulario do produto. |
| `sumarioText` | Texto usado no slide de sumario. |
| `investimentoRows` | Campo legado/compatibilidade; a tabela dinamica atual usa catalogos Python em `investimento/products/`. |

### Formato legado

Ainda existe suporte ao formato antigo com `slideIds`, mas ele deve ser evitado em novas integracoes:

```json
{
  "slideIds": ["capa", "dados_cliente", "sumario"],
  "globalValues": {},
  "productGroups": []
}
```

No formato legado, o contexto de produto e plano e os ultimos grupos podem sobrescrever valores dos anteriores. Para propostas multi-produto, use sempre `slides` com `groupIndex`.

---

## 5. Arquitetura do Fluxo

O ponto de entrada da API esta em `main.py`. A montagem da apresentacao acontece em `slide_merger.py`.

Fluxo simplificado:

```text
POST /gerar-proposta
  |
  v
main.py
  - valida o body com modelos Pydantic
  - chama build_presentation(req)
  |
  v
slide_merger.build_presentation
  - cria contexto global
  - cria contexto separado para cada productGroup
  - percorre req.slides na ordem recebida
  |
  +-- slide normal
  |     abre o template .pptx
  |     copia slides para a apresentacao final
  |     substitui placeholders
  |
  +-- dynamic = "fechamentos"
  |     monta secoes de alambrado, iluminacao, tela superior e sombreamento
  |
  +-- dynamic = "acessorios"
  |     monta secoes de acessorios esportivos ativos
  |
  +-- dynamic = "investimento"
        monta tabela de investimento a partir do catalogo do produto
```

Cada slide recebe o contexto correto:

- Slides globais usam apenas contexto global quando ha varios produtos.
- Slides de produto usam `base_ctx + group_ctxs[groupIndex]`.
- Quando existe apenas um grupo, slides sem `groupIndex` tambem recebem o contexto desse grupo.

Essa separacao evita que placeholders de um produto sejam preenchidos com dados de outro.

---

## 6. Modulos e Responsabilidades

| Arquivo/Pasta | Responsabilidade |
|---|---|
| `main.py` | Configura FastAPI, CORS, logs JSON, modelos Pydantic e endpoints HTTP. |
| `slide_merger.py` | Orquestra a criacao do `.pptx` final e decide qual compositor usar para cada slide. |
| `slide_registry.py` | Registra slides estaticos, resolve caminhos em `slides/` e informa slides disponiveis. |
| `context_builder.py` | Converte `globalValues` e `productGroups` em dicionarios de placeholders. |
| `placeholder_engine.py` | Substitui `{{ chave }}` em textos e tabelas de cada slide. |
| `slide_copier.py` | Copia slides preservando XML, imagens, backgrounds e relacoes internas. |
| `dynamic_composer.py` | Compoe slides dinamicos de fechamentos e acessorios. |
| `investimento/` | Define e renderiza a tabela dinamica de investimento por produto/variante. |
| `slides/` | Armazena todos os templates `.pptx` usados pelo servico. |
| `tests/` | Testes unitarios e de integracao usando templates reais. |
| `slide_builders.py` | Codigo antigo de construcao programatica de slides. Nao faz parte do fluxo principal atual. |

---

## 7. Contexto e Placeholders

Os templates usam placeholders no formato:

```text
{{ nome_razao_social }}
{{data_envio}}
```

Espacos dentro das chaves sao opcionais.

### Placeholders globais comuns

```text
{{ nome_razao_social }}
{{ nome_contato }}
{{ tipo_doc }}
{{ n_doc }}
{{ endereco_cliente }}
{{ local_obra }}
{{ telefone }}
{{ email }}
{{ numero_proposta }}
{{ data_solicitacao }}
{{ data_envio }}
{{ np }}
{{ ds }}
{{ de }}
{{ sumario }}
```

### Placeholders de produto comuns

Todos os campos presentes em `group.values` viram placeholders. Alem deles, `context_builder.py` calcula campos derivados, como:

```text
{{ quantity }}
{{ area_total_fmt }}
{{ area_fmt }}
{{ area_alambrado }}
{{ area_playcushion }}
{{ area_tela_superior }}
{{ qtde_iluminacao }}
{{ qtde_tela_superior }}
{{ qtde_eva }}
{{ qtde_acessorios_esportivos }}
{{ travamento_descricao }}
{{ alambrado_descricao }}
{{ descricao_alambrado }}
{{ tela_sombreamento_descricao }}
{{ descricao_tela_sombreamento }}
{{ dimensoes_portoes }}
{{ galvanizacao }}
{{ sistema_alambrado }}
{{ sistema_alabrado }}
{{ cor_tela_superior }}
{{ cor_tela_sombreamento }}
{{ kit_saibro }}
{{ espessura_total }}
```

`{{ sistema_alabrado }}` existe por compatibilidade com typo em template antigo.

### Como a substituicao funciona

`placeholder_engine.py` percorre:

- caixas de texto;
- paragrafo por paragrafo;
- celulas de tabelas;
- todos os runs de texto de cada paragrafo.

Quando encontra um placeholder conhecido no contexto, substitui pelo valor correspondente. Placeholders desconhecidos permanecem no slide, o que ajuda a identificar erro de nome em template ou payload.

---

## 8. Tipos de Slide

### Slide estatico

E o caso mais simples. O backend abre o arquivo informado em `templateFile`, copia o slide e substitui placeholders.

Exemplo:

```json
{
  "slideId": "dados_cliente",
  "templateFile": "slides/global/dados_cliente.pptx"
}
```

### Slide dinamico de fechamentos

Usa `dynamic: "fechamentos"`.

O compositor verifica flags em `values`:

| Flag | Secao |
|---|---|
| `possui_alambrado` | `secao_alambrado.pptx` |
| `possui_iluminacao` | `secao_iluminacao.pptx` |
| `possui_tela_superior` | `secao_tela_superior.pptx` |
| `possui_tela_sombreamento` | `secao_tela_sombreamento.pptx` |

As secoes ativas sao inseridas verticalmente em um slide base. Ate 3 secoes ficam em uma pagina; quando ha 4, o conteudo e dividido em 2 slides.

O resolvedor tenta primeiro o arquivo especifico do produto. Se nao existir, usa o bloco compartilhado em `slides/_comum/`.

### Slide dinamico de acessorios

Usa `dynamic: "acessorios"`.

O compositor decide as secoes ativas de acordo com o produto:

- `quadra_poliesportiva`: basquete adulto, basquete juvenil, volei, tenis e futsal.
- `padel`: acessorio oficial de padel.
- `pickleball`: rede de pickleball.

As secoes sao inseridas em `acessorios_base.pptx`, com ate 4 secoes por pagina.

### Slide dinamico de investimento

Usa `dynamic: "investimento"`.

O backend sempre parte de:

```text
slides/global/investimento_base.pptx
```

Esse template precisa conter a ancora:

```text
{{tabela_investimento}}
```

O compositor remove essa ancora e cria uma tabela com:

- cabecalho;
- linhas de itens aplicaveis;
- linha final de valor total.

As descricoes, quantidades, unidades e condicoes de exibicao vem dos catalogos em `investimento/products/`.

---

## 9. Registro de Slides e Templates

Os templates ficam em:

```text
slides/
```

Estrutura principal:

```text
slides/
  global/
  _comum/
  beach_tenis/
  quadra_tenis/
  quadra_poli/
  padel/
  pickleball/
  softplay/
```

### `SLIDE_FILE_MAP`

Slides estaticos sao registrados em `slide_registry.py`:

```python
SLIDE_FILE_MAP = {
    "capa": "global/capa.pptx",
    "hero_padel": "padel/hero.pptx",
}
```

Esse mapa alimenta `/slides-disponiveis` e o formato legado `slideIds`.

### `_PRODUCT_SLIDES_DIR`

Tambem em `slide_registry.py`, esse mapa converte `productId` em diretorio de templates:

```python
_PRODUCT_SLIDES_DIR = {
    "quadra_poliesportiva": "quadra_poli",
    "quadra_tenis": "quadra_tenis"
}
```

Ele e usado principalmente pelos compositores dinamicos.

---

## 10. Catalogo de Investimento

A tabela de investimento nao depende mais de linhas fixas em templates especificos por produto. Ela e montada por codigo.

Arquivos principais:

```text
investimento/
  builder.py
  catalog.py
  products/
    beach_tenis.py
    padel.py
    pickleball.py
    quadra_poli.py
    quadra_tenis.py
    softplay.py
```

Cada produto exporta uma lista `ITEMS` com objetos `InvestItem`.

Um item define:

| Campo | Uso |
|---|---|
| `id` | Identificador interno da linha. |
| `descricao_runs` | Texto da descricao, com suporte a trechos em negrito, italico, cor e tamanho. |
| `unidade` | Unidade exibida na coluna `Unid.`. |
| `qtde_resolver` | Funcao que calcula a quantidade a partir de `values`. |
| `applies_when` | Funcao que decide se a linha entra ou nao na tabela. |
| `variant_filter` | Limita o item a variantes especificas. |
| `descricao_resolver` | Opcional. Gera descricoes dinamicas quando `descricao_runs` fixo nao basta. |

Se um produto nao tiver catalogo implementado, `compose_investimento` levanta `NotImplementedError` e `slide_merger.py` tenta cair para o template legado informado no request.

---

## 11. Como Adicionar um Novo Slide Estatico

1. Crie o template:

```text
slides/<produto_ou_global>/<nome>.pptx
```

2. Adicione o `slideId` em `slide_registry.py`:

```python
"meu_slide": "quadra_tenis/meu_slide.pptx",
```

3. Garanta que o frontend envie esse slide no payload:

```json
{
  "slideId": "meu_slide",
  "templateFile": "slides/quadra_tenis/meu_slide.pptx",
  "groupIndex": 0
}
```

4. Se o template usa placeholders novos, confirme se eles ja existem em `globalValues`, `group.values` ou `context_builder.py`.

5. Rode os testes.

---

## 12. Como Adicionar um Novo Produto

1. Crie a pasta de templates:

```text
slides/<novo_produto>/
```

2. Registre o produto em `_PRODUCT_SLIDES_DIR`:

```python
"_novo_produto": "novo_produto",
```

3. Registre os slides estaticos necessarios em `SLIDE_FILE_MAP`.

4. Se houver fechamentos, crie:

```text
fechamentos_base.pptx
secao_alambrado.pptx
secao_iluminacao.pptx
secao_tela_superior.pptx
secao_tela_sombreamento.pptx
```

Voce pode criar os arquivos no diretorio do produto ou reaproveitar os blocos de `slides/_comum/`.

5. Se houver acessorios, crie:

```text
acessorios_base.pptx
secao_acessorio_<nome>.pptx
```

Depois ajuste `_get_active_acessorios_sections` em `dynamic_composer.py`.

6. Se houver investimento dinamico, crie um catalogo em:

```text
investimento/products/<novo_produto>.py
```

E registre o import em `investimento/catalog.py`.

7. Se houver placeholders derivados especificos, implemente em `context_builder.py`.

8. Adicione testes de contexto e, se possivel, teste de geracao real do `.pptx`.

---

## 13. Como Adicionar um Placeholder

Existem tres caminhos:

### 1. Placeholder vindo do formulario global

Adicione o campo em `globalValues` no frontend e mapeie em `_build_base_context`.

Exemplo:

```python
"cidade_cliente": global_values.get("cidade_cliente", "")
```

### 2. Placeholder vindo do formulario do produto

Se o campo ja esta em `group.values`, ele fica automaticamente disponivel porque `_build_group_context` copia todas as chaves de `values`.

Exemplo:

```json
"values": {
  "cor_piso": "Azul"
}
```

Permite usar:

```text
{{ cor_piso }}
```

### 3. Placeholder calculado

Quando o valor precisa de formatacao ou regra comercial, implemente em `context_builder.py`.

Exemplo:

```python
ctx["area_total_fmt"] = _fmt_numero(values.get("area_total"))
```

---

## 14. Boas Praticas para Templates `.pptx`

- Use placeholders simples: `{{ chave }}`.
- Evite quebrar um mesmo placeholder em varios elementos de texto.
- Prefira um unico estilo para o placeholder inteiro; a substituicao preserva principalmente a formatacao do primeiro run.
- Revise se o nome do placeholder bate exatamente com o contexto.
- Para investimento dinamico, mantenha a ancora `{{tabela_investimento}}` no espaco onde a tabela deve nascer.
- Ao criar blocos reutilizaveis de fechamentos/acessorios, mantenha os elementos agrupados visualmente dentro do limite do slide.
- Depois de editar templates no PowerPoint, gere uma proposta real e abra o arquivo para conferir layout.

---

## 15. Testes

Os testes usam `pytest` e, em varios casos, abrem templates `.pptx` reais.

Rodar tudo:

```bash
pytest tests/ -v
```

Com cobertura:

```bash
pytest tests/ --cov=. --cov-report=term-missing
```

Principais coberturas atuais:

- construcao de contexto global e por produto;
- isolamento de contexto entre produtos;
- substituicao de placeholders;
- geracao de apresentacoes reais;
- composicao da tabela de investimento;
- estilo comercial da tabela de investimento.

---

## 16. Checklist de Desenvolvimento

Antes de enviar uma alteracao:

1. Rode os testes:

```bash
pytest tests/ -v
```

2. Se alterou templates, gere um `.pptx` real pela API.

3. Abra o `.pptx` e confira:

- ordem dos slides;
- placeholders remanescentes;
- imagens;
- tabelas;
- quebras de linha;
- fontes e cores;
- slides multi-produto usando dados do grupo correto.

4. Se adicionou produto, variante ou regra comercial, inclua teste cobrindo o caso.

---

## 17. Deploy

O servico esta preparado para rodar como aplicacao FastAPI/uvicorn.

O `Dockerfile` instala `requirements.txt`, copia o servico e inicia:

```bash
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
```

Em deploy, garanta que a pasta `slides/` esteja presente na imagem. Sem os templates, o servico ate sobe, mas a geracao ficara incompleta ou retornara slides de placeholder para arquivos ausentes.

---

## 18. Troubleshooting

### O slide aparece como `[Template pendente: ...]`

O arquivo informado em `templateFile` nao foi encontrado. Verifique:

- caminho enviado pelo frontend;
- existencia do arquivo em `slides/`;
- registro em `slide_registry.py`, quando for slide estatico.

### Um placeholder ficou no PowerPoint final

O nome nao existe no contexto usado por aquele slide. Verifique:

- typo no template;
- campo ausente em `globalValues`;
- campo ausente em `group.values`;
- `groupIndex` incorreto ou ausente em slide de produto;
- placeholder derivado ainda nao implementado em `context_builder.py`.

### O slide de investimento saiu sem tabela

Verifique se o template base contem exatamente:

```text
{{tabela_investimento}}
```

Tambem confira se o catalogo do produto retorna itens aplicaveis para o `productId`, `variantId` e `values` enviados.

### Fechamentos ou acessorios nao aparecem

Verifique se as flags booleanas em `values` estao ativas e se os arquivos `secao_*.pptx` existem no diretorio do produto ou em `slides/_comum/`.

### Projetos realizados por produto/variante (opcional)

Para incluir um bloco de "projetos realizados" antes do encerramento, salve `.pptx` em uma das duas convencoes (a busca tem fallback):

1. **Especifico por variante** (preferido quando existe): `slides/<product>/projetos/<variantId>/*.pptx`
   - Ex.: `slides/quadra_tenis/projetos/piso_asfaltico/01_condominio_x.pptx`
2. **Comum por produto** (fallback): `slides/<product>/projetos/*.pptx`
   - Ex.: `slides/quadra_tenis/projetos/01_padrao.pptx`

Se a pasta da variante tiver pelo menos um `.pptx`, ela e usada (nivel produto NAO concatena). Se vazia ou ausente, cai para o nivel produto. Sem nenhum dos dois, o bloco e silenciosamente omitido. Arquivos sao incluidos em ordem alfabetica; o frontend deduplica por `(productId, variantId)` e insere a entrada entre `consideracoes_gerais` e `encerramento`.

### Dados de outro produto aparecem no slide

Use o formato `slides` e envie `groupIndex` em todos os slides especificos de produto. O formato legado `slideIds` nao e indicado para propostas multi-produto.
