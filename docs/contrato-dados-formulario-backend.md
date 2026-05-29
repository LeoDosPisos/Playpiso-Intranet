# Contrato de Dados — Formulário Comercial → Backend

> Documento de referência do fluxo de dados entre o formulário React/Vite e a API ASP.NET Core + PostgreSQL.  
> Arquivos-chave: `Frontend/src/pages/FormPropostaComercial/config/`, `Backend/PlaypisoIntranet/DTOs/`, `Backend/PlaypisoIntranet/Repositories/ProposalRepository.cs`
> _Última verificação: 2026-05-29._

---

## 1. Visão geral do fluxo

```
Formulário React
    │
    ├─ globalValues (dados do cliente/obra)
    └─ productGroups[] (um por grupo de produto)
           │
           ▼
buildApiPayload.ts
    │
    ├─ Campos em NORMALIZED_KEYS → enviados como propriedades camelCase explícitas
    └─ Campos FORA de NORMALIZED_KEYS → espalhados no objeto raiz (→ [JsonExtensionData] no C#)
           │
           ▼
POST /api/proposals
    │
    ├─ CreateProposalDto → campos globais mapeados diretamente para a tabela proposals
    └─ CreateProductGroupDto[]
           ├─ Propriedades explícitas → INSERT INTO proposal_product_groups (colunas individuais)
           └─ [JsonExtensionData] Specs → INSERT coluna specs (JSONB)
                   │
                   ▼
              PostgreSQL
```

---

## 2. Campos globais da proposta

Todos vão diretamente para a tabela `proposals`.

| Campo no formulário | Tipo | Coluna no banco | Observação |
|---|---|---|---|
| `numero_proposta` | text | `numero_proposta` | |
| `data_solicitacao` | date | `data_solicitacao` | DateOnly |
| `data_envio` | date | `data_envio` | DateOnly |
| `nome_razao_social` | text | `nome_razao_social` | required |
| `cpf_cnpj` | text | `cpf_cnpj` | |
| `nome_contato` | text | `nome_contato` | |
| `telefone` | text | `telefone` | |
| `email` | email | `email_cliente` | renomeado para desambiguar de `created_by_email`/`generated_by_email` |
| `endereco_cliente` | text | `endereco_cliente` | required |
| `cidade` | text | `cidade` | required |
| `estado` | text | `estado` | required |
| `tipo_projeto` | select | `tipo_projeto` | required |

Campos preenchidos pelo servidor (não vêm do formulário):

| Coluna | Origem |
|---|---|
| `id` | UUID gerado pelo banco (DEFAULT gen_random_uuid()) |
| `status` | Default `'rascunho'`; atualizado para `'gerada'` após PPTX |
| `pptx_url` | Preenchido em `UpdateGeneratedOutputsAsync` |
| `created_by_user_id` | Extraído do JWT (claim `oid`) |
| `created_by_email` | Extraído do JWT (claim `preferred_username`) |
| `generated_by_*` | Preenchido em `UpdateGeneratedOutputsAsync` |
| `created_at` / `updated_at` | DEFAULT NOW() |

---

## 3. Campos dos grupos de produto

### 3.1 Rota de um campo: onde ele vai parar?

```
Campo no formulário (snake_case)
         │
         ├─── Está em NORMALIZED_KEYS? ─── SIM ──► buildApiPayload.ts envia como
         │                                          propriedade camelCase explícita
         │                                                   │
         │                                    Existe em CreateProductGroupDto? ─── SIM ──► coluna própria no banco
         │                                                   │
         │                                                   └─── NÃO ──► [JsonExtensionData] → coluna SPECS (JSONB)
         │                                                                  **chave camelCase**
         │
         └─── NÃO em NORMALIZED_KEYS ──► buildSpecs() → espalhado no objeto raiz
                                                          │
                                          [JsonExtensionData] → coluna SPECS (JSONB)
                                                          **chave snake_case original**
```

### 3.2 Campos normalizados (colunas próprias no banco)

Todos existem em `CreateProductGroupDto` e são INSERT-ados individualmente.

| Chave formulário (snake_case) | Tipo | Coluna banco | Chave API (camelCase) |
|---|---|---|---|
| `largura` | number | `largura` | `largura` |
| `comprimento` | number | `comprimento` | `comprimento` |
| `area_total` | number | `area_total` | `areaTotal` |
| `tipo_terreno` | select | `tipo_terreno` | `tipoTerreno` |
| `dificuldade_acesso` | select | `dificuldade_acesso` | `dificuldadeAcesso` |
| `responsavel_material_pedreira` | select | `responsavel_material_pedreira` | `responsavelMaterialPedreira` |
| `possui_iluminacao` | checkbox | `possui_iluminacao` | `possuiIluminacao` |
| `iluminacao_fixada_alambrado` | checkbox | `iluminacao_fixada_alambrado` | `iluminacaoFixadaAlambrado` |
| `quantidade_postes_iluminacao` | number | `quantidade_postes_iluminacao` | `quantidadePostesIluminacao` |
| `altura_postes_iluminacao` | number | `altura_postes_iluminacao` | `alturaPostesIluminacao` |
| `quantidade_projetores` | number | `quantidade_projetores` | `quantidadeProjetores` |
| `potencia_projetores` | select+custom | `potencia_projetores` | `potenciaProjetores` |
| `especificar_potencia_projetores` | text | `especificar_potencia_projetores` | `especificarPotenciaProjetores` |
| `quantidade_cruzetas` | number | `quantidade_cruzetas` | `quantidadeCruzetas` |
| `responsavel_ligacao_eletrica` | readonly | `responsavel_ligacao_eletrica` | `responsavelLigacaoEletrica` |
| `tipo_coligacao` | select | `tipo_coligacao` | `tipoColigacao` |
| `possui_alambrado` | checkbox | `possui_alambrado` | `possuiAlambrado` |
| `galvanizacao` | select+custom | `galvanizacao` | `galvanizacao` |
| `especificar_galvanizacao` | text | `especificar_galvanizacao` | `especificarGalvanizacao` |
| `travamento` | multiselect | `travamento` | `travamento` ¹ |
| `possui_tela_superior` | checkbox | `possui_tela_superior` | `possuiTelaSuperior` |
| `possui_tela_sombreamento` | checkbox | `possui_tela_sombreamento` | `possuiTelaSombreamento` |
| `largura_sombreamento` | number | `largura_sombreamento` | `larguraSombreamento` |
| `comprimento_sombreamento` | number | `comprimento_sombreamento` | `comprimentoSombreamento` |
| `observacoes` | textarea | `observacoes` | `observacoes` |

¹ `travamento` é multiselect; valores são unidos com `", "` antes de enviar. Ex: `"travamento_inferior, travamento_superior"`.

### 3.3 Lacuna de contrato — campos em NORMALIZED_KEYS sem coluna própria no C# DTO

Estes campos estão em `NORMALIZED_KEYS` (excluídos do `buildSpecs()`), são enviados como propriedades camelCase explícitas, mas **não existem como propriedades em `CreateProductGroupDto`**. O `[JsonExtensionData]` os captura e os armazena no JSONB com **chave camelCase** — diferente dos demais campos JSONB que ficam com chave snake_case.

| Chave formulário (snake_case) | Chave enviada ao C# | Chave no JSONB | Destino final |
|---|---|---|---|
| `quantidade_portoes` | `quantidadePortoes` | `"quantidadePortoes"` | `specs` JSONB |
| `altura_portoes` | `alturaPortoes` | `"alturaPortoes"` | `specs` JSONB |
| `largura_portoes` | `larguraPortoes` | `"larguraPortoes"` | `specs` JSONB |

**Impacto:** esses campos ficam no JSONB em camelCase enquanto todos os demais campos JSONB ficam em snake_case. A inconsistência de case nas chaves do JSONB exige que o frontend trate ambos os formatos ao exibir dados.

**Solução recomendada (backend):** adicionar `QuantidadePortoes`, `AlturaPortoes`, `LarguraPortoes` em `CreateProductGroupDto` E em `ProductGroupResponse`, e criar uma migration para adicionar as colunas `quantidade_portoes`, `altura_portoes`, `largura_portoes` na tabela `proposal_product_groups`.

### 3.4 Campos JSONB (specs) — por produto

Todos vão para `specs` com chave **snake_case** (exceto portões, ver 3.3).

#### Comuns a todos os produtos (alambrado)
| Chave JSONB | Tipo | Descrição |
|---|---|---|
| `sistema_alambrado` | string | Ex: `gaiola`, `gradil` |
| `altura_alambrado_fundos` | number | metros |
| `altura_alambrado_laterais` | number | metros |
| `comprimento_alambrado_fundos` | number | metros |
| `comprimento_alambrado_laterais` | number | metros |
| `espacamento_postes_tubos_fundos` | number | metros |
| `espacamento_postes_tubos_laterais` | number | metros |
| `cor_tela_superior` | string | Ex: `branca`, `amarelo` |

#### Quadra de Tênis (`quadra_tenis`)
| Chave JSONB | Tipo | Valores possíveis |
|---|---|---|
| `variante_quadra_tenis` | string | `piso_asfaltico`, `saibro`, `grama` |
| `cor_piso_asfaltico` | string | `padrao`, `preto`, `verde`, ... |
| `incluir_rede_tenis` | boolean | |
| `possui_playcushion` | boolean | |
| `possui_kit_saibro` | boolean | (variante saibro) |

#### Quadra Poliesportiva (`quadra_poliesportiva`)
| Chave JSONB | Tipo | Valores possíveis |
|---|---|---|
| `variante_quadra_poliesportiva` | string | `piso_asfaltico`, `assoalho`, `epoxi`, `pu_200_b` |
| `tipo_futsal` | string | `padrao` |
| `possui_tenis` | boolean | |
| `possui_volei` | boolean | |
| `possui_futebol_futsal` | boolean | |
| `possui_basquete_adulto` | boolean | |
| `possui_basquete_juvenil` | boolean | |
| `estrutura_basquete_adulto` | string | `metalica` |

#### Beach Tennis (`beach_tenis`)
| Chave JSONB | Tipo | Valores possíveis |
|---|---|---|
| `variante_beach_tenis` | string | `padrao` |
| `tipo_areia` | string | `rio`, `lavado` |
| `espessura_areia` | number | cm |
| `possui_eva` | boolean | |
| `possui_volei` | boolean | |

---

## 4. Mapeamento completo: banco ↔ DTO ↔ resposta

| Coluna banco | CreateProductGroupDto | ProductGroupResponse | Status |
|---|---|---|---|
| `product_id` | `ProductId` | `ProductId` | ✅ |
| `variant_id` | `VariantId` | `VariantId` | ✅ |
| `quantity` | `Quantity` | `Quantity` | ✅ |
| `group_index` | `GroupIndex` | `GroupIndex` | ✅ |
| `largura` | `Largura` | `Largura` | ✅ |
| `comprimento` | `Comprimento` | `Comprimento` | ✅ |
| `area_total` | `AreaTotal` | `AreaTotal` | ✅ |
| `tipo_terreno` | `TipoTerreno` | `TipoTerreno` | ✅ |
| `dificuldade_acesso` | `DificuldadeAcesso` | `DificuldadeAcesso` | ✅ |
| `responsavel_material_pedreira` | `ResponsavelMaterialPedreira` | `ResponsavelMaterialPedreira` | ✅ |
| `possui_iluminacao` | `PossuiIluminacao` | `PossuiIluminacao` | ✅ |
| `iluminacao_fixada_alambrado` | `IluminacaoFixadaAlambrado` | `IluminacaoFixadaAlambrado` | ✅ |
| `quantidade_postes_iluminacao` | `QuantidadePostesIluminacao` | `QuantidadePostesIluminacao` | ✅ |
| `altura_postes_iluminacao` | `AlturaPostesIluminacao` | `AlturaPostesIluminacao` | ✅ |
| `quantidade_projetores` | `QuantidadeProjetores` | `QuantidadeProjetores` | ✅ |
| `potencia_projetores` | `PotenciaProjetores` | `PotenciaProjetores` | ✅ |
| `especificar_potencia_projetores` | `EspecificarPotenciaProjetores` | `EspecificarPotenciaProjetores` | ✅ |
| `quantidade_cruzetas` | `QuantidadeCruzetas` | `QuantidadeCruzetas` | ✅ |
| `responsavel_ligacao_eletrica` | `ResponsavelLigacaoEletrica` | `ResponsavelLigacaoEletrica` | ✅ |
| `tipo_coligacao` | `TipoColigacao` | `TipoColigacao` | ✅ |
| `possui_alambrado` | `PossuiAlambrado` | `PossuiAlambrado` | ✅ |
| `galvanizacao` | `Galvanizacao` | `Galvanizacao` | ✅ |
| `especificar_galvanizacao` | `EspecificarGalvanizacao` | `EspecificarGalvanizacao` | ✅ |
| `possui_trelica` | `PossuiTrelica` | `PossuiTrelica` | ✅ |
| `travamento` | `Travamento` | `Travamento` | ✅ |
| `possui_tela_superior` | `PossuiTelaSuperior` | `PossuiTelaSuperior` | ✅ |
| `possui_tela_sombreamento` | `PossuiTelaSombreamento` | `PossuiTelaSombreamento` | ✅ |
| `largura_sombreamento` | `LarguraSombreamento` | `LarguraSombreamento` | ✅ |
| `comprimento_sombreamento` | `ComprimentoSombreamento` | `ComprimentoSombreamento` | ✅ |
| `observacoes` | `Observacoes` | `Observacoes` | ✅ |
| `specs` | `[JsonExtensionData] Specs` | `Specs` (string) | ✅ |
| `quantidade_portoes` | `QuantidadePortoes` | `QuantidadePortoes` | ✅ |
| `altura_portoes` | `AlturaPortoes` | `AlturaPortoes` | ✅ |
| `largura_portoes` | `LarguraPortoes` | `LarguraPortoes` | ✅ |

---

## 5. Lacunas identificadas e recomendações

### L1 — Portões sem colunas dedicadas — ✅ RESOLVIDA

Histórico do problema: `quantidade_portoes`, `altura_portoes`, `largura_portoes` estavam apenas no JSONB (`Specs`) como camelCase via `[JsonExtensionData]`.

Estado atual: colunas dedicadas existem em `proposal_product_groups`, propriedades estão em `CreateProductGroupDto`/`ProductGroupResponse` e o INSERT em `ProposalRepository` escreve nas colunas.

### L2 — `product_id` e `variant_id` salvos como strings vazias (impacto: alto)

**Problema:** os registros têm `product_id = ""` e `variant_id = ""` no banco. Isso acontece porque o formulário deve estar enviando esses valores como strings vazias. A inferência a partir do JSONB (`variante_*` keys) é um workaround de exibição, não uma solução de dados.

**Solução:** investigar por que `group.productId` e `group.variantId` chegam vazios no `buildApiPayload.ts`. Verificar se o estado do formulário (`productGroups[i].productId`) está sendo populado corretamente ao selecionar produtos no carousel.

### L3 — Campos de alambrado duplicados — ✅ RESOLVIDA via drop

Histórico do problema: colunas genéricas `comprimento_alambrado`, `altura_alambrado`, `espacamento_postes_tubos` em `proposal_product_groups` coexistiam com as versões por lado em `Specs` (JSONB) e ficavam sempre NULL.

Estado atual: as colunas genéricas foram dropadas (consolidação V002). As propriedades correspondentes saíram do Model/DTOs/Response/INSERT. A informação por lado (`comprimento_alambrado_fundos/laterais` etc.) continua em `Specs` (JSONB), como única fonte da verdade.
