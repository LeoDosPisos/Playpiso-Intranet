# Form Layout / Page Structure — Formulario Comercial Playpiso

## 1. Objetivo

Este documento define a arquitetura visual da pagina do formulario comercial da Playpiso para o produto **Quadra de Tenis**.

Ele especifica como o formulario deve organizar seções, campos, grupos condicionais, acoes e estados de validacao no espaco da tela.

Este contrato complementa:

```txt
05-ui-component-registry.md   -> define componentes visuais e tokens
06-form-renderer-contract.md  -> define como os registries montam o formulario
```

Este documento nao redefine campos, labels, opcoes, regras de negocio ou componentes de input. Essas responsabilidades continuam nos registries apropriados.

---

## 2. Decisao de layout

O formulario comercial da Playpiso deve ser renderizado como uma **pagina unica**, composta por uma pilha vertical de `SectionCard`.

Cada `SectionCard` deve agrupar campos relacionados. Campos condicionais devem aparecer dentro da propria secao relacionada, por progressive disclosure, sem abrir modal e sem mudar de pagina.

O layout deve usar uma coluna principal como padrao. Grids de duas colunas sao permitidos apenas para campos curtos, relacionados e que possam ser comparados ou preenchidos em conjunto.

Em mobile, todo o formulario deve ser renderizado em uma unica coluna.

---

## 3. Recomendacoes aplicadas

As seguintes recomendacoes foram incorporadas ao contrato:

```txt
- Usar pagina unica na primeira versao.
- Usar seções em cards para agrupar campos relacionados.
- Usar progressive disclosure para campos condicionais.
- Evitar wizard/multi-step na primeira versao.
- Evitar sidebar obrigatoria na primeira versao.
- Evitar barra de acoes sticky na primeira versao.
- Usar uma coluna como padrao e duas colunas apenas para campos curtos relacionados.
- Usar tokens visuais do uiComponentRegistry em vez de cores hardcoded.
- Definir comportamento minimo para erros, acoes e responsividade.
```

Recomendacoes de evolucao futura devem ser mencionadas somente na seção **13. Evolucoes futuras**.

---

## 4. Estrutura hierarquica da pagina

A pagina deve seguir esta hierarquia conceitual:

```txt
FormPageShell
  FormHeader
  FormMainContainer
    FormPageTitle
    FormContentLayout
      FormSectionStack
        SectionCard
          SectionHeader
          FormGrid
            FieldWrapper
              FieldRenderer
          ConditionalFieldGroup
    FormActionBar
```

O `FormRenderer` deve montar essa estrutura a partir de:

```txt
productCatalog
sectionRegistry
fieldRegistry
conditionalRules
uiComponentRegistry
```

A ordem das seções deve vir do `productCatalog` e do `sectionRegistry`. A ordem nao deve ser hardcoded no JSX.

---

## 5. Componentes estruturais

### 5.1 `FormPageShell`

Componente raiz da pagina.

Responsabilidades:

```txt
- Definir o background da pagina.
- Controlar a altura minima da tela.
- Incluir o header global.
- Incluir o conteudo principal.
- Incluir a area de acoes do formulario.
```

Especificacao:

```txt
background: color-bg-page
min-height: 100vh
width: 100%
```

### 5.2 `FormHeader`

Header superior da aplicacao.

Responsabilidades:

```txt
- Exibir a marca Playpiso.
- Exibir o nome do modulo ou contexto atual.
- Opcionalmente exibir usuario e acoes globais.
```

Especificacao:

```txt
height desktop: 72px
height mobile: 56px ou 64px
padding-x desktop: spacing-xl
padding-x mobile: spacing-md
width: 100%
```

O `FormHeader` e global da aplicacao, nao exclusivo do formulario.

### 5.3 `FormMainContainer`

Container principal do conteudo.

Responsabilidades:

```txt
- Centralizar o conteudo.
- Controlar a largura maxima da pagina.
- Aplicar padding responsivo.
```

Especificacao:

```txt
max-width: 1200px
margin: 0 auto
padding desktop: spacing-xl
padding tablet: spacing-lg
padding mobile: spacing-md
```

### 5.4 `FormPageTitle`

Bloco de contexto exibido antes das seções.

Responsabilidades:

```txt
- Exibir o titulo da tela.
- Exibir uma descricao curta.
- Exibir o produto selecionado, quando aplicavel.
```

Conteudo recomendado:

```txt
Titulo:
Nova proposta comercial

Descricao:
Preencha os dados abaixo para gerar a proposta comercial e a tabela estruturada de orcamento.
```

Especificacao:

```txt
margin-bottom: spacing-lg
title font-size: 24px ou 28px
description font-size: 14px ou 16px
```

### 5.5 `FormContentLayout`

Componente responsavel pela composicao entre conteudo principal e possiveis paineis auxiliares.

Na primeira versao, o layout deve usar somente uma coluna principal centralizada.

Especificacao da primeira versao:

```txt
Desktop:
- Uma coluna principal centralizada.
- max-width do formulario: 960px.

Tablet:
- Uma coluna.

Mobile:
- Uma coluna.
```

Sidebar nao deve ser obrigatoria na primeira versao.

### 5.6 `FormSectionStack`

Componente responsavel por empilhar as seções do formulario.

Responsabilidades:

```txt
- Renderizar `SectionCard` na ordem definida pelos registries.
- Controlar o espacamento vertical entre seções.
- Omitir seções ocultas por regras condicionais.
```

Especificacao:

```txt
display: flex
flex-direction: column
gap: spacing-lg
```

### 5.7 `SectionCard`

Componente visual de cada secao do formulario.

Responsabilidades:

```txt
- Agrupar campos relacionados.
- Separar visualmente uma secao da outra.
- Receber titulo, descricao opcional e conteudo.
- Exibir estado da secao quando aplicavel.
```

Especificacao:

```txt
background: color-bg-card
border: 1px solid color-border-default
border-radius: radius-lg
padding desktop: spacing-lg
padding mobile: spacing-md
```

### 5.8 `SectionHeader`

Cabecalho interno do `SectionCard`.

Responsabilidades:

```txt
- Exibir titulo da secao.
- Exibir descricao curta opcional.
- Exibir status da secao quando aplicavel.
```

Exemplo:

```txt
Dimensoes
Informe a largura, comprimento e area total da quadra.
```

Especificacao:

```txt
title font-size: 18px ou 20px
title font-weight: 700
description font-size: 14px
margin-bottom: spacing-md ou spacing-lg
```

### 5.9 `FormGrid`

Grid interno de campos dentro de cada secao.

O `FormGrid` deve suportar uma ou duas colunas em desktop, conforme a configuracao da secao e dos campos.

Regra padrao:

```txt
- Uma coluna para textos longos, selects extensos, observacoes e campos independentes.
- Duas colunas para campos curtos, relacionados e comparaveis.
- Mobile sempre usa uma coluna.
```

Especificacao:

```txt
Desktop:
grid-template-columns: repeat(2, minmax(0, 1fr))
gap: spacing-md

Mobile:
grid-template-columns: 1fr
gap: spacing-md
```

Quando uma secao ou campo exigir largura total, o item deve ocupar as duas colunas em desktop.

### 5.10 `FieldWrapper`

Wrapper estrutural de cada campo.

Responsabilidades:

```txt
- Renderizar label.
- Renderizar controle de input.
- Renderizar helper text.
- Renderizar mensagem de erro.
- Controlar o espacamento interno do campo.
- Conectar label e controle por atributos acessiveis.
```

Estrutura:

```txt
FieldWrapper
  FieldLabel
  FieldControl
  HelperText
  ErrorMessage
```

### 5.11 `ConditionalFieldGroup`

Grupo de campos exibido por regra condicional.

Exemplos:

```txt
- Campos internos de iluminacao.
- Dados do alambrado.
- Especificar cor.
- Especificar tipo de grama.
```

Comportamento:

```txt
- Deve aparecer no mesmo card da secao relacionada.
- Nao deve abrir modal.
- Nao deve mudar de pagina.
- Nao deve ocupar espaco quando oculto.
- Deve limpar valores quando oculto, conforme conditionalRules.
- Deve validar apenas campos visiveis.
```

Especificacao visual:

```txt
margin-top: spacing-md
padding: spacing-md
border-left: 3px solid color-brand-primary
background: color-bg-muted
border-radius: radius-md ou radius-lg
```

### 5.12 `FormActionBar`

Area de botoes do formulario.

Na primeira versao, a barra de acoes deve aparecer no final da pagina, abaixo da pilha de seções.

Responsabilidades:

```txt
- Permitir salvar rascunho.
- Permitir cancelar.
- Permitir gerar proposta.
- Preparar espaco para geracao de Excel em versao futura.
```

Especificacao:

```txt
margin-top: spacing-xl
display: flex
justify-content: flex-end
gap: spacing-sm
```

Mobile:

```txt
flex-direction: column-reverse
buttons width: 100%
```

---

## 6. Regras de composicao com registries

### 6.1 Seções

Cada item de secao definido no `sectionRegistry` deve ser renderizado como um `SectionCard`.

O renderizador deve:

```txt
1. Ler a lista de seções do produto.
2. Resolver cada definicao no sectionRegistry.
3. Avaliar visibilidade da secao.
4. Renderizar SectionCard apenas quando a secao estiver visivel.
5. Renderizar os campos da secao na ordem definida pelo registry.
```

### 6.2 Campos

Cada campo definido na secao deve ser renderizado como:

```txt
FieldWrapper
  FieldRenderer
```

O `FieldRenderer` deve resolver o componente visual no `uiComponentRegistry`.

### 6.3 Campos condicionais

Campos condicionais devem ser controlados pelo `conditionalRules`.

O layout nao deve conter regras de negocio hardcoded. O layout deve apenas oferecer a estrutura visual para que os campos aparecam ou desaparecam.

### 6.4 Largura dos campos

Quando necessario, a definicao de secao ou campo pode informar metadados de layout.

Metadados recomendados:

```ts
type FieldLayout = {
  span?: 1 | 2 | "full";
  groupId?: string;
  preferredColumns?: 1 | 2;
};
```

Esses metadados devem ser usados somente para distribuicao visual. Eles nao devem alterar validacao, valores ou regras de negocio.

---

## 7. Responsividade

### 7.1 Desktop

```txt
Viewport base: >= 1024px
FormMainContainer max-width: 1200px
Formulario max-width: 960px
SectionCard padding: spacing-lg
FormGrid: ate 2 colunas
```

### 7.2 Tablet

```txt
Viewport base: 768px a 1023px
FormMainContainer padding: spacing-lg
Formulario: uma coluna principal
FormGrid: preferencialmente 1 coluna; 2 colunas apenas se houver espaco suficiente
```

### 7.3 Mobile

```txt
Viewport base: < 768px
FormMainContainer padding: spacing-md
Formulario: uma coluna
FormGrid: uma coluna
FormActionBar: botoes empilhados com width 100%
```

Nenhum texto, botao, input ou card deve estourar horizontalmente em mobile.

---

## 8. Estados de validacao e erro

### 8.1 Erro por campo

Erros de campo devem aparecer dentro do `FieldWrapper`, abaixo do controle correspondente.

O campo invalido deve:

```txt
- Usar estado visual de erro definido no uiComponentRegistry.
- Exibir mensagem textual objetiva.
- Manter associacao acessivel entre input e mensagem de erro.
```

### 8.2 Erro por secao

Uma secao com campos invalidos pode exibir um status no `SectionHeader`.

O status deve indicar que ha pendencias naquela secao, sem substituir as mensagens por campo.

### 8.3 Erro global

Ao tentar submeter um formulario invalido, a pagina deve:

```txt
- Impedir a submissao.
- Levar o foco para o primeiro campo invalido visivel.
- Exibir erros proximos aos campos correspondentes.
```

Se o erro vier de falha de rede, permissao ou processamento externo, a pagina deve exibir uma mensagem global acima da `FormActionBar` ou proxima ao topo do formulario.

### 8.4 Campos ocultos

Campos ocultos por `conditionalRules` nao devem ser validados e nao devem aparecer no payload final.

Quando uma regra determinar limpeza de valor, o valor do campo oculto deve ser removido do estado do formulario.

---

## 9. Estados de acao

Os botoes da `FormActionBar` devem suportar estados de carregamento, sucesso, erro e disabled.

### 9.1 Salvar rascunho

Comportamento esperado:

```txt
- Deve salvar os valores atuais permitidos pelo estado do formulario.
- Deve indicar carregamento durante a operacao.
- Deve indicar sucesso ou falha.
```

### 9.2 Cancelar

Comportamento esperado:

```txt
- Se houver alteracoes nao salvas, deve pedir confirmacao antes de sair.
- Se nao houver alteracoes, pode retornar imediatamente ao fluxo anterior.
```

### 9.3 Gerar proposta

Comportamento esperado:

```txt
- Deve validar campos visiveis e obrigatorios.
- Deve impedir submissao quando houver erro.
- Deve indicar carregamento durante a geracao.
- Deve evitar duplo clique ou dupla submissao.
```

---

## 10. Acessibilidade

O formulario deve seguir requisitos minimos de acessibilidade:

```txt
- Todo campo deve possuir label associado.
- Mensagens de erro devem estar associadas ao campo correspondente.
- Campos disabled devem ser perceptiveis visualmente e por tecnologia assistiva.
- Ordem de tabulacao deve seguir a ordem visual.
- Ao submeter com erro, o foco deve ir para o primeiro campo invalido visivel.
- Estados de erro nao devem depender apenas de cor.
- Componentes condicionais devem ser inseridos em ordem logica no DOM.
```

---

## 11. Fora do escopo deste documento

Este documento nao define:

```txt
- Lista de campos do produto.
- Labels e textos finais de todos os campos.
- Opcoes de selects.
- Regras condicionais de negocio.
- Calculos de orcamento.
- Payload final de exportacao.
- Layout de proposta em PPTX ou XLSX.
- Implementacao tecnica de bibliotecas React.
```

Esses itens devem permanecer nos documentos e registries especificos.

---

## 12. Criterios de aceite

O layout sera considerado aderente a este contrato quando:

```txt
1. A pagina renderizar o formulario como pagina unica.
2. As seções forem renderizadas como SectionCards em pilha vertical.
3. A ordem das seções vier dos registries, sem hardcode no JSX.
4. Os campos forem renderizados por FieldWrapper + FieldRenderer.
5. Campos condicionais aparecerem dentro da secao relacionada.
6. Campos condicionais ocultos nao ocuparem espaco.
7. Campos ocultos nao forem validados nem enviados no payload final.
8. O layout desktop respeitar max-width e espaçamentos definidos.
9. O layout mobile usar uma unica coluna sem overflow horizontal.
10. Erros por campo aparecerem abaixo do campo correspondente.
11. Submissao invalida focar o primeiro campo invalido visivel.
12. A FormActionBar aparecer no final da pagina na primeira versao.
13. Os botoes suportarem loading, disabled e prevencao de dupla submissao.
14. Cores, bordas, radius e espaçamentos usarem tokens do uiComponentRegistry.
```

---

## 13. Evolucoes futuras

As seguintes melhorias podem ser consideradas depois que a primeira versao estiver estabilizada:

```txt
- Sidebar direita com resumo da proposta.
- Indicador de seções incompletas.
- Navegacao por ancora entre seções.
- Barra de acoes sticky.
- Fluxo multi-step ou wizard para produtos com formularios muito longos.
- Geracao direta de Excel a partir da FormActionBar.
```

Essas evolucoes nao fazem parte do contrato obrigatorio da primeira versao.
                                                                                                                                                                                    