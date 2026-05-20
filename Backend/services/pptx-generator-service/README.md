# pptx-generator-service

Microservico responsavel por gerar propostas comerciais da Playpiso em formato PowerPoint (`.pptx`).

Ele recebe dados preenchidos no formulario comercial, monta uma apresentacao a partir de modelos `.pptx` existentes e devolve o arquivo final para download.

## Visao geral para equipes nao tecnicas

O servico funciona como um montador automatico de propostas:

1. O usuario preenche a proposta no sistema web.
2. O frontend envia os dados da proposta para este microservico.
3. O microservico abre modelos de PowerPoint prontos.
4. Ele substitui informacoes variaveis, como nome do cliente, contato, endereco, datas e sumario.
5. Ele adiciona os slides do produto contratado.
6. Ele adiciona os slides finais da proposta.
7. Ele devolve um arquivo `.pptx` pronto para baixar.

Na implementacao atual, a proposta final e montada em tres blocos:

- `slides/head.pptx`: abertura, apresentacao institucional, dados do cliente e sumario.
- `slides/products/*.pptx`: bloco de slides do produto selecionado.
- `slides/tail.pptx`: condicoes finais, regras, encerramento e slides finais.

## Como executar localmente

Instale as dependencias:

```bash
cd pptx-generator-service
pip install -r requirements.txt
```

Inicie a API:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

O frontend esta configurado para chamar essa API em `http://localhost:8000`, conforme `vite-project/.env.development`.

## Dependencias

As dependencias estao em `requirements.txt`:

- `fastapi`: cria a API HTTP.
- `uvicorn[standard]`: servidor local/ASGI usado para executar a API.
- `python-pptx`: biblioteca que le, copia, edita e salva arquivos PowerPoint.

## Endpoints

### `GET /health`

Endpoint simples para verificar se o servico esta no ar.

Implementacao: `main.py`, funcao `health`.

Resposta:

```json
{
  "status": "ok"
}
```

### `GET /produtos-disponiveis`

Endpoint que informa quais produtos/variantes possuem template `.pptx` disponivel para geracao.

Implementacao: `main.py`, funcao `produtos_disponiveis`.

A resposta e calculada a partir de `PRODUCT_FILE_MAP` e da existencia real dos arquivos em `slides/products/`.

Resposta esperada no estado atual:

```json
[
  {
    "productId": "beach_tenis",
    "variantIds": ["padrao"]
  },
  {
    "productId": "quadra_tenis",
    "variantIds": ["piso_asfaltico", "saibro"]
  }
]
```

### `POST /gerar-proposta`

Endpoint principal. Recebe os dados da proposta e retorna um arquivo `.pptx`.

Implementacao: `main.py`, funcao `gerar_proposta`.

O endpoint:

1. Recebe um payload validado por modelos Pydantic.
2. Valida se todos os produtos/variantes possuem template disponivel.
3. Chama `build_presentation(req)`, em `slide_merger.py`.
4. Retorna os bytes do PowerPoint com o tipo MIME correto.
5. Define o nome tecnico do anexo como `proposta.pptx`.

Resposta:

- Conteudo binario de PowerPoint.
- `Content-Type`: `application/vnd.openxmlformats-officedocument.presentationml.presentation`.
- `Content-Disposition`: `attachment; filename="proposta.pptx"`.

Se algum produto/variante nao tiver template disponivel, a API retorna `422` e nao gera o arquivo.

Exemplo de erro:

```json
{
  "detail": {
    "message": "Um ou mais produtos nao possuem template PPTX disponivel.",
    "unsupportedProductGroups": [
      {
        "index": 0,
        "productId": "quadra_tenis",
        "variantId": "grama"
      }
    ]
  }
}
```

## Contrato do payload

Os modelos de entrada estao declarados em `main.py`.

Estrutura esperada:

```json
{
  "slideIds": ["capa", "dados_cliente", "sumario"],
  "globalValues": {
    "nome_razao_social": "Cliente Exemplo",
    "nome_contato": "Maria Silva",
    "endereco_obra": "Rua Exemplo, 100",
    "local_obra": "Condominio Exemplo",
    "telefone": "(11) 99999-9999",
    "email": "cliente@email.com",
    "numero_proposta": "P001",
    "data_solicitacao": "01/05/2026",
    "data_envio": "12/05/2026"
  },
  "productGroups": [
    {
      "productId": "beach_tenis",
      "quantity": 1,
      "variantId": "padrao",
      "values": {
        "largura": 10,
        "comprimento": 20,
        "area_total": 200
      },
      "sumarioText": "1 quadra de Beach Tennis...",
      "investimentoRows": ["Quadra de Beach Tennis", "Acessorios"]
    }
  ]
}
```

Campos principais:

- `slideIds`: lista de slides resolvida pelo frontend. No codigo atual do microservico, esse campo e validado pela API, mas a montagem em `slide_merger.py` usa principalmente `productGroups`.
- `globalValues`: dados globais da proposta, usados no bloco inicial.
- `productGroups`: lista de produtos/grupos selecionados na proposta.
- `sumarioText`: texto ja renderizado pelo frontend para aparecer no sumario.
- `investimentoRows`: linhas de investimento calculadas pelo frontend. Atualmente existem builders auxiliares para esse uso, mas o fluxo principal copia os modelos prontos de produto.

## Integracao com o frontend

O frontend monta e envia o payload em:

`vite-project/src/route/FormPropostaComercial/generation/buildPresentation.ts`

Fluxo no frontend:

1. `resolveSlideList(payload)` calcula a lista de slides esperados.
2. `renderSumarioText(...)` gera o texto do sumario de cada produto.
3. `resolveInvestimentoRows(...)` calcula as linhas de investimento.
4. `fetch(.../gerar-proposta...)` envia o payload para a API.
5. A resposta e tratada como `blob`.
6. O navegador baixa o arquivo como `Proposta Playpiso - NomeCliente.pptx`.

Observacao tecnica: apesar de o frontend enviar `slideIds`, o `slide_merger.py` atual nao monta a apresentacao slide a slide a partir dessa lista. Ele monta a proposta por blocos: head, produtos e tail.

## Arquitetura dos arquivos

```text
pptx-generator-service/
  main.py
  slide_merger.py
  slide_builders.py
  requirements.txt
  slides/
    head.pptx
    tail.pptx
    products/
      qbt.pptx
      qtpa.pptx
      qts.pptx
```

### `main.py`

Responsabilidades:

- Criar a aplicacao FastAPI.
- Configurar CORS para o frontend local.
- Declarar os modelos de entrada `ProductGroupRequest` e `GenerateRequest`.
- Expor os endpoints `/health` e `/gerar-proposta`.
- Retornar o arquivo PowerPoint como resposta HTTP.

Pontos relevantes do codigo:

- `app = FastAPI(...)`: cria a API.
- `CORSMiddleware`: permite chamadas vindas de `localhost:5173` e `127.0.0.1:5173`.
- `ProductGroupRequest`: representa um produto/grupo dentro da proposta.
- `GenerateRequest`: representa o payload completo.
- `gerar_proposta`: chama o motor de montagem e devolve o `.pptx`.

### `slide_merger.py`

Responsavel pela montagem real da apresentacao.

Fluxo principal na funcao `build_presentation(req)`:

1. Cria uma apresentacao vazia com `Presentation()`.
2. Define tamanho widescreen `13.33 x 7.5`.
3. Adiciona o bloco inicial usando `HEAD_PATH`.
4. Percorre `req.productGroups`.
5. Para cada produto, consulta `PRODUCT_FILE_MAP`.
6. Se houver modelo correspondente, copia os slides desse `.pptx`.
7. Se nao houver modelo, cria um slide de placeholder.
8. Adiciona o bloco final usando `TAIL_PATH`.
9. Salva a apresentacao em memoria com `BytesIO`.
10. Retorna os bytes do arquivo final.

Mapa de produtos suportados:

```python
PRODUCT_FILE_MAP = {
    ("beach_tenis", "padrao"): "qbt.pptx",
    ("quadra_tenis", "piso_asfaltico"): "qtpa.pptx",
    ("quadra_tenis", "saibro"): "qts.pptx",
}
```

Isso significa que, atualmente, apenas esses pares de produto/variante possuem modelo conectado ao gerador:

- Beach Tenis / Padrao -> `slides/products/qbt.pptx`
- Quadra de Tenis / Piso Asfaltico -> `slides/products/qtpa.pptx`
- Quadra de Tenis / Saibro -> `slides/products/qts.pptx`

Qualquer outro produto ou variante e rejeitado pelo endpoint `/gerar-proposta` com erro `422`.

Funcoes auxiliares importantes:

- `_assemble_head(...)`: copia todos os slides de `head.pptx` e substitui placeholders.
- `_add_from_file(...)`: copia todos os slides de um arquivo `.pptx` para a apresentacao final.
- `get_available_products(...)`: lista produtos/variantes com arquivo `.pptx` existente.
- `validate_product_groups(...)`: rejeita grupos sem template disponivel.
- `_build_head_context(...)`: transforma `globalValues` e `productGroups` em dados para substituir no head.
- `_replace_placeholders(...)`: percorre textos e tabelas de um slide.
- `_replace_in_paragraph(...)`: substitui placeholders no formato `{{ chave }}` ou `{{chave}}`.
- `_add_placeholder_slide(...)`: cria um slide de aviso quando nao existe template.

### `slide_builders.py`

Contem construtores programaticos de slides usando `python-pptx`.

Funcoes disponiveis:

- `build_dados_cliente(...)`: cria um slide simples de dados do cliente.
- `build_sumario(...)`: cria um slide simples de sumario.
- `build_investimento(...)`: cria um slide simples de investimento com tabela.

No fluxo atual de `slide_merger.py`, esse arquivo nao e chamado. Ele funciona como suporte/legado para gerar slides via codigo caso a equipe opte por nao usar um modelo `.pptx` pronto.

## Como os placeholders funcionam

Os placeholders sao textos dentro dos arquivos `.pptx`, por exemplo:

```text
{{ nome_razao_social }}
{{ nome_contato }}
{{ endereco_obra }}
{{ telefone }}
{{ email }}
{{ local_obra }}
{{ numero_proposta }}
{{ data_solicitacao }}
{{ data_envio }}
{{ sumario }}
```

O contexto para substituicao e criado em `_build_head_context(...)`, dentro de `slide_merger.py`.

O mecanismo de substituicao aceita duas formas:

```text
{{ chave }}
{{chave}}
```

Exemplo:

Se `globalValues.nome_razao_social` for `Condominio Exemplo`, o texto:

```text
{{ nome_razao_social }}
```

sera substituido por:

```text
Condominio Exemplo
```

O codigo procura placeholders em:

- caixas de texto;
- paragrafos;
- celulas de tabelas.

## Ordem de montagem da proposta

A ordem final e determinada pelo backend desta forma:

1. Todos os slides de `slides/head.pptx`.
2. Para cada item de `productGroups`, todos os slides do arquivo de produto correspondente.
3. Todos os slides de `slides/tail.pptx`.

Exemplo:

Se a proposta tiver:

```json
{
  "productGroups": [
    { "productId": "beach_tenis", "variantId": "padrao" },
    { "productId": "quadra_tenis", "variantId": "piso_asfaltico" }
  ]
}
```

A apresentacao final sera:

```text
head.pptx
qbt.pptx
qtpa.pptx
tail.pptx
```

## Limitacoes e pontos de atencao

- O campo `slideIds` e recebido, mas nao controla a montagem final no backend atual.
- Apenas tres combinacoes de produto/variante estao mapeadas em `PRODUCT_FILE_MAP`.
- Produtos ainda nao mapeados sao rejeitados com erro `422`.
- O backend nao valida se os placeholders esperados existem nos arquivos `.pptx`.
- O backend nao substitui placeholders dentro dos arquivos de produto ou do `tail.pptx`; a substituicao atual acontece no `head.pptx`.
- Os slides sao copiados por manipulacao da arvore interna do `python-pptx` (`_spTree`), o que funciona para esse caso, mas exige cuidado ao evoluir templates complexos.
- `slide_builders.py` esta disponivel, mas nao participa do fluxo principal atual.

## Como adicionar um novo produto ao gerador

1. Criar ou exportar o modelo PowerPoint do produto.
2. Salvar o arquivo em `pptx-generator-service/slides/products/`.
3. Adicionar uma entrada em `PRODUCT_FILE_MAP`, em `slide_merger.py`.
4. Garantir que o frontend envie o mesmo `productId` e `variantId`.
5. Testar a geracao chamando `/gerar-proposta`.

Exemplo:

```python
PRODUCT_FILE_MAP = {
    ("beach_tenis", "padrao"): "qbt.pptx",
    ("quadra_tenis", "piso_asfaltico"): "qtpa.pptx",
    ("quadra_tenis", "saibro"): "qts.pptx",
    ("novo_produto", "padrao"): "novo_produto.pptx",
}
```

## Como adicionar novos campos no bloco inicial

1. Adicionar o campo no formulario/frontend.
2. Garantir que ele seja enviado dentro de `globalValues`.
3. Adicionar a chave em `_build_head_context(...)`, em `slide_merger.py`.
4. Inserir o placeholder correspondente em `slides/head.pptx`.

Exemplo:

```python
"cidade": global_values.get("cidade", "")
```

No PowerPoint:

```text
{{ cidade }}
```

## Como testar manualmente

Com o servidor rodando, verifique a saude:

```bash
curl http://localhost:8000/health
```

Para testar a geracao, envie um `POST` para `/gerar-proposta` com um payload valido e salve a resposta como `.pptx`.

Exemplo conceitual:

```bash
curl -X POST http://localhost:8000/gerar-proposta \
  -H "Content-Type: application/json" \
  --data @payload-exemplo.json \
  --output proposta.pptx
```

## Referencias rapidas no codigo

| Tema | Referencia |
| --- | --- |
| Criacao da API FastAPI | `main.py`, linhas 14-21 |
| Modelo de produto no payload | `main.py`, linhas 24-30 |
| Modelo da requisicao completa | `main.py`, linhas 33-36 |
| Endpoint de disponibilidade | `main.py`, linhas 44-46 |
| Endpoint de geracao | `main.py`, linhas 49-66 |
| Endpoint de saude | `main.py`, linhas 69-71 |
| Pastas e arquivos base dos slides | `slide_merger.py`, linhas 10-15 |
| Mapa produto/variante para `.pptx` | `slide_merger.py`, linhas 17-21 |
| Checagem de disponibilidade | `slide_merger.py`, linhas 30-81 |
| Fluxo principal de montagem | `slide_merger.py`, linhas 84-115 |
| Montagem do head e troca de placeholders | `slide_merger.py`, linhas 118-125 |
| Copia de slides de um arquivo `.pptx` | `slide_merger.py`, linhas 128-137 |
| Contexto dos placeholders globais | `slide_merger.py`, linhas 147-159 |
| Substituicao em textos e tabelas | `slide_merger.py`, linhas 162-188 |
| Slide de template pendente | `slide_merger.py`, linhas 191-199 |
| Builders programaticos auxiliares | `slide_builders.py`, linhas 21-98 |
| Dependencias Python | `requirements.txt`, linhas 1-3 |
| Cliente frontend que chama a API | `vite-project/src/route/FormPropostaComercial/generation/buildPresentation.ts`, linhas 9-49 |
