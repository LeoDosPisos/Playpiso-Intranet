# Revisão da Estrutura do Formulário

- Produto Quadra Poliesportiva pode ser composto por PU 200 B. 
O material PU 200B tem duas variantes: B9, B7

- Unificar Pista de Atletismo e Pista de Caminhada para apenas Pista

- Retirar P.U. 200B 

- 

- Retirar Quadra Poli P.U. 200B

- Acrescentar um campo para cada luminária. Existe a luminário de Tipo 1, a luminária de Tipo 2

- A quadra de Padel pode ter a superfície de grama sintética ou de piso asfáltico. Além disso,

- Qualquer produto com piso de assoalho não tem pintura



```29/04/2026

- Incluir o campo de quantidade nos produtos adicionados

```


# Estrutura do Formulario Comercial <> Orcamento

Este documento organiza os requisitos para um formulario comercial capaz de coletar os dados de entrada do orcamento e gerar uma tabela em Excel. O objetivo e reduzir o retrabalho entre Comercial e Orcamento, mantendo os dados estruturados no mesmo formato utilizado nas fórumulas do Alexandre.

## Objetivo

- Reduzir o tempo gasto para transcrever dados da Proposta Comercial para a planilha de orcamento.
- Padronizar o preenchimento das informacoes necessarias para calculo.
- Gerar um Excel com dados consistentes, prontos para uso pelo time de Orcamento.

## Fluxo do Processo

### Atual

1. O Comercial gera a Proposta Comercial.
2. O Alexandre, do Orcamento, le a proposta e passa os dados a limpo.
3. O Alexandre executa os calculos na planilha.

### Planejado

1. O Comercial preenche o formulario.
2. O sistema gera um Excel com os dados estruturados.
3. O Comercial envia esse material para o Orcamento.
4. O Alexandre recebe a tabela pronta e executa os calculos.

## Regras Gerais do Formulario

- `Dimensoes` devem ser obrigatorias sempre que o produto exigir area, comprimento, largura ou altura.
- `Dados do cliente` devem ser obrigatorios.
- Todo produto deve ter campo de `Observacoes`.
- Todo projeto deve indicar se e `Obra nova` ou `Reforma`.
- Em casos de `Reforma`, registrar explicitamente:
  - se ha intervencao em alambrado;
  - se ha intervencao em iluminacao;
  - quais dimensoes correspondem apenas a area reformada;
  - observacoes especificas da reforma.
- A secao de `Iluminacao` deve vir antes de `Alambrado`.
- Em `Iluminacao`, prever a opcao `Fixado no alambrado`. Quando marcada, indicar que nao havera postes.

## Componentes Reutilizaveis

### Manutencao

- Tipo de componente: `Checkbox`

### Iluminacao

- Tipo de componente: `Checkbox`

#### Parametros

- `Quantidade de luminarias`
- `Potencia`
  - Definir se o campo deve registrar potencia dos projetores ou outro criterio tecnico.
- `Quantidade de Cruzetas`
  - Opcoes previstas: `2`, `3`, `4`, `5` ou `6`, com variacoes `simples` e `dupla`.
- `Quantidade de Postes`
  - `Altura do Poste`
- `Fixado no alambrado`
  - Tipo de componente: `Checkbox`
- `Conligado?`
  - Tipo de componente: `Checkbox`
- `Tipo de Coligação`
  - Opções previstas: `Lateral`, `Fundo`

#### Ponto em aberto

- A iluminacao muda conforme o produto. Exemplo: uma luminaria pode ser usada para tenis e outra para squash. Definir se o formulario deve filtrar opcoes por produto.

### Alambrado

- Tipo de componente: `Checkbox`

#### Parametros

- `Comprimento`
  - Tipo de interface: `Input numerico`
  - Unidade: `metros`
- `Altura`
  - Tipo de interface: `Input numerico`
  - Unidade: `metros`
- `Espaçamento`
  - Tipo de interface: `Input numerico`
  - Unidade: `metros`
- `Galvanizacao`
  - Valores previstos: `Fogo`, `Eletrolitico`, `Outro`
- `Coligado`
  - Tipo Coligação: Lateral ou Fundo 
  - Divisor: Sim ou Nao
- `Tipo de estrutura`
- `Travamento`
  - Valores previstos: `Superior`, `Intermediario`, `Inferior`
- `Tela superior`
  - Tipo de interface: `Checkbox`
- `Tela de sombreamento`
  - Tipo de interface: `Checkbox`

### Acessorios

- Tipo de interface: `Checkbox` para cada variante

#### Variantes previstas

- `Basquete adulto` para `Quadra Poliesportiva` -> *Metálica, Hidráulica, ou Comum*
- `Basquete juvenil` para `Quadra Poliesportiva` 
- `Volei` para `Quadra Poliesportiva`
- `Futebol/Futsal` para `Quadra Poliesportiva` e `Campo`
- `Tenis`
  - Definir quais acessorios sao aplicaveis

#### Parametros especificos de basquete

- `Estrutura`
  - Valores previstos: `Metalica`, `Hidraulica`

## Parametros Compartilhados

### Dimensoes

- `Altura`
  - Tipo de interface: `Input numerico`
  - Unidade: `metros`
- `Comprimento`
  - Tipo de interface: `Input numerico`
  - Unidade: `metros`
- `Largura`
  - Tipo de interface: `Input numerico`
  - Unidade: `metros`

### Dificuldade de Acesso

- Tipo de interface: `Dropdown`
- Valores previstos:
  - `Facil acesso`
  - `Medio acesso`
  - `Dificil acesso`

#### Ponto em aberto

- Definir como descrever a dificuldade de acesso da obra e como esse dado afeta o orcamento.

### Material de Pedreira

- Tipo de interface: `Dropdown`
- Valores previstos:
  - `Playpiso`
  - `Cliente`

### Tipo de Terreno

- Valores ja citados:
  - `Solo natural`
  - `Aterro`
  - `Laje`

#### Ponto em aberto

- Consolidar a nomenclatura correta e decidir quais opcoes realmente devem aparecer no formulario.

### Cor

- Tipo de interface: `Dropdown`
- Opções previstas: `Padrão`, `Não Padrão`, `Azul` 
- Comportamento esperado:
  - listar cores padrao;
  - oferecer opcao `Outros`;
  - permitir especificacao manual de cor especial.

#### Ponto em aberto

- Confirmar se a lista de cores varia conforme o produto.

### Playcushion

- Tipo de interface: `Checkbox`
- Observacao: corrigir grafia de `Opcional` no formulario final.

### Tipo de Madeira
- Tipo de interface: `Dropdown`
- Valores previstos:
  - `Grapia`
  - `Cumaru`
  - `Tauari`

### Tela de Sombreamento
- Tipo de interface: `Checkbox`
- Descricao: estrutura textil de alta resistencia utilizada para controle de incidencia solar no teto da quadra.

#### Ponto em aberto
- Confirmar se a tela de sombreamento so pode existir quando houver alambrado.

### Tela Superior

- Tipo de interface: `Checkbox`
- Descricao: rede plastica instalada no teto da quadra.

#### Ponto em aberto

- Confirmar se a tela superior so pode existir quando houver alambrado.

## Produtos

### Quadra de Tenis

#### Variantes

- `Base asfaltica`
- `Saibro`
- `Grama`

#### Parametros comuns

- `Dimensoes`
- `Dificuldade de acesso`
- `Material de pedreira`
- `Tipo de terreno`
- `Iluminacao`
- `Alambrado`
- `Cor`
- `Playcushion`
- `Acessorios`
  - Definir lista final; anotacao atual sugere ao menos `rede`

#### Parametros especificos

- `Saibro`
  - `Kit saibro`: `Checkbox`
- `Base asfaltica`
  - Sem parametros especificos definidos ate o momento
- `Grama`
  - Sem parametros especificos definidos ate o momento

### Quadra Poliesportiva

#### Variantes

- `Base asfaltica`
- `Assoalho`
- `Epoxi`
- `PU 200 B`

#### Parametros comuns

- `Dimensoes`
- `Dificuldade de acesso`
- `Material de pedreira`
- `Tipo de terreno`
- `Acessorios`
  - `Basquete`
  - `Volei`
  - `Futsal/Futebol`
- `Iluminacao`
- `Alambrado`


#### Parametros especificos

- `Assoalho`
  - `Tipo de madeira`: `Grapia`, `Cumaru`, `Tauari`
  - `Anti-chama`
- `Epoxi`
  - `Cor`
  - `Condicao do piso`
  - `Condicoes da base`: `Boa`, `Ruim`
  - `Multilayer`
- `P.U. 200 B`
  - `Tipo de Poliuretano`: B7, B9
  - `Cor`
  - `Anti-chama` 

### Softplay Playground
#### Parametros

- `Dimensoes`
- `Espessura de SBR`
- `Espessura de EPDM`
  - Sugestao atual: preencher `1 cm` como valor padrao

### Garagem Epoxi
#### Parametros
- `Dimensoes do piso liso`
- `Dimensoes do piso derrapante`
- `Multilayer`
  - Tipo de interface: `Checkbox`
- `Condicoes da base`
- `Tipo de vaga`
  - `Carro`
  - `Moto`
  - `Bicicleta`
  - `PNE`
- `Dimensao das vagas`
- `Quantidade de vagas`
- `Metro Linear Faixa`
  - Descrição `Determina a Altura da Faixa`
  - Tipo de interface: `Campo numérico`

#### Observacoes de detalhamento
- Separar vagas comuns e vagas PNE.
- Permitir informar quantidade e dimensoes por tipo de vaga.
- Considerar campos especificos para moto e bicicleta.

### Beach Tenis
#### Parametros

- `Dimensoes`
- `Dificuldade de acesso`
- `Material de pedreira`
- `Tipo de terreno`
- `Espessura da areia`
  - Sugestao atual de placeholder: `30 cm`
- `Iluminacao`
- `Alambrado`
  - Estrutura atual anotada: `Simples`

### Campo
#### Variantes
- `Sintetico`
- `Natural`

#### Parametros comuns
- `Dimensoes`
- `Material de pedreira`
- `Tipo de terreno`

#### Campo Natural
- `Tipo de grama`
  - `Esmeralda`
  - `Bermuda`
  - `Bermuda Celebration`
  - `Outros`
- `Acessorios`
  - `Trave 3x2`
  - `Trave 4x2`
  - `Trave 5x2`
  - `Trave oficial 7,24 x 2,42`
- `Alambrado`
  - Definir opcao `Trelica`
- `Iluminacao`
- `Tela de sombreamento`
- `Tela superior`

#### Campo Sintetico
- `Tipo de grama sintetica`
  - `Soccer Pro`
  - `TTurf`
  - `Hero Shape`
  - `Outros`
- `Altura da grama`
  - Valores anotados: `50 mm`, `60 mm`
- `Base drenante`
  - `Com drenagem`
  - `Sem drenagem`
- `Acessorios`
  - `Trave 3x2`
  - `Trave 4x2`
  - `Trave 5x2`
  - `Trave oficial 7,24 x 2,42`
- `Alambrado`
  - Mesmo comportamento do tenis, com opcao de `Trelica`
- `Iluminacao`
- `Tela de sombreamento`
- `Tela superior`
- `Shockpad`
  - Tipo de interface: `Checkbox`

### Pickleball
#### Parametros
- `Dimensoes`
- `Dificuldade de acesso`
- `Material de pedreira`
- `Tipo de terreno`
- `Iluminacao`
- `Alambrado`
- `Cor`
- `Acessorios`
  - Definir lista final

### Padel
#### Variantes
- `Grama sintetica`
- `Base asfaltica com pintura`

#### Parametros comuns

- `Dimensoes`
- `Material de pedreira`
- `Dificuldade de acesso`
- `Tipo de Terreno`
- `Alambrado`
  - Tipo de interface: `Dropdown`
  - Valores previstos: `Estrutura de vidro`, `Estrutura especial`
  - Descricao: a estrutura combina vidro e tela metalica

#### Parametros especificos da grama sintetica

- `Tipo de grama`
  - `Super TXT`
  - `TXT`
  - `Mondo`
- `Construcao da base`
  - Tipo de interface: `Dropdown`
  - Valores previstos: `Playpiso`, `Cliente`
  - Descricao: define quem sera responsavel pela construcao da base

### Assoalho

#### Parametros

- `Dimensoes`
- `Dificuldade de acesso`
- `Material de pedreira`
- `Tipo de terreno`
- `Iluminacao`
- `Alambrado`
- `Cor`
- `Tipo de madeira`
  - `Grapia`
  - `Cumaru`
  - `Tauari`
- `Acessorios`
  - `Basquete`
    - `Adulto` ou `Juvenil`
    - Estrutura `Metalica` ou `Hidraulica`
  - `Volei`
    - `Rede`
  - `Futebol`
    - `Trave`
- `Anti-chama`

### Squash

#### Parametros

- `Dimensoes`
- `Dificuldade de acesso`
- `Material de pedreira`
- `Tipo de madeira`
- `Tipo de terreno`
- `Iluminacao`
  - Se aplicavel, informar quantidade de luminarias e potencia
- `Cor`
- `Anti-chama`

### Pista de Caminhada

#### Parametros

- `Dimensoes`

### PU 200 B

#### Parametros

- `Aplicacao`
  - Campo aberto para indicar se e `quadra poliesportiva` ou `pista/caminhada`
- `Dimensoes`
- `Opcao`
  - Valores anotados: `B9` ou `B7`
- `Iluminacao`
- `Alambrado`

### Pista de Atletismo

#### Parametros

- `Sistema`
  - `Mondo`
  - `PU 500`
  - `PU 300`
  - `PU 250`
- `Dimensoes`
- `Número de Raias`
- `Metro Linear`

## Pendencias para Validacao

- Definir a lista de acessorios de `Quadra de Tenis`.
- Definir a lista de acessorios de `Pickleball`.
- Confirmar se `Tela de Sombreamento` depende obrigatoriamente de `Alambrado`.
- Confirmar se `Tela Superior` depende obrigatoriamente de `Alambrado`.
- Consolidar os valores validos de `Tipo de Terreno`.
- Confirmar como a `Dificuldade de Acesso` impacta o orcamento.
- Definir se `Iluminacao` deve ser parametrizada por produto.
- Confirmar a lista oficial de cores por produto.
- Confirmar os parametros especificos ainda nao detalhados de:
  - `Quadra de Tenis Base Asfaltica`
  - `Quadra de Tenis Grama`
  - `Padel Base Asfaltica`
