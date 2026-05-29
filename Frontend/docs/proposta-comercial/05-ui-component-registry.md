# UI Component Registry — Formulário Comercial Playpiso

1. Objetivo
2. Tokens visuais base
   - cores
   - fontes
   - espaçamentos
   - radius
   - border
   - sombras
3. Componentes de campo
   - TextInput
   - NumberInput
   - SelectField
   - SelectWithCustomOption
   - CheckboxField
   - TextAreaField
   - ReadOnlyField
4. Componentes de estrutura
   - SectionCard
   - FieldGroup
   - ConditionalFieldGroup
   - FormGrid
5. Estados dos componentes
   - default
   - focus
   - error
   - disabled
   - hidden
   - read-only
6. Responsividade
7. Regras de acessibilidade
8. Mapeamento fieldRegistry → componente UI


# UI Component Registry — Formulário Comercial Playpiso

## 1. Objetivo

O `uiComponentRegistry` define os componentes visuais reutilizáveis usados para construir os formulários comerciais da Playpiso.

Ele deve especificar:

```txt
- componentes de campo
- componentes de seção
- espaçamentos
- tamanhos
- bordas
- radius
- estados visuais
- comportamento responsivo
- regras de acessibilidade
- relação entre fieldRegistry e componente visual
```

Ele não deve definir:

```txt
- campos específicos de produto
- regras de negócio específicas
- variantes de produto
- exportação para XLSX
- exportação para PPTX
```

Essas responsabilidades ficam em:

```txt
fieldRegistry       → define campos
sectionRegistry     → organiza campos em seções
productCatalog      → define produto e variantes
conditionalRules    → define regras dinâmicas
uiComponentRegistry → define aparência e comportamento dos componentes
```

---

# 2. Princípios visuais do formulário

A interface deve ser:

```txt
- clara
- objetiva
- orientada a preenchimento comercial
- consistente entre produtos
- fácil de validar visualmente
- adequada para uso em desktop
- responsiva para telas menores
```

O formulário deve priorizar **legibilidade e velocidade de preenchimento**, não uma interface excessivamente decorativa.

Princípios:

```txt
1. Cada campo deve ter label claro.
2. Campos obrigatórios devem ser identificáveis.
3. Erros devem aparecer próximos ao campo.
4. Campos condicionais devem aparecer no mesmo contexto visual.
5. Seções devem ser separadas por cards.
6. O usuário deve entender rapidamente o que está preenchendo.
7. Campos ocultos não devem deixar espaços vazios na interface.
```

---

# 3. Tokens visuais base

## 3.1 Espaçamentos

```txt
spacing-xxs: 4px
spacing-xs: 8px
spacing-sm: 12px
spacing-md: 16px
spacing-lg: 24px
spacing-xl: 32px
spacing-2xl: 40px
```

Uso recomendado:

```txt
4px  → distância entre erro/helper text e input
8px  → distância entre label e input
16px → distância entre campos
24px → distância entre grupos internos
32px → padding lateral da página em desktop
```

---

## 3.2 Radius

```txt
radius-sm: 6px
radius-md: 8px
radius-lg: 12px
radius-xl: 16px
```

Uso recomendado:

```txt
Inputs e selects: 8px
Checkbox customizado: 6px
SectionCard: 12px ou 16px
Botões: 8px ou 12px
```

---

## 3.3 Bordas

```txt
border-default: 1px solid rgba(74, 74, 74, 0.32)
border-hover: 1px solid #4A4A4A
border-focus: 1px solid brand-primary
border-error: 1px solid error
border-disabled: 1px solid rgba(74, 74, 74, 0.16)
```

Regras:

```txt
- Todo campo editável deve ter borda visível.
- Campo em foco deve ter destaque claro.
- Campo com erro deve usar borda de erro.
- Campo disabled deve parecer não interativo.
- Bordas devem derivar do cinza Playpiso #4A4A4A quando não houver token semântico específico.
```

---

## 3.4 Cores semânticas

Em vez de espalhar cores diretamente pelos componentes, usar tokens semânticos.

A referência visual da marca informada no Manual de Produtos Playpiso define a base cromática do formulário:

```txt
brand-red: #FF0000
brand-white: #FFFFFF
brand-gray: #4A4A4A
```

Essas três cores são a fonte principal dos tokens. Variações de estado devem ser feitas por opacidade, tint ou transparência desses valores, evitando introduzir novas cores fixas sem validação de marca.

```txt
color-bg-page
color-bg-card
color-bg-input
color-bg-disabled

color-text-primary
color-text-secondary
color-text-placeholder
color-text-disabled
color-text-error

color-border-default
color-border-hover
color-border-focus
color-border-error

color-brand-primary
color-brand-on-primary
```

Exemplo inicial:

```css
:root {
  --color-brand-red: #FF0000;
  --color-brand-white: #FFFFFF;
  --color-brand-gray: #4A4A4A;

  --color-bg-page: #FFFFFF;
  --color-bg-card: #FFFFFF;
  --color-bg-input: #FFFFFF;
  --color-bg-disabled: rgba(74, 74, 74, 0.08);
  --color-bg-muted: rgba(74, 74, 74, 0.04);
  --color-bg-brand-soft: rgba(255, 0, 0, 0.06);

  --color-text-primary: #4A4A4A;
  --color-text-secondary: rgba(74, 74, 74, 0.78);
  --color-text-placeholder: rgba(74, 74, 74, 0.52);
  --color-text-disabled: rgba(74, 74, 74, 0.48);
  --color-text-error: #FF0000;

  --color-border-default: rgba(74, 74, 74, 0.32);
  --color-border-hover: #4A4A4A;
  --color-border-focus: #FF0000;
  --color-border-error: #FF0000;
  --color-border-disabled: rgba(74, 74, 74, 0.16);

  --color-brand-primary: #FF0000;
  --color-brand-on-primary: #FFFFFF;
  --color-focus-ring: rgba(255, 0, 0, 0.18);
}
```

Regras de aplicação:

```txt
- Vermelho #FF0000 deve ser usado para ações principais, foco, seleção, checked e mensagens críticas.
- Branco #FFFFFF deve predominar nos fundos de página, cards e campos.
- Cinza #4A4A4A deve ser a cor base de textos, bordas neutras e conteúdo secundário.
- Não usar a cor antiga #E30613 como token de marca neste formulário.
- Não criar paleta decorativa adicional sem nova referência visual.
```

---

## 3.5 Tipografia

```txt
Font family:
- Inter, Helvetica, Arial, Lucida, sans-serif
- Se Inter não estiver disponível, o fallback deve seguir exatamente a ordem acima.

Label:
- font-size: 14px
- font-weight: 600
- line-height: 20px

Input text:
- font-size: 14px ou 16px
- font-weight: 400
- line-height: 20px

Helper text:
- font-size: 12px
- font-weight: 400
- line-height: 16px

Error text:
- font-size: 12px
- font-weight: 500
- line-height: 16px
- color: color-text-error

Section title:
- font-size: 18px ou 20px
- font-weight: 700
- line-height: 28px
- color: color-text-primary

Section description:
- font-size: 14px
- font-weight: 400
- line-height: 20px
- color: color-text-secondary
```

Exemplo de declaração global:

```css
body {
  font-family: 'Inter', Helvetica, Arial, Lucida, sans-serif;
  color: var(--color-text-primary);
  background: var(--color-bg-page);
}
```

---

# 4. Componentes de campo

## 4.1 `TextInput`

Uso:

```txt
Campos de texto curto.
Exemplos:
- especificar_cor
- especificar_tipo_grama
- especificar_galvanizacao
```

Especificação visual:

```txt
height: 44px
padding-x: 12px
padding-y: 10px
border-radius: 8px
border: 1px solid color-border-default
background: color-bg-input
font-size: 14px
width: 100%
```

Estrutura:

```txt
Label
Input
HelperText opcional
ErrorMessage opcional
```

Estados:

```txt
default:
- border default

hover:
- border hover

focus:
- border focus
- outline/ring visual discreto usando color-focus-ring

error:
- border error
- exibir mensagem abaixo

disabled:
- background disabled
- texto disabled
- cursor not-allowed
```

---

## 4.2 `NumberInput`

Uso:

```txt
Campos numéricos.
Exemplos:
- largura
- comprimento
- area_total
- quantidade_postes_iluminacao
- altura_postes_iluminacao
- quantidade_projetores
- quantidade_cruzetas
- comprimento_alambrado
- altura_alambrado
```

Especificação visual:

```txt
height: 44px
padding-x: 12px
padding-y: 10px
border-radius: 8px
width: 100%
```

Regras funcionais:

```txt
- Deve aceitar apenas números válidos.
- Deve permitir unidade visual ao lado ou dentro do campo.
- Não deve esconder a unidade no placeholder.
- Deve permitir decimal quando necessário.
```

Unidades:

```txt
m  → largura, comprimento, altura, comprimento de alambrado
m² → área total
un → quantidades
w  → potência, quando aplicável
```

Recomendação de UI para unidade:

```txt
Usar um sufixo visual dentro ou ao lado do input.
Exemplo:
[Largura ______] m
[Área total ___] m²
```

---

## 4.3 `SelectField`

Uso:

```txt
Campos com opções fechadas.
Exemplos:
- variante_quadra_tenis
- tipo_terreno
- dificuldade_acesso
- responsavel_material_pedreira
- cor_piso_asfaltico
- tipo_grama
- galvanizacao
- travamento
```

Especificação visual:

```txt
height: 44px
padding-x: 12px
padding-y: 10px
border-radius: 8px
width: 100%
```

Comportamento:

```txt
- Deve exibir placeholder quando nenhum valor estiver selecionado.
- Deve impedir valor fora da lista.
- Deve exibir label amigável, mas salvar value técnico.
```

Exemplo:

```txt
Label visível:
Solo Preparado

Valor técnico:
solo_preparado
```

---

## 4.4 `SelectWithCustomOption`

Uso:

```txt
Select que permite opção personalizada.
Exemplos:
- potencia_projetores
```

Comportamento:

```txt
- Renderizar como select.
- Incluir opção "Outro".
- Quando "Outro" for selecionado, abrir TextInput complementar logo abaixo.
```

Exemplo visual:

```txt
Potência dos projetores
[ 200w ▼ ]

Se selecionar Outro:

Potência dos projetores
[ Outro ▼ ]

Especificar potência dos projetores
[ ____________ ]
```

Regra:

```txt
O campo complementar deve ser obrigatório quando "Outro" estiver selecionado.
```

---

## 4.5 `CheckboxField`

Uso:

```txt
Campos booleanos.
Exemplos:
- possui_playcushion
- possui_kit_saibro
- incluir_rede_tenis
- possui_iluminacao
- iluminacao_fixada_alambrado
- possui_alambrado
- possui_trelica
- possui_tela_superior
- possui_tela_sombreamento
```

Especificação visual:

```txt
checkbox-size: 18px ou 20px
border-radius: 6px
gap entre checkbox e texto: 8px
label font-size: 14px
```

Comportamento:

```txt
- Deve permitir clique no checkbox e no label.
- Deve ter estado checked claro.
- Deve ter estado focus acessível.
- Deve aceitar helper text abaixo, quando necessário.
- Quando checked, usar preenchimento color-brand-primary e marca interna color-brand-on-primary.
```

Exemplo:

```txt
[ ] Possui iluminação?
```

Com helper:

```txt
[ ] Iluminação será fixada em alambrado da Playpiso, existente ou de terceiros?
    Marque esta opção quando os projetores forem fixados em alambrado existente, de terceiros ou fornecido pela Playpiso.
```

---

## 4.6 `TextAreaField`

Uso:

```txt
Campos de texto longo.
Exemplo:
- observacoes
```

Especificação visual:

```txt
min-height: 120px
padding-x: 12px
padding-y: 10px
border-radius: 8px
resize: vertical
width: 100%
```

Comportamento:

```txt
- Deve aceitar texto livre.
- Não deve ser obrigatório por padrão.
- Deve preservar quebras de linha.
```

---

## 4.7 `ReadOnlyField`

Uso:

```txt
Campos informativos ou calculados que o usuário não deve editar.
Exemplo:
- responsavel_ligacao_eletrica
```

Especificação visual:

```txt
height: 44px
padding-x: 12px
padding-y: 10px
border-radius: 8px
background: color-bg-disabled
border: 1px solid color-border-disabled
color: color-text-secondary
```

Comportamento:

```txt
- Não deve permitir edição.
- Deve ser visualmente diferente de um campo editável.
- Pode ser exibido como texto informativo em vez de input, se fizer mais sentido.
```

Para `responsavel_ligacao_eletrica`, a UI pode mostrar:

```txt
Responsável pela ligação elétrica
Cliente
```

---

# 5. Componentes de estrutura

## 5.1 `SectionCard`

Uso:

```txt
Agrupar campos de uma seção.
Exemplos:
- Dimensões
- Condições da obra
- Iluminação
- Fechamentos e Proteções
```

Especificação visual:

```txt
background: color-bg-card
border: 1px solid color-border-default
border-radius: 16px
padding desktop: 24px
padding mobile: 16px
width: 100%
```

Estrutura:

```txt
SectionTitle
SectionDescription opcional
SectionBody
```

Espaçamento:

```txt
title → description: 4px
description → body: 20px
entre campos: 16px
entre grupos internos: 24px
```

---

## 5.2 `FormGrid`

Uso:

```txt
Organizar campos lado a lado quando fizer sentido.
```

Desktop:

```txt
grid-template-columns: repeat(2, minmax(0, 1fr))
gap: 16px
```

Mobile:

```txt
grid-template-columns: 1fr
gap: 16px
```

Exemplos:

```txt
Dimensões:
- largura e comprimento lado a lado
- área total pode ocupar uma coluna ou linha inteira

Condições da obra:
- três selects podem ocupar grid responsivo
```

---

## 5.3 `FieldGroup`

Uso:

```txt
Agrupar campos relacionados dentro de uma seção.
```

Exemplo:

```txt
Iluminação

Grupo: Dados dos projetores
- quantidade_projetores
- potencia_projetores
- quantidade_cruzetas

Grupo: Postes próprios
- quantidade_postes_iluminacao
- altura_postes_iluminacao
```

Especificação visual:

```txt
padding-top: 16px
gap: 16px
```

Título do grupo:

```txt
font-size: 14px
font-weight: 600
color: color-text-primary
```

---

## 5.4 `ConditionalFieldGroup`

Uso:

```txt
Agrupar campos que aparecem a partir de uma condição.
```

Exemplos:

```txt
Se possui_iluminacao = true:
- abrir grupo de campos internos de iluminação

Se possui_alambrado = true:
- abrir grupo "Dados do alambrado"
```

Comportamento visual:

```txt
- Aparecer abaixo do campo controlador.
- Não abrir modal.
- Não trocar de página.
- Não deixar espaço vazio quando oculto.
```

Estilo recomendado:

```txt
margin-top: 16px
padding: 16px
border-left: 3px solid color-brand-primary
background: color-bg-muted
border-radius: 12px
```

---

# 6. Estados globais dos campos

## 6.1 Default

```txt
Campo visível, editável e sem erro.
```

## 6.2 Focus

```txt
Campo em edição.
Deve ter borda ou ring de destaque.
Usar color-border-focus e color-focus-ring.
```

## 6.3 Error

```txt
Campo inválido.
Deve exibir borda de erro e mensagem abaixo.
```

Exemplo:

```txt
Largura
[        ] m
Campo obrigatório.
```

## 6.4 Disabled

```txt
Campo não editável por regra do sistema.
Deve aparecer visualmente desabilitado.
```

## 6.5 Hidden

```txt
Campo não renderizado.
Não ocupa espaço.
Valor deve ser limpo conforme conditionalRules.
Não deve participar da validação.
```

## 6.6 Read-only

```txt
Campo visível, mas não editável.
Pode participar do payload.
```

---

# 7. Responsividade

## Desktop

```txt
page padding: 32px
form max-width: 960px a 1120px
section padding: 24px
grid: 2 colunas quando fizer sentido
```

## Tablet

```txt
page padding: 24px
section padding: 20px
grid: 2 colunas ou 1 coluna conforme espaço
```

## Mobile

```txt
page padding: 16px
section padding: 16px
grid: 1 coluna
input height: mínimo 44px
```

Regra:

```txt
Nenhum campo deve ficar apertado em mobile.
Checkboxes e labels devem ser fáceis de tocar.
```

---

# 8. Acessibilidade

Regras mínimas:

```txt
- Todo campo deve ter label associado.
- Mensagens de erro devem ser lidas por leitores de tela.
- Inputs devem ser navegáveis por teclado.
- Estado focus deve ser visível.
- Checkbox deve permitir clique no label.
- Placeholder não substitui label.
- Campos obrigatórios devem ser indicados visualmente e semanticamente.
```

Para campos obrigatórios:

```txt
Label: Largura *
```

Ou:

```txt
aria-required="true"
```

Para erro:

```txt
aria-invalid="true"
aria-describedby="largura-error"
```

---

# 9. Mapeamento fieldRegistry → UI component

O `fieldRegistry` deve apontar para um componente visual do `uiComponentRegistry`.

Exemplo:

| Tipo de campo  | Componente UI            |
| -------------- | ------------------------ |
| `string` curto | `TextInput`              |
| `number`       | `NumberInput`            |
| `enum`         | `SelectField`            |
| `enum/custom`  | `SelectWithCustomOption` |
| `boolean`      | `CheckboxField`          |
| `text_long`    | `TextAreaField`          |
| `readonly`     | `ReadOnlyField`          |

Exemplo aplicado:

| Campo                          | Componente               |
| ------------------------------ | ------------------------ |
| `largura`                      | `NumberInput`            |
| `comprimento`                  | `NumberInput`            |
| `area_total`                   | `NumberInput`            |
| `tipo_terreno`                 | `SelectField`            |
| `dificuldade_acesso`           | `SelectField`            |
| `cor_piso_asfaltico`           | `SelectField`            |
| `especificar_cor`              | `TextInput`              |
| `possui_playcushion`           | `CheckboxField`          |
| `potencia_projetores`          | `SelectWithCustomOption` |
| `observacoes`                  | `TextAreaField`          |
| `responsavel_ligacao_eletrica` | `ReadOnlyField`          |

---

# 10. Contrato sugerido para cada componente no registry

Cada componente pode ser documentado com esta estrutura:

```txt
component_id:
name:
category:
description:
used_for:
visual_spec:
  height:
  padding:
  border:
  radius:
  typography:
states:
  default:
  hover:
  focus:
  error:
  disabled:
  hidden:
responsive_behavior:
accessibility_rules:
examples:
```

Exemplo:

```txt
component_id: NumberInput
name: Number Input
category: field
description: Campo usado para capturar valores numéricos.
used_for:
- largura
- comprimento
- area_total
- quantidade_postes_iluminacao

visual_spec:
- height: 44px
- padding-x: 12px
- padding-y: 10px
- border-radius: 8px
- border: 1px solid color-border-default
- width: 100%

states:
- default
- hover
- focus
- error
- disabled
- hidden

responsive_behavior:
- ocupa 100% da largura disponível
- em mobile, sempre uma coluna

accessibility_rules:
- deve ter label associado
- deve indicar erro com aria-invalid
- unidade não substitui label
```

---

# 11. Critérios de aceite do UI Component Registry

A documentação estará boa quando outro LLM/desenvolvedor conseguir responder:

```txt
1. Qual componente renderizar para cada tipo de campo?
2. Qual altura padrão de input usar?
3. Qual padding usar?
4. Qual radius usar?
5. Como mostrar erro?
6. Como mostrar campo desabilitado?
7. Como renderizar seções?
8. Como renderizar campos condicionais?
9. Como adaptar para mobile?
10. Como associar label, helper text e error message?
```

# Próximo passo lógico

Depois do `UI Component Registry`, o próximo documento deve ser o **Form Renderer Contract**, explicando como a aplicação junta `productCatalog`, `sectionRegistry`, `fieldRegistry`, `conditionalRules` e `uiComponentRegistry` para renderizar o formulário final.
