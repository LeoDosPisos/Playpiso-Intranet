Como o sistema usa:
- fieldRegistry
- sectionRegistry
- productCatalog
- conditionalRules
- uiComponentRegistry
- fieldOptionsRegistry

para renderizar o formulário final.

Form Renderer Contract

O formulário deve ler:
- productCatalog para saber qual produto carregar
- sectionRegistry para saber quais seções renderizar
- fieldRegistry para saber quais campos renderizar
- conditionalRules para saber o que exibir, ocultar, limpar e validar
- uiComponentRegistry para saber qual componente visual usar
- fieldOptionsRegistry para saber quais opções renderizar em campos enum

Abaixo está uma versão inicial bem estruturada do documento **Form Renderer Contract**.

Sugestão de caminho:

```txt
docs/
  proposta-comercial/
    formulario/
      06-form-renderer-contract.md
```

---

# Form Renderer Contract — Formulário Comercial Playpiso

## 1. Objetivo

O **Form Renderer Contract** define como a aplicação deve combinar os registries do formulário para renderizar a interface final usada pelo Comercial da Playpiso.

Este contrato explica como a aplicação deve usar:

```txt
productCatalog
sectionRegistry
fieldRegistry
conditionalRules
uiComponentRegistry
fieldOptionsRegistry
```

para construir dinamicamente um formulário funcional, validável e consistente entre produtos.

O objetivo é garantir que o formulário seja gerado a partir de configuração declarativa, evitando hardcode excessivo de campos, seções e regras dentro dos componentes React.

---

# 2. Responsabilidade de cada registry

## 2.1 `productCatalog`

Responsável por definir **qual produto está sendo renderizado**.

Ele informa:

```txt
- product_id
- label do produto
- variantes disponíveis
- aliases/sinônimos
- seções utilizadas pelo produto
- ordem das seções
- valores padrão do produto
```

Exemplo conceitual:

```txt
Produto:
Quadra de Tênis

Variantes:
- Piso Asfáltico
- Saibro
- Grama

Seções:
- dados_cliente
- dados_obra
- produto_variante
- dimensoes
- condicoes_obra
- especificacoes_variante
- iluminacao
- fechamentos_protecoes
- acessorios
- observacoes
```

O `productCatalog` não deve definir detalhes visuais dos campos.

---

## 2.2 `sectionRegistry`

Responsável por definir **como os campos são organizados visualmente**.

Ele informa:

```txt
- id da seção
- título da seção
- descrição opcional
- ordem dos campos dentro da seção
- escopo da seção
- se a seção é sempre visível ou dinâmica
- grupos internos de campos
```

Exemplo:

```txt
Seção: dimensoes

Campos:
- largura
- comprimento
- area_total
```

O `sectionRegistry` não deve redefinir labels, opções ou tipos dos campos.

---

## 2.3 `fieldRegistry`

Responsável por definir **cada campo individualmente**.

Ele informa:

```txt
- chave técnica do campo
- label da UI
- tipo de dado
- componente visual sugerido
- opções, quando existirem
- valor padrão, quando existir
- unidade de medida
- obrigatoriedade base
- texto auxiliar
```

Exemplo:

```txt
Campo:
largura

Label:
Largura

Tipo:
number

Componente:
NumberInput

Unidade:
m
```

O `fieldRegistry` não deve organizar layout de seções.

---

## 2.4 `conditionalRules`

Responsável por definir **comportamentos dinâmicos**.

Ele informa:

```txt
- quando campos aparecem
- quando campos somem
- quando campos viram obrigatórios
- quando valores devem ser limpos
- quando valores devem ser calculados
- dependências entre campos
```

Exemplo:

```txt
Se variante_quadra_tenis = piso_asfaltico:
  exibir cor_piso_asfaltico
  exibir possui_playcushion
  ocultar possui_kit_saibro
  ocultar tipo_grama
```

O `conditionalRules` é a fonte de verdade para comportamento condicional.

---

## 2.5 `uiComponentRegistry`

Responsável por definir **como cada componente visual deve ser renderizado**.

Ele informa:

```txt
- componente visual
- altura
- padding
- radius
- border
- estados visuais
- responsividade
- acessibilidade
```

Exemplo:

```txt
Componente:
NumberInput

Altura:
44px

Padding:
12px horizontal, 10px vertical

Radius:
8px
```

---

## 2.6 `fieldOptionsRegistry`

Responsável por definir **quais opções cada campo enum pode renderizar e salvar**.

Ele informa:

```txt
- field_id do campo enum
- value técnico salvo no estado e no payload
- label amigável exibido na UI
- aliases quando aplicável
- opção default quando aplicável
```

Exemplo:

```txt
Campo:
tipo_terreno

Opções:
- solo_preparado -> Solo Preparado
- laje_concreto  -> Laje/Concreto
```

O `fieldOptionsRegistry` é a fonte de verdade para `SelectField` e `SelectWithCustomOption`.

---

# 3. Fluxo geral de renderização

O renderizador do formulário deve seguir este fluxo:

```txt
1. Receber product_id.
2. Buscar produto no productCatalog.
3. Carregar variantes disponíveis do produto.
4. Carregar lista de seções do produto.
5. Para cada seção, buscar sua definição no sectionRegistry.
6. Para cada campo da seção, buscar sua definição no fieldRegistry.
7. Para cada campo, buscar o componente visual no uiComponentRegistry.
8. Para cada campo enum, buscar opções no fieldOptionsRegistry.
9. Aplicar valores padrão definidos pelo productCatalog e fieldRegistry.
10. Aplicar conditionalRules.
11. Renderizar apenas seções e campos visíveis.
12. Validar apenas campos visíveis e obrigatórios.
13. Limpar valores de campos ocultos conforme regras.
14. Gerar payload final com os dados válidos.
```

Representação simplificada:

```txt
productCatalog
      ↓
sectionRegistry
      ↓
fieldRegistry
      ↓
uiComponentRegistry
      ↓
fieldOptionsRegistry
      ↓
conditionalRules
      ↓
Formulário renderizado
```

---

# 4. Contrato de entrada do Form Renderer

O componente renderizador deve receber, no mínimo:

```ts
type FormRendererInput = {
  productId: string;
  initialValues?: Record<string, unknown>;
  mode?: "create" | "edit" | "readonly";
};
```

Exemplo:

```ts
<FormRenderer
  productId="quadra_tenis"
  mode="create"
/>
```

## Campos

### `productId`

Identifica qual produto será renderizado.

Exemplo:

```txt
quadra_tenis
```

### `initialValues`

Valores iniciais usados para edição, rascunho ou preenchimento prévio.

Exemplo:

```ts
{
  variante_quadra_tenis: "piso_asfaltico",
  largura: 18,
  comprimento: 36
}
```

### `mode`

Define o modo de uso do formulário.

```txt
create   → criação de nova proposta
edit     → edição de uma proposta existente
readonly → visualização sem edição
```

---

# 5. Contrato de saída do Form Renderer

Ao submeter o formulário, o renderizador deve produzir um payload estruturado.

Exemplo conceitual:

```ts
type FormRendererOutput = {
  productId: string;
  variantId?: string;
  values: Record<string, unknown>;
  computed: Record<string, unknown>;
  metadata: {
    submittedAt: string;
    mode: "create" | "edit" | "readonly";
  };
};
```

Exemplo para Quadra de Tênis:

```json
{
  "productId": "quadra_tenis",
  "variantId": "piso_asfaltico",
  "values": {
    "variante_quadra_tenis": "piso_asfaltico",
    "largura": 18,
    "comprimento": 36,
    "area_total": 648,
    "tipo_terreno": "solo_preparado",
    "dificuldade_acesso": "facil",
    "responsavel_material_pedreira": "playpiso",
    "cor_piso_asfaltico": "padrao",
    "possui_playcushion": true,
    "possui_iluminacao": false,
    "possui_alambrado": false,
    "possui_tela_superior": false,
    "possui_tela_sombreamento": false,
    "incluir_rede_tenis": true
  },
  "computed": {
    "area_total_calculada": 648
  },
  "metadata": {
    "submittedAt": "2026-05-04T00:00:00.000Z",
    "mode": "create"
  }
}
```

Campos ocultos por regra condicional não devem aparecer no payload final.

---

# 6. Ordem de execução das regras

O renderizador deve aplicar regras em uma ordem previsível.

## Ordem recomendada

```txt
1. Inicializar estado do formulário.
2. Aplicar valores padrão.
3. Aplicar cálculos automáticos.
4. Avaliar visibilidade.
5. Limpar campos ocultos.
6. Avaliar obrigatoriedade.
7. Avaliar erros.
8. Renderizar UI atualizada.
```

---

# 7. Inicialização do formulário

Ao iniciar o formulário, a aplicação deve:

```txt
1. Buscar o produto no productCatalog.
2. Carregar as seções associadas ao produto.
3. Montar a árvore de seções e campos.
4. Aplicar initialValues, caso existam.
5. Aplicar defaultValues do produto.
6. Aplicar defaultValues dos campos.
7. Executar conditionalRules iniciais.
```

Para Quadra de Tênis, os valores padrão são:

```txt
largura = 18
comprimento = 36
area_total = largura × comprimento
```

A variante deve ser obrigatória. Caso a decisão seja iniciar sem valor padrão, o select deve exibir:

```txt
Selecione a variante
```

---

# 8. Renderização de seções

Cada seção deve ser renderizada usando o componente `SectionCard`.

A seção deve receber:

```ts
type SectionRenderInput = {
  sectionId: string;
  title: string;
  description?: string;
  fields: FieldDefinition[];
  visibility: "always" | "conditional" | "dynamic";
};
```

## Comportamento

```txt
- Se a seção estiver visível, renderizar SectionCard.
- Se a seção estiver oculta, não renderizar.
- Se a seção possuir campos condicionais, renderizar apenas os campos visíveis.
- Se uma seção global for referenciada, buscar sua definição no registry global.
```

Exemplo:

```txt
section_id: dimensoes

Renderizar:
- largura
- comprimento
- area_total
```

---

# 9. Renderização de campos

Cada campo deve ser renderizado a partir do `fieldRegistry`.

O renderizador deve:

```txt
1. Ler field_id.
2. Buscar definição do campo.
3. Verificar se o campo está visível.
4. Identificar componente visual.
5. Buscar especificação visual no uiComponentRegistry.
6. Renderizar label, input, helper text e erro.
```

Exemplo:

```txt
field_id:
largura

fieldRegistry:
type = number
component = NumberInput
unit = m

uiComponentRegistry:
NumberInput
height = 44px
padding = 12px 10px
radius = 8px

Resultado:
renderizar campo numérico com unidade "m".
```

---

# 10. Mapeamento entre fieldRegistry e uiComponentRegistry

O renderizador deve respeitar o componente indicado pelo campo.

| Tipo no fieldRegistry | Componente UI            |
| --------------------- | ------------------------ |
| `string`              | `TextInput`              |
| `number`              | `NumberInput`            |
| `enum`                | `SelectField`            |
| `enum/custom`         | `SelectWithCustomOption` |
| `boolean`             | `CheckboxField`          |
| `text_long`           | `TextAreaField`          |
| `readonly`            | `ReadOnlyField`          |

Exemplo:

```txt
largura → NumberInput
tipo_terreno → SelectField
possui_iluminacao → CheckboxField
observacoes → TextAreaField
responsavel_ligacao_eletrica → ReadOnlyField
```

---

# 11. Renderização de campos condicionais

Campos condicionais devem aparecer no mesmo contexto visual da seção onde pertencem.

## Exemplo: Cor não padrão

```txt
Campo controlador:
cor_piso_asfaltico

Condição:
cor_piso_asfaltico = nao_padrao

Campo exibido:
especificar_cor
```

Comportamento visual:

```txt
- especificar_cor aparece logo abaixo de cor_piso_asfaltico.
- especificar_cor se torna obrigatório.
- se o usuário trocar Cor para Padrão ou Azul, especificar_cor desaparece e seu valor é limpo.
```

## Exemplo: Iluminação

```txt
Campo controlador:
possui_iluminacao

Condição:
possui_iluminacao = true

Campos exibidos:
- iluminacao_fixada_alambrado
- quantidade_postes_iluminacao
- altura_postes_iluminacao
- quantidade_projetores
- potencia_projetores
- quantidade_cruzetas
- responsavel_ligacao_eletrica
```

Comportamento visual:

```txt
- Os campos aparecem dentro da seção Iluminação.
- Não deve abrir modal.
- Não deve navegar para outra página.
- Não deve deixar espaço vazio quando oculto.
```

---

# 12. Limpeza de valores ocultos

Regra global:

```txt
Quando um campo ficar oculto por mudança de condição, seu valor deve ser limpo.
```

Exemplo:

```txt
Usuário seleciona variante Grama.
Preenche tipo_grama = outros.
Preenche especificar_tipo_grama = "Zoysia".

Depois troca a variante para Piso Asfáltico.

Resultado:
- tipo_grama é limpo.
- especificar_tipo_grama é limpo.
- esses campos não entram no payload final.
```

## Estratégia recomendada

O renderizador deve manter uma lista de campos visíveis.

Durante cada atualização:

```txt
1. Recalcular campos visíveis.
2. Comparar com campos anteriormente visíveis.
3. Identificar campos que deixaram de ser visíveis.
4. Limpar valores desses campos.
5. Atualizar estado do formulário.
```

---

# 13. Validação

O renderizador deve validar apenas campos visíveis.

## Campos sempre obrigatórios da Quadra de Tênis

```txt
- variante_quadra_tenis
- largura
- comprimento
- tipo_terreno
- dificuldade_acesso
- responsavel_material_pedreira
```

## Campos obrigatórios condicionais

```txt
Se cor_piso_asfaltico = nao_padrao:
- especificar_cor

Se tipo_grama = outros:
- especificar_tipo_grama

Se potencia_projetores = outro:
- especificar_potencia_projetores

Se galvanizacao = outro:
- especificar_galvanizacao
```

## Regra global

```txt
Campos ocultos não devem bloquear envio do formulário.
Campos ocultos não devem exibir mensagens de erro.
Campos ocultos não devem permanecer no payload final.
```

---

# 14. Cálculos automáticos

O renderizador deve suportar campos calculados.

## Exemplo: Área total

```txt
Campo calculado:
area_total

Fórmula:
largura × comprimento
```

Comportamento:

```txt
- Ao alterar largura, recalcular area_total.
- Ao alterar comprimento, recalcular area_total.
- area_total deve permitir edição manual.
```

## Regra de sobrescrita manual

Quando o usuário editar manualmente `area_total`, o sistema deve registrar que o valor foi sobrescrito.

Exemplo conceitual:

```ts
computedState = {
  area_total: {
    isOverridden: true,
    originalCalculatedValue: 648,
    currentValue: 640
  }
}
```

Comportamento recomendado:

```txt
- Enquanto area_total não for editada manualmente, recalcular automaticamente.
- Quando area_total for editada manualmente, parar de sobrescrever automaticamente.
- A interface deve indicar que o valor foi ajustado manualmente.
```

Texto auxiliar sugerido:

```txt
Área calculada automaticamente. Edite apenas se precisar ajustar o valor.
```

---

# 15. Estado interno do formulário

O renderizador deve manter, pelo menos, estes estados:

```ts
type FormState = {
  values: Record<string, unknown>;
  visibleFields: string[];
  visibleSections: string[];
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  computedOverrides: Record<string, boolean>;
};
```

## `values`

Armazena os valores preenchidos.

## `visibleFields`

Lista os campos atualmente visíveis.

## `visibleSections`

Lista as seções atualmente visíveis.

## `errors`

Mensagens de erro por campo.

## `touched`

Indica campos que o usuário já interagiu.

## `dirty`

Indica campos alterados em relação ao valor inicial.

## `computedOverrides`

Indica campos calculados que foram editados manualmente.

---

# 16. Eventos mínimos do renderizador

O Form Renderer deve suportar os seguintes eventos:

```ts
onFieldChange(fieldId: string, value: unknown): void;

onFieldBlur(fieldId: string): void;

onSubmit(): FormRendererOutput;

onReset(): void;

onVariantChange(variantId: string): void;
```

## `onFieldChange`

Executa quando um campo muda.

Deve disparar:

```txt
- atualização do valor
- recalcular campos computados
- reavaliar conditionalRules
- limpar campos ocultos
- revalidar campos visíveis
```

## `onVariantChange`

Executa quando a variante muda.

Deve disparar:

```txt
- atualização da variante
- reavaliação da seção especificacoes_variante
- limpeza dos campos específicos da variante anterior
- renderização dos campos da nova variante
```

---

# 17. Comportamento por modo

## `create`

```txt
- Aplica valores padrão.
- Campos editáveis.
- Validação ativa.
```

## `edit`

```txt
- Usa initialValues.
- Mantém valores já preenchidos quando ainda válidos.
- Limpa valores que se tornarem incompatíveis com regras atuais.
```

## `readonly`

```txt
- Nenhum campo editável.
- Campos podem ser renderizados como ReadOnlyField.
- Botão de submit não deve aparecer.
- Regras de visibilidade continuam válidas.
```

---

# 18. Tratamento de erros

Cada erro deve aparecer próximo ao campo correspondente.

Exemplo:

```txt
Largura *
[        ] m
Campo obrigatório.
```

Regras:

```txt
- Erro deve aparecer abaixo do campo.
- Campo com erro deve usar estado visual error.
- Erro deve ser removido quando o valor se tornar válido.
- Campo oculto não deve manter erro visível.
```

Mensagens padrão recomendadas:

```txt
Campo obrigatório.
Valor inválido.
Informe um número válido.
Selecione uma opção.
Informe a especificação solicitada.
```

---

# 19. Contrato específico para Quadra de Tênis

Para renderizar **Quadra de Tênis**, a aplicação deve carregar:

```txt
product_id:
quadra_tenis
```

Deve usar as seções:

```txt
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
```

Deve aplicar valores padrão:

```txt
largura = 18
comprimento = 36
area_total = largura × comprimento
```

Deve exigir:

```txt
- variante_quadra_tenis
- largura
- comprimento
- tipo_terreno
- dificuldade_acesso
- responsavel_material_pedreira
```

Deve renderizar variante como:

```txt
Select
```

Deve interpretar:

```txt
Quadra de Tênis P.A. = Quadra de Tênis Piso Asfáltico
```

---

# 20. Critérios de aceite

O Form Renderer Contract estará corretamente implementado quando:

```txt
1. A aplicação renderizar o formulário a partir do productCatalog.
2. As seções forem carregadas a partir do sectionRegistry.
3. Os campos forem carregados a partir do fieldRegistry.
4. Os componentes visuais forem definidos pelo uiComponentRegistry.
5. As regras dinâmicas forem aplicadas pelo conditionalRules.
6. Campos ocultos não aparecerem na UI.
7. Campos ocultos forem limpos.
8. Campos ocultos não bloquearem validação.
9. Campos obrigatórios visíveis exibirem erro quando vazios.
10. A área total for calculada automaticamente.
11. A área total puder ser editada manualmente.
12. A troca de variante limpar campos da variante anterior.
13. Iluminação fixada no alambrado ocultar campos de postes próprios.
14. Tela superior e tela de sombreamento continuarem visíveis mesmo sem alambrado.
15. O payload final conter apenas dados válidos e relevantes.
```

---

# 21. Próximo passo lógico

Após este contrato, o próximo passo é transformar a documentação em uma estrutura técnica inicial:

```txt
src/
  config/
    proposal-form/
      products/
        quadra-tenis/
          fieldRegistry.ts
          sectionRegistry.ts
          productCatalog.ts
          conditionalRules.ts

      ui/
        uiComponentRegistry.ts

  components/
    form-renderer/
      FormRenderer.tsx
      SectionRenderer.tsx
      FieldRenderer.tsx
      fields/
        TextInput.tsx
        NumberInput.tsx
        SelectField.tsx
        CheckboxField.tsx
        TextAreaField.tsx
        ReadOnlyField.tsx
```

O fluxo de implementação deve começar pelo `FieldRenderer`, porque ele é o ponto que conecta `fieldRegistry` com `uiComponentRegistry`.
