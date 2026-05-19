# Field Registry — Quadra de Tenis

## 1. Objetivo

Este documento define os campos atomicos usados pelo formulario comercial de **Quadra de Tenis**.

Campos `enum` e `enum/custom` devem buscar suas opcoes em `08-field-options-registry.md`.

O `fieldRegistry` define campos, tipos, componentes, obrigatoriedade base, defaults e observacoes funcionais. Ele nao deve definir ordem de seções nem regras condicionais completas.

---

## Campos da Seção Dados do Cliente

| Chave técnica | Label na UI | Tipo | Componente | Obrigatório | Valor padrão | Observação |
| ------------- | ----------- | ---- | ---------- | ----------- | ------------ | ---------- |
| `nome_razao_social` | Nome/Razão social | string | TextInput | Sim | - |  |
| `cpf_cnpj` | CPF/CNPJ | string | TextInput | - | - |
| `nome_contato` | Nome do contato| string | TextInput | - | - |
| `telefone` | Telefone | string | TextInput | - | - |
| `email` | E-mail | string | TextInput | - | - |

## Campos da Seção Dados da Obra
| Chave técnica | Label na UI | Tipo | Componente | Obrigatório | Valor padrão | Observação |
| ------------- | ----------- | ---- | ---------- | ----------- | ------------ | ---------- |
| `endereco_obra` | Endereço da obra | string | TextInput | Sim | - | - |
| `cidade` | Cidade | string | TextInput | Sim | - | - |
| `estado` | Estado | string | TextInput | Sim | - | - |
| `tipo_projeto` | Tipo de projeto | enum | SelectField | Sim | - | Opções em `tipo_projeto_options`. |


## 1. Campos de variante do produto

| Chave técnica | Label na UI | Tipo | Componente | Obrigatório | Valor padrão | Observação |
| ------------- | ----------- | ---- | ---------- | ----------- | ------------ | ---------- |
| `variante_quadra_tenis` | Variante da Quadra de Tênis | enum | SelectField | Sim | `piso_asfaltico` | Opções em `variante_quadra_tenis_options`. Controla os campos específicos da variante. |


## 2. Campos da seção Dimensões

| Chave técnica | Label na UI | Tipo | Componente | Obrigatório | Valor padrão | Observação |
| ------------- | ----------- | ---- | ---------- | ----------- | ------------ | ---------- |
| `largura`     | Largura     | number | NumberInput | Sim         | `18`         | Unidade em metros. Campo editável.                               |
| `comprimento` | Comprimento | number | NumberInput | Sim         | `36`         | Unidade em metros. Campo editável.                               |
| `area_total`  | Área total  | number | NumberInput | Sim         | Calculado    | Calculado por `largura × comprimento`, mas editável manualmente. |

## 3. Campos de condições da obra

| Chave técnica | Label na UI | Tipo | Componente | Obrigatório | Valor padrão | Observação |
| ------------- | ----------- | ---- | ---------- | ----------- | ------------ | ---------- |
| `tipo_terreno`| Tipo de terreno    | enum | SelectField     | Sim         | vazio        | Opções em `tipo_terreno_options`. |
| `dificuldade_acesso`            | Dificuldade de acesso                 | enum | SelectField     | Sim         | vazio        | Opções em `dificuldade_acesso_options`. |
| `responsavel_material_pedreira` | Responsável pelo material de pedreira | enum | SelectField     | Sim         | vazio        | Opções em `responsavel_material_pedreira_options`. Manter esse nome na UI. |

## 4. Campos específicos da variante Piso Asfáltico

| Chave técnica        | Label na UI          | Tipo    | Componente | Obrigatório        | Visibilidade                                | Observação                                  |
| -------------------- | -------------------- | ------- | ---------- | ------------------ | ------------------------------------------- | ------------------------------------------- |
| `cor_piso_asfaltico` | Cor                  | enum    | SelectField     | Sim quando visível | Apenas se variante = Piso Asfáltico         | Opções em `cor_piso_asfaltico_options`. |
| `especificar_cor`    | Especificar cor      | string  | TextInput  | Sim quando visível | Apenas se `cor_piso_asfaltico = nao_padrao` | Campo complementar obrigatório.             |
| `possui_playcushion` | Incluir PlayCushion? | boolean | Checkbox   | Não                | Apenas se variante = Piso Asfáltico         | PlayCushion só se aplica ao Piso Asfáltico. |

## 5. Campos específicos da variante Saibro

| Chave técnica       | Label na UI         | Tipo    | Componente | Obrigatório | Visibilidade                | Observação                          |
| ------------------- | ------------------- | ------- | ---------- | ----------- | --------------------------- | ----------------------------------- |
| `possui_kit_saibro` | Incluir Kit Saibro? | boolean | Checkbox   | Não         | Apenas se variante = Saibro | Campo exclusivo da variante Saibro. |

## 6. Campos específicos da variante Grama

| Chave técnica            | Label na UI               | Tipo   | Componente | Obrigatório        | Visibilidade                    | Observação                         |
| ------------------------ | ------------------------- | ------ | ---------- | ------------------ | ------------------------------- | ---------------------------------- |
| `tipo_grama`             | Tipo de grama             | enum   | SelectField     | Sim quando visível | Apenas se variante = Grama      | Opções em `tipo_grama_options`. |
| `especificar_tipo_grama` | Especificar tipo de grama | string | TextInput  | Sim quando visível | Apenas se `tipo_grama = outros` | Campo complementar obrigatório.    |


## 7. Campo de acessórios da Quadra de Tênis
| Chave técnica        | Label na UI            | Tipo    | Componente | Obrigatório | Valor padrão | Observação                                                   |
| -------------------- | ---------------------- | ------- | ---------- | ----------- | ------------ | ------------------------------------------------------------ |
| `incluir_rede_tenis` | Incluir rede de tênis? | boolean | Checkbox   | Não         | `false`      | Não criar seção complexa de acessórios para Quadra de Tênis. |

## 8. Campos da seção Iluminação
| Chave técnica                     | Label na UI                                                                 | Tipo          | Componente             | Obrigatório        | Visibilidade                                  | Observação                                   |
| --------------------------------- | --------------------------------------------------------------------------- | ------------- | ---------------------- | ------------------ | --------------------------------------------- | -------------------------------------------- |
| `possui_iluminacao`               | Possui iluminação?                                                          | boolean       | Checkbox               | Não                | Sempre visível                                | Controla os campos internos de iluminação.   |
| `iluminacao_fixada_alambrado`     | Iluminação será fixada em alambrado da Playpiso, existente ou de terceiros? | boolean       | Checkbox               | Não                | Se `possui_iluminacao = true`                 | Oculta campos de postes próprios.            |
| `quantidade_postes_iluminacao`    | Quantidade de postes                                                        | number        | NumberInput            | Sim quando visível | Se iluminação ativa e não fixada no alambrado | Campo de postes próprios.                    |
| `altura_postes_iluminacao`        | Altura dos postes                                                           | number        | NumberInput            | Sim quando visível | Se iluminação ativa e não fixada no alambrado | Unidade em metros.                           |
| `quantidade_projetores`           | Quantidade de projetores/refletores                                         | number        | NumberInput            | Sim quando visível | Se `possui_iluminacao = true`                 | Preenchimento manual.                        |
| `potencia_projetores`             | Potência dos projetores                                                     | enum/custom   | SelectWithCustomOption | Sim quando visível | Se `possui_iluminacao = true`                 | Permite opções comuns e valor personalizado. |
| `especificar_potencia_projetores` | Especificar potência dos projetores                                         | string        | TextInput              | Sim quando visível | Se `potencia_projetores = outro`              | Campo complementar.                          |
| `quantidade_cruzetas`             | Quantidade de cruzetas                                                      | number        | NumberInput            | Sim quando visível | Se `possui_iluminacao = true`                 | Preenchimento manual.                        |
| `responsavel_ligacao_eletrica`    | Responsável pela ligação elétrica                                           | enum/readOnly | ReadOnlyField          | Não editável       | Se `possui_iluminacao = true`                 | Sempre cliente.                              |

## 9. Campos da seção Fechamentos e Proteções

| Chave técnica              | Label na UI                    | Tipo    | Componente                   | Obrigatório        | Visibilidade                 | Observação                                       |
| -------------------------- | ------------------------------ | ------- | ---------------------------- | ------------------ | ---------------------------- | ------------------------------------------------ |
| `possui_alambrado`         | Possui alambrado?              | boolean | Checkbox                     | Não                | Sempre visível               | Controla apenas os campos técnicos de alambrado. |
| `comprimento_alambrado`    | Comprimento do alambrado       | number  | NumberInput                  | Sim quando visível | Se `possui_alambrado = true` | Unidade em metros. Não vem pré-preenchido.       |
| `altura_alambrado`         | Altura do alambrado            | number  | NumberInput                  | Sim quando visível | Se `possui_alambrado = true` | Unidade em metros. Campo livre.                  |
| `espacamento_postes_tubos` | Espaçamento entre postes/tubos | number  | NumberInput                  | Sim quando visível | Se `possui_alambrado = true` | Unidade em metros.                               |
| `galvanizacao`             | Galvanização                   | enum    | SelectField                       | Sim quando visível | Se `possui_alambrado = true` | Opções em `galvanizacao_options`. Possui opção Outro. |
| `especificar_galvanizacao` | Especificar galvanização       | string  | TextInput                    | Sim quando visível | Se `galvanizacao = outro`    | Campo complementar obrigatório.                  |
| `possui_trelica`           | Possui treliça?                | boolean | Checkbox                     | Não                | Se `possui_alambrado = true` | Campo opcional.                                  |
| `travamento`               | Travamento                     | enum    | SelectField                       | Sim quando visível | Se `possui_alambrado = true` | Opções em `travamento_options`. Pendente de definição pelo negócio. |
| `possui_tela_superior`     | Possui tela superior?          | boolean | Checkbox                     | Não                | Sempre visível na seção      | Independente de possuir alambrado.               |
| `possui_tela_sombreamento` | Possui tela de sombreamento?   | boolean | Checkbox                     | Não                | Sempre visível na seção      | Independente de possuir alambrado.               |


## 10. Campo de observações

| Chave técnica | Label na UI | Tipo   | Componente | Obrigatório | Valor padrão | Observação                          |
| ------------- | ----------- | ------ | ---------- | ----------- | ------------ | ----------------------------------- |
| `observacoes` | Observações | text_long | TextAreaField   | Não         | vazio        | Campo livre ao final do formulário. |

---

## Campos enum e fontes de opcoes

Todo campo `enum` deve apontar para uma lista em `08-field-options-registry.md`.

```txt
variante_quadra_tenis          -> variante_quadra_tenis_options
tipo_projeto                   -> tipo_projeto_options
tipo_terreno                   -> tipo_terreno_options
dificuldade_acesso             -> dificuldade_acesso_options
responsavel_material_pedreira  -> responsavel_material_pedreira_options
cor_piso_asfaltico             -> cor_piso_asfaltico_options
tipo_grama                     -> tipo_grama_options
potencia_projetores            -> potencia_projetores_options
galvanizacao                   -> galvanizacao_options
travamento                     -> travamento_options
```

Pendencias conhecidas:

```txt
- potencia_projetores precisa de opcoes padrao alem de Outro.
- galvanizacao precisa de opcoes padrao alem de Outro.
- travamento precisa das tres opcoes tecnicas.
```
