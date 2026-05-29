# productCatalog

`productCatalog` irá responder:

- Qual produto está sendo modelado?
- Quais variantes ele possui?
- Quais seções ele usa?
- Qual é a ordem das seções?
- Quais campos específicos entram por variante?
- Quais aliases/sinônimos devem ser reconhecidos?


## productCatalog — Quadra de Tênis

### product_id:
- quadra_tenis

### label:
- Quadra de Tênis

### category:
- Quadras Esportivas

### status:
- active

### aliases:
- Quadra de Tênis
- Quadra Tenis
- Quadra Tênis

### variants:
1. piso_asfaltico
   label: Piso Asfáltico
   value: piso_asfaltico
   default: true
   aliases:
   - Quadra de Tênis P.A.
   - Quadra de Tênis PA
   - Quadra Tênis P.A.
   - Quadra Tênis PA
   - Tênis P.A.
   - Tênis PA

2. saibro
   label: Saibro
   value: saibro

3. grama
   label: Grama
   value: grama
   business_note: Grama significa apenas Grama Natural para Quadra de Tênis.

### variant_selector:
- field_id: variante_quadra_tenis
- component: SelectField
- required: true
- default: piso_asfaltico
- options_source: 08-field-options-registry.md#variante_quadra_tenis_options
- recommendation: start with "Piso Asfáltico"

### default_values:
- largura: 18
- comprimento: 36
- area_total: largura × comprimento, editável manualmente

### sections:
1. dados_cliente
2. dados_obra
3. produto_variante
4. dimensoes
5. condicoes_obra
6. especificacoes_variante
7. iluminacao
8. fechamentos_protecoes
9. acessorios
10. observacoes

### variant_profiles:
- piso_asfaltico:
  - cor_piso_asfaltico
  - especificar_cor
  - possui_playcushion

- saibro:
  - possui_kit_saibro

- grama:
  - tipo_grama
  - especificar_tipo_grama

### naming_decisions:
- O planejamento original chama a seção de "Alambrado".
- O contrato codável usa `fechamentos_protecoes`, porque a seção também contém tela superior e tela de sombreamento.
- Dentro de `fechamentos_protecoes`, os campos técnicos de alambrado ficam condicionados por `possui_alambrado`.

### related_registries:
- fieldRegistry: 01-field-registry.md
- sectionRegistry: 02-section-registry.md
- conditionalRules: 04-conditional-rules.md
- uiComponentRegistry: 05-ui-component-registry.md
- fieldOptionsRegistry: 08-field-options-registry.md
