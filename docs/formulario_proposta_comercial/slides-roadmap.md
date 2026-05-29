# Roadmap de Slides — pptx-generator-service

Documento de rastreamento para o designer de slides. Lista o que já existe em disco, o que falta criar e como adicionar um novo produto.

> **Como o sistema funciona:** o frontend (`slideRegistry.ts`) define quais slides fazem parte de cada proposta e calcula quais são condicionais. O backend lê o campo `slideIds` da request e monta o `.pptx` copiando um arquivo por slide. Cada `slideId` tem um arquivo `.pptx` correspondente mapeado em `SLIDE_FILE_MAP` (`slide_merger.py`).

---

## Status atual

### slides/global/

| Arquivo | slideId | Status |
|---|---|---|
| `capa.pptx` | `capa` | ✅ pronto |
| `portfolio.pptx` | `portfolio` | ✅ pronto |
| `sobre_empresa.pptx` | `sobre_empresa` | ✅ pronto |
| `pilares.pptx` | `pilares` | ✅ pronto |
| `parceiros.pptx` | `parceiros` | ✅ pronto |
| `dados_cliente.pptx` | `dados_cliente` | ✅ pronto |
| `sumario.pptx` | `sumario` | ✅ pronto |
| `condicoes_pagamento_direto_a.pptx` | `condicoes_pagamento_direto_a` | ❌ falta criar |
| `condicoes_pagamento_direto_b.pptx` | `condicoes_pagamento_direto_b` | ❌ falta criar |
| `condicoes_pagamento_playpiso.pptx` | `condicoes_pagamento_playpiso` | ✅ pronto |
| `prazos_garantia.pptx` | `prazos_garantia` | ✅ pronto |
| `regras_contratada.pptx` | `regras_contratada` | ✅ pronto |
| `regras_contratante.pptx` | `regras_contratante` | ✅ pronto |
| `consideracoes_gerais.pptx` | `consideracoes_gerais` | ✅ pronto |
| `encerramento.pptx` | `encerramento` | ✅ pronto |

---

### slides/beach_tenis/ — ✅ completo

| Arquivo | slideId | Tipo | Condição |
|---|---|---|---|
| `hero.pptx` | `hero_beach_tenis` | produto | sempre |
| `areia_rio.pptx` | `areia_rio_beach_tenis` | condicional | `tipo_areia = "rio"` |
| `areia_quartzo.pptx` | `areia_quartzo_beach_tenis` | condicional | `tipo_areia = "quartzo"` |
| `protecao_eva.pptx` | `protecao_eva_beach_tenis` | condicional | `possui_eva = true` |
| `_comum/fechamentos_base.pptx` (+ `secao_alambrado`/`secao_iluminacao`) | `fechamentos_beach_tenis` | dinâmico | `possui_alambrado` OU `possui_iluminacao` |
| `acessorio.pptx` | `acessorio_beach_tenis` | produto | sempre |
| `investimento.pptx` | `investimento_beach_tenis` | dinâmico | sempre |

---

### slides/quadra_tenis/ — 🔄 em andamento

| Arquivo esperado pelo registry | slideId | Tipo | Variante / Condição | Status |
|---|---|---|---|---|
| `hero_piso_asfaltico.pptx` | `hero_piso_asfaltico_quadra_tenis` | variante | `piso_asfaltico` | ✅ pronto |
| `hero_saibro.pptx` | `hero_saibro_quadra_tenis` | variante | `saibro` | ✅ pronto |
| `hero_grama.pptx` | `hero_grama_quadra_tenis` | variante | `grama` | ❌ falta criar |
| `specs_piso_asfaltico.pptx` | `specs_piso_asfaltico` | variante | `piso_asfaltico` | ✅ pronto |
| `specs_saibro.pptx` | `specs_saibro` | variante | `saibro` | ✅ pronto |
| `specs_grama.pptx` | `specs_grama` | variante | `grama` | ❌ falta criar |
| `playcushion.pptx` | `playcushion_quadra_tenis` | condicional | `possui_playcushion` (só `piso_asfaltico`) | ✅ pronto |
| `kit_saibro.pptx` | `kit_saibro_quadra_tenis` | condicional | `possui_kit_saibro` (só `saibro`) | ❌ falta criar |
| `_comum/fechamentos_base.pptx` (+ `secao_alambrado`/`secao_iluminacao`) | `fechamentos_quadra_tenis` | dinâmico | `possui_alambrado` OU `possui_iluminacao` | ✅ dinâmico |
| `cores_piso_asfaltico.pptx` | `cores_piso_asfaltico` | variante | `piso_asfaltico` | ✅ pronto |
| `detalhe_construtivo.pptx` | `detalhe_construtivo_sem_playcushion` | variante | `piso_asfaltico` | ✅ pronto |
| `detalhe_construtivo_playcushion.pptx` | `detalhe_construtivo_com_playcushion` | condicional | `possui_playcushion` | ❌ falta criar |
| `investimento_piso_asfaltico.pptx` | `investimento_piso_asfaltico_quadra_tenis` | variante | `piso_asfaltico` | ✅ pronto |
| `investimento_saibro.pptx` | `investimento_saibro_quadra_tenis` | variante | `saibro` | ✅ pronto |
| `investimento_grama.pptx` | `investimento_grama_quadra_tenis` | variante | `grama` | ❌ falta criar |

**Arquivos presentes aguardando entrada no `slideRegistry.ts`:**

| Arquivo | slideId sugerido | Tipo | Condição sugerida |
|---|---|---|---|
| `acessorio_piso_asfaltico.pptx` | `acessorio_piso_asfaltico_quadra_tenis` | condicional | a definir |
| `acessorio_saibro.pptx` | `acessorio_saibro_quadra_tenis` | condicional | a definir |
| `detalhe_construtivo_saibro.pptx` | `detalhe_construtivo_saibro_quadra_tenis` | variante | `saibro` |

> `detalhe_construtivo_sem_playcushion.pptx` é duplicata do `detalhe_construtivo.pptx` (mesmo conteúdo, nome alternativo) — pode ser removido.

---

## Próximos produtos a implementar

Os produtos abaixo existem no `productCatalog.ts` mas **não têm entradas no `slideRegistry.ts` nem arquivos em `slides/`**. Para cada um, o fluxo é: (1) criar a pasta, (2) adicionar slides ao `slideRegistry.ts`, (3) adicionar ao `SLIDE_FILE_MAP`, (4) criar os `.pptx`.

### slides/quadra_poliesportiva/ — variantes: piso_asfaltico · assoalho · epoxi · pu_200_b

Slides sugeridos com base no padrão beach_tenis e quadra_tenis:

| Arquivo | Tipo | Variante / Condição |
|---|---|---|
| `hero.pptx` | produto | todas |
| `specs_piso_asfaltico.pptx` | variante | `piso_asfaltico` |
| `specs_assoalho.pptx` | variante | `assoalho` |
| `specs_epoxi.pptx` | variante | `epoxi` |
| `specs_pu_200_b.pptx` | variante | `pu_200_b` |
| _(fechamentos dinâmico — `_comum/secao_alambrado`/`secao_iluminacao`)_ | dinâmico | `possui_alambrado` OU `possui_iluminacao` |
| `investimento.pptx` | dinâmico | todas |

---

### slides/campo/ — variantes: natural · sintetico

| Arquivo | Tipo | Variante / Condição |
|---|---|---|
| `hero.pptx` | produto | todas |
| `specs_natural.pptx` | variante | `natural` |
| `specs_sintetico.pptx` | variante | `sintetico` |
| _(fechamentos dinâmico — `_comum/secao_alambrado`/`secao_iluminacao`)_ | dinâmico | `possui_alambrado` OU `possui_iluminacao` |
| `investimento.pptx` | dinâmico | todas |

> Existem arquivos legados em `slides/products/campo/` (`campo_grama_sintetica.pptx` e `tail_campo_grama_sintetica.pptx`) que podem ser aproveitados como base.

---

### slides/padel/ — variante: grama_sintetica

| Arquivo | Tipo | Variante / Condição |
|---|---|---|
| `hero.pptx` | produto | todas |
| `specs_grama_sintetica.pptx` | variante | `grama_sintetica` |
| `investimento.pptx` | dinâmico | todas |

> Existe arquivo legado em `slides/products/padel.pptx` que pode ser aproveitado como base.

---

### slides/pickleball/ — variante: padrao

| Arquivo | Tipo | Variante / Condição |
|---|---|---|
| `hero.pptx` | produto | todas |
| `specs.pptx` | produto | todas |
| _(fechamentos dinâmico — `_comum/secao_alambrado`/`secao_iluminacao`)_ | dinâmico | `possui_alambrado` OU `possui_iluminacao` |
| `investimento.pptx` | dinâmico | todas |

---

### slides/squash/ — variante: padrao

| Arquivo | Tipo | Variante / Condição |
|---|---|---|
| `hero.pptx` | produto | todas |
| `specs.pptx` | produto | todas |
| `investimento.pptx` | dinâmico | todas |

---

### slides/pista/ — variantes: mondo · pu_500 · pu_300 · pu_250 · pu_200_b

| Arquivo | Tipo | Variante / Condição |
|---|---|---|
| `hero.pptx` | produto | todas |
| `specs_mondo.pptx` | variante | `mondo` |
| `specs_pu.pptx` | variante | `pu_500`, `pu_300`, `pu_250`, `pu_200_b` |
| `investimento.pptx` | dinâmico | todas |

---

### slides/garagem_epoxi/ — variante: padrao

| Arquivo | Tipo | Variante / Condição |
|---|---|---|
| `hero.pptx` | produto | todas |
| `specs.pptx` | produto | todas |
| `vagas.pptx` | condicional | possui vagas (carro/moto/bicicleta/PNE) |
| `investimento.pptx` | dinâmico | todas |

---

### slides/softplay/ — variante: padrao

| Arquivo | Tipo | Variante / Condição |
|---|---|---|
| `hero.pptx` | produto | todas |
| `specs.pptx` | produto | todas |
| `investimento.pptx` | dinâmico | todas |

---

## Como adicionar um novo produto

1. **Criar a pasta** em `pptx-generator-service/slides/{productId}/` e adicionar os arquivos `.pptx`

2. **Adicionar entradas no `slideRegistry.ts`** (`Frontend/src/route/FormPropostaComercial/config/slideRegistry.ts`) com `templateFile` apontando para os novos arquivos

3. **Adicionar entradas no `SLIDE_FILE_MAP`** em `pptx-generator-service/slide_merger.py`:
   ```python
   "hero_quadra_poliesportiva": "quadra_poliesportiva/hero.pptx",
   "specs_piso_asfaltico_qp":  "quadra_poliesportiva/specs_piso_asfaltico.pptx",
   # ...
   ```

Após adicionar os arquivos, `GET /slides-disponiveis` passará a listar os novos slideIds automaticamente.

---

## Arquivos legados (slides/products/)

Os arquivos abaixo são da arquitetura anterior (um `.pptx` por variante). Podem ser aproveitados como referência de design ao criar os slides individuais. **Não são mais usados pelo serviço.**

| Arquivo | Produto original |
|---|---|
| `products/qbt.pptx` | beach_tenis / padrao |
| `products/qtpa.pptx` | quadra_tenis / piso_asfaltico |
| `products/qts.pptx` | quadra_tenis / saibro |
| `products/qppa.pptx` | quadra_poliesportiva / piso_asfaltico |
| `products/padel.pptx` | padel / grama_sintetica |
| `products/campo/campo_grama_sintetica.pptx` | campo / sintetico |
| `products/campo/tail_campo_grama_sintetica.pptx` | campo / sintetico (encerramento) |
