# Avaliação de Arquitetura e Roteiro de Refatoração
## pptx-generator-service

> Documento de referência para desenvolvimento. Descreve o estado atual, os problemas identificados e o roteiro de melhorias priorizadas.

---

## 1. Arquitetura atual

### Arquivos e responsabilidades

| Arquivo | Linhas | Responsabilidade |
|---|---|---|
| `main.py` | 114 | FastAPI app, CORS, modelos Pydantic, endpoints |
| `slide_merger.py` | 677 | Tudo mais — ver detalhamento abaixo |
| `slide_builders.py` | 99 | Construtores programáticos — **não utilizado** |

### O problema central: `slide_merger.py` acumula 7 responsabilidades

```
slide_merger.py (677 linhas)
├── Registro de slides       SLIDE_FILE_MAP, CONDITIONAL_SECTIONS, _PRODUCT_SLIDES_DIR
├── Construção de contexto   _build_context
├── Formatadores             _fmt_date, _fmt_dimension, _fmt_numero,
│                            _fmt_alambrado_descricao, _fmt_travamento
├── Cópia de slides          _copy_slide, _copy_background, _shift_shape_top
├── Substituição             _replace_placeholders, _replace_in_paragraph
├── Composição dinâmica      compose_fechamentos, compose_acessorios,
│                            _get_active_acessorios_sections
└── Orquestração             build_presentation, _add_from_file_with_replacement,
                             _add_placeholder_slide
```

### Fluxo de dados atual

```
POST /gerar-proposta
  │
  └─ build_presentation(req)
       │
       ├─ _build_context(globalValues, productGroups)
       │    └─ loop sobre todos os grupos → dict plano único  ⚠️ bug multi-produto
       │
       └─ para cada slide_entry:
            ├─ dynamic="fechamentos"  → compose_fechamentos()
            ├─ dynamic="acessorios"   → compose_acessorios()
            └─ (normal)               → _add_from_file_with_replacement()
                                           → _copy_slide()
                                           → _replace_placeholders(ctx)  ← usa dict plano
```

---

## 2. Problemas identificados

### 🔴 Alta severidade

#### P1 — Bug de contexto em propostas multi-produto

**Localização:** `slide_merger.py`, função `_build_context`, linhas ~531–630

`_build_context` constrói um único dicionário plano iterando sobre todos os grupos de produto. Cada grupo sobrescreve os valores do anterior:

```python
for group in product_groups:
    ctx.update({k: str(v) for k, v in group.values.items()})  # sobrescreve
    ctx['travamento_descricao'] = _fmt_travamento(values.get('travamento'))  # sobrescreve
    ctx['alambrado_descricao'] = _fmt_alambrado_descricao(values)           # sobrescreve
```

**Impacto:** em propostas com 2+ produtos, os slides do primeiro produto recebem os valores de placeholder do último produto. Placeholders afetados: `{{ possui_alambrado }}`, `{{ travamento_descricao }}`, `{{ alambrado_descricao }}`, `{{ dimensoes_portoes }}`, `{{ area_alambrado }}`, e todos os campos de `group.values`.

**Status:** bug ativo em produção para propostas multi-produto.

---

#### P2 — Zero testes automatizados

Não existe nenhum arquivo de teste no serviço. Qualquer alteração em `slide_merger.py` pode introduzir regressões que só são detectadas abrindo o `.pptx` gerado manualmente no PowerPoint.

**Impacto:** bloqueia refatoração segura. A Fase 1 do roteiro deve criar testes antes de qualquer mudança estrutural.

---

#### P3 — `slide_merger.py` monolítico (677 linhas, 7 responsabilidades)

Um desenvolvedor que precisa modificar apenas a lógica de formatação de alambrado (`_fmt_alambrado_descricao`) precisa navegar por código de cópia de slides, substituição de XML e composição dinâmica no mesmo arquivo. Qualquer mudança carrega risco de side effects não intencionais.

---

### 🟡 Média severidade

#### P4 — `_img_counter` é estado global mutável

```python
# slide_merger.py, linha 18
_img_counter = 0
```

Incrementado a cada `_copy_slide` sem reset entre requisições. Em ambiente com múltiplos workers (`--workers N`), o contador é por processo. Dentro de um mesmo processo, se o servidor processar requisições concorrentes (possível com ASGI async), pode haver colisão nos nomes de arquivo gerados (`/ppt/media/mN.png`).

**Risco imediato:** baixo com `uvicorn` single-worker. **Risco em escala:** médio ao aumentar workers ou migrar para async.

---

#### P5 — Lógica de produto hardcoded em `_build_context`

```python
# slide_merger.py, linha ~602
if group.productId == 'quadra_poliesportiva':
    _sports = []
    if values.get('possui_basquete_adulto'): ...
    ctx['acessorios_esportivos_descricao'] = ...
```

Adicionar um novo produto com acessórios esportivos exige modificar `_build_context`, uma função de propósito genérico. Viola o princípio aberto/fechado.

---

#### P6 — `compose_fechamentos` e `compose_acessorios` têm estrutura duplicada

Ambas as funções seguem o mesmo padrão:
1. Determinar seções ativas
2. Abrir `*_base.pptx` como canvas
3. Iterar sobre seções ativas, carregar `secao_*.pptx`
4. Colar shapes com deslocamento vertical acumulado
5. Chamar `_replace_placeholders`

A diferença é apenas nos paths, no limite de seções por página e na lógica de determinação das seções ativas. Código duplicado é custo duplo de manutenção.

---

#### P7 — `_replace_in_paragraph` colapsa múltiplos runs em `runs[0]`

```python
# slide_merger.py
paragraph.runs[0].text = replaced
for run in paragraph.runs[1:]:
    run.text = ""
```

Se um parágrafo tem runs com estilos diferentes (negrito, cor, tamanho), após a substituição o texto inteiro fica com o estilo de `runs[0]`. Funciona hoje porque os templates .pptx usam run único por placeholder — mas um design de template com runs mistos vai quebrar silenciosamente (texto errado, sem erro Python).

---

#### P8 — `CONDITIONAL_SECTIONS` sempre vazio

```python
# slide_merger.py
CONDITIONAL_SECTIONS: dict[str, list[tuple[str, str]]] = {}
```

Declarado como ponto de extensão para remoção condicional de seções, mas nunca populado. A lógica de uso existe em `_add_from_file_with_replacement`, mas nunca é ativada. Aumenta a complexidade cognitiva sem benefício.

---

### 🟢 Baixa severidade

#### P9 — `slide_builders.py` é código morto

Não é importado em nenhum arquivo. Cria ambiguidade: a abordagem canônica é templates `.pptx` (usada em `slide_merger.py`) ou construção programática (definida em `slide_builders.py`)?

#### P10 — Formato legado `slideIds` ainda suportado

O branch `else` em `build_presentation` mantém uma segunda lógica de montagem para o contrato de API antigo. O frontend já usa exclusivamente o formato novo (`slides`). Duplica código e atenção cognitiva.

#### P11 — `SLIDE_FILE_MAP` mistura dados e código

36 entradas hardcoded em Python. Adicionar um novo slide — uma operação de conteúdo, não de lógica — requer editar código Python, commit e deploy do serviço.

#### P12 — `values: dict[str, Any]` sem validação

Campos esperados de cada produto (`possui_alambrado`, `altura_alambrado_fundos`, etc.) não têm tipo nem validação. Erros de nome de campo retornam `None` via `.get()`, resultando em placeholders não substituídos ou valores incorretos no PPTX — sem exceção, sem log de erro.

---

## 3. Roteiro de refatoração

**Princípio:** não refatorar estrutura sem cobertura de testes. A Fase 1 estabelece a rede de segurança que torna as fases seguintes seguras.

---

### Fase 1 — Correção de bugs e testes (prioridade máxima)

#### 1a. Corrigir o bug de contexto multi-produto

Separar o contexto global do contexto por grupo. Cada slide recebe o contexto do seu `groupIndex`:

```python
# Antes (bug):
context = _build_context(req.globalValues, req.productGroups)
# ...usado para todos os slides

# Depois (correto):
base_ctx = _build_base_context(req.globalValues, req.productGroups)
group_ctxs = [_build_group_context(base_ctx, g) for g in req.productGroups]

# ao processar cada slide_entry:
idx = slide_entry.groupIndex
ctx = {**base_ctx, **group_ctxs[idx]} if idx is not None else base_ctx
```

`_build_base_context` — campos globais: nome_razao_social, sumario, datas.
`_build_group_context` — campos de produto: values, derivados (alambrado_descricao, etc.).

#### 1b. Remover o estado global `_img_counter`

Substituir por um contador passado por referência (lista de um elemento) ou por uma classe `SlideAssembler` instanciada por requisição:

```python
# Opção simples: contador mutável por referência
def _copy_slide(merged, src_slide, img_counter: list[int]):
    img_counter[0] += 1
    new_partname = PackURI(f'/ppt/media/m{img_counter[0]}{ext}')

# Chamada:
img_counter = [0]
_copy_slide(merged, src_slide, img_counter)
```

#### 1c. Adicionar testes de integração

Criar `tests/test_build_presentation.py`. Os testes devem usar os templates `.pptx` reais (testes de integração verdadeiros):

```python
# Estrutura sugerida
def test_proposta_quadra_tenis_single_product():
    req = make_request(produtos=["quadra_tenis"], possui_alambrado=True)
    pptx_bytes = build_presentation(req)
    prs = Presentation(BytesIO(pptx_bytes))
    # verificar número de slides
    assert len(prs.slides) > 0
    # verificar que nenhum placeholder ficou não substituído
    for slide in prs.slides:
        for shape in slide.shapes:
            if shape.has_text_frame:
                assert "{{" not in shape.text_frame.text

def test_proposta_multi_produto_contextos_isolados():
    # duas quadras com possui_alambrado diferente
    # verificar que cada grupo mantém seu próprio valor
    ...
```

Adicionar `pytest` e `pytest-cov` ao `requirements.txt` (ou em `requirements-dev.txt`).

---

### Fase 2 — Modularização de `slide_merger.py`

Dividir em módulos coesos sem alterar comportamento. Os testes da Fase 1 verificam que o comportamento externo é preservado.

**Estrutura proposta:**

```
pptx-generator-service/
├── main.py                    (sem mudança)
├── slide_registry.py          SLIDE_FILE_MAP, _PRODUCT_SLIDES_DIR
│                              get_available_slides(), is_slide_available()
├── context_builder.py         _build_base_context(), _build_group_context()
│                              + todos os _fmt_* formatadores
│                              + _is_truthy()
├── slide_copier.py            _copy_slide(), _copy_background(), _shift_shape_top()
│                              img_counter encapsulado
├── placeholder_engine.py      _replace_placeholders(), _replace_in_paragraph()
├── dynamic_composer.py        compose_fechamentos(), compose_acessorios()
│                              _get_active_acessorios_sections()
│                              _FECHAMENTOS_SECTIONS, constantes de layout
└── presentation_builder.py    build_presentation()
                               _add_from_file_with_replacement()
                               _add_placeholder_slide()
```

`slide_merger.py` pode ser mantido como módulo de re-export durante a transição:

```python
# slide_merger.py (transitório — remover após migração de imports)
from presentation_builder import build_presentation
from slide_registry import get_available_slides
```

---

### Fase 3 — Limpeza

#### 3a. Remover `slide_builders.py`

Nenhum chamador. Se houver intenção de uso futuro, mover para `experimental/slide_builders.py` com nota explícita. Caso contrário, deletar.

#### 3b. Remover suporte ao formato legado `slideIds`

1. Confirmar que nenhuma chamada ao endpoint usa `slideIds` (verificar logs ou código do frontend)
2. Remover o campo `slideIds: list[str] | None` do modelo `GenerateRequest`
3. Remover o branch `else` em `build_presentation`
4. Remover a detecção `use_rich_slides = hasattr(req, 'slides') and req.slides is not None`

#### 3c. Resolver `CONDITIONAL_SECTIONS`

Duas opções:
- **Usar:** documentar o mecanismo com um exemplo concreto e popula-lo para pelo menos um caso real
- **Remover:** deletar a dict e o bloco `if label in CONDITIONAL_SECTIONS` em `_add_from_file_with_replacement`

#### 3d. Externalizar `SLIDE_FILE_MAP` para YAML (opcional)

Vantagem: adicionar slides sem tocar em Python.
Desvantagem: perde validação estática de tipos; adiciona step de parsing na inicialização.

```yaml
# slides_config.yaml
global:
  capa: global/capa.pptx
  sumario: global/sumario.pptx
  dados_cliente: global/dados_cliente.pptx

beach_tenis:
  hero_beach_tenis: beach_tenis/hero.pptx
  investimento_beach_tenis: beach_tenis/investimento.pptx
```

Recomendação: implementar somente se a frequência de adição de novos slides justificar o custo.

---

### Fase 4 — Tipagem de `values` por produto

Definir modelos Pydantic por produto e usar discriminador:

```python
class QuadraTenisValues(BaseModel):
    largura: float
    comprimento: float
    area_total: float
    possui_playcushion: bool = False
    possui_alambrado: bool = False
    sistema_alambrado: Literal["gaiola", "trapezio"] | None = None
    altura_alambrado_fundos: float | None = None
    galvanizacao: Literal["fogo", "eletrolitico", "outro"] | None = None
    # ...

class BeachTenisValues(BaseModel):
    largura: float
    comprimento: float
    area_total: float
    possui_eva: bool = False
    # ...

ProductValues = Annotated[
    QuadraTenisValues | BeachTenisValues | QuadraPoliesportivaValues,
    Field(discriminator="productId")  # requer reestruturação do modelo
]
```

Erros de campo falham na validação do Pydantic (HTTP 422) em vez de silenciosamente no `.pptx` gerado.

**Esforço:** alto. Recomendado somente após as Fases 1–3 estabilizarem o código.

---

## 4. Resumo de prioridades

| # | Problema | Severidade | Esforço estimado | Fase |
|---|---|---|---|---|
| P1 | Bug de contexto multi-produto | 🔴 Alta | 4–6h | 1a |
| P2 | Zero testes automatizados | 🔴 Alta | 8–12h | 1c |
| P3 | Monolito `slide_merger.py` | 🔴 Alta | 6–8h | 2 |
| P4 | `_img_counter` global mutável | 🟡 Média | 1–2h | 1b |
| P5 | Lógica de produto em `_build_context` | 🟡 Média | 3–4h | 2 |
| P6 | `compose_*` com estrutura duplicada | 🟡 Média | 3–4h | 2 |
| P7 | Colapso de runs em `_replace_in_paragraph` | 🟡 Média | 2–3h | 2 |
| P8 | `CONDITIONAL_SECTIONS` sem uso | 🟡 Média | 1h | 3c |
| P9 | `slide_builders.py` código morto | 🟢 Baixa | 30min | 3a |
| P10 | Formato legado `slideIds` | 🟢 Baixa | 1–2h | 3b |
| P11 | `SLIDE_FILE_MAP` hardcoded em Python | 🟢 Baixa | 4–6h | 3d |
| P12 | `values: dict[str, Any]` sem validação | 🟢 Baixa | 12–16h | 4 |

**Estimativa total:** Fase 1 (~15h) → Fase 2 (~15h) → Fase 3 (~5h) → Fase 4 (~16h)

---

## 5. O que não mudar

- **`main.py`** — bem estruturado. Responsabilidades claras, tamanho adequado.
- **Estrutura de `slides/`** — organização por produto é intuitiva e funcional.
- **Mecanismo de placeholders `{{ chave }}`** — simples e eficaz. O problema (P7) é de implementação, não de design.
- **Estratégia de composição vertical** em `compose_fechamentos`/`compose_acessorios` — a abordagem de colar shapes com deslocamento Y é correta para o caso de uso.
- **`python-pptx` como biblioteca** — não há alternativa madura para manipulação de `.pptx` em Python.
