# Planejamento — Quadra de Tênis

> Este documento registra o contexto de ideação e decisões de negócio. A fonte de verdade codável está nos contratos `01` a `08`, especialmente `01-field-registry.md`, `04-conditional-rules.md` e `08-field-options-registry.md`.
>
> Normalizações aplicadas nos contratos codáveis:
> - `SelectWithOtherField` foi normalizado como `SelectWithCustomOption`.
> - `tipo_de_projeto` foi normalizado como `tipo_projeto`.
> - A área chamada "Alambrado" no planejamento foi mantida como bloco interno da seção codável `fechamentos_protecoes`.

# Etapa - 1 Delimitar o escopo do produto (Quadra de Tênis)
Produto: Quadra de Tênis
Variantes:
- Piso Asfáltico
- Saibro
- Grama (apenas Grama Natural)

# Etapa 2 — Inventário de campos candidatos para Quadra de Tênis

O produto Quadra de Tênis possui três variantes:
- Piso Asfáltico
- Saibro
- Grama

Campos comuns a todas as variantes:
1. Dimensões — seção
2. Acessórios — campo checkbox
   - Para Quadra de Tênis, acessórios significa indicar se haverá rede de tênis.
3. Alambrado — seção
4. Iluminação — seção
5. Tipo de terreno — campo select
   - Opções: Solo Preparado; Laje/Concreto
6. Dificuldade de acesso — campo select
   - Opções: Fácil; Médio; Difícil
7. Responsável pelo material de pedreira — campo select
   - Opções: Playpiso; Cliente

Campos específicos da variante Piso Asfáltico:
1. Cor — campo select
   - Opções: Padrão; Não Padrão; Azul
   - Este campo só aparece para Quadra de Tênis Piso Asfáltico.
2. PlayCushion — campo checkbox
   - Este campo só aparece para Quadra de Tênis Piso Asfáltico.

Campos específicos da variante Saibro:
1. Kit Saibro — campo checkbox
   - Valores: Sim; Não

Campos específicos da variante Grama:
1. Tipo de grama — campo select
   - Opções: Esmeralda; Bermuda; Bermuda Celebration; Outros


# Etapa 3 — Classificação dos campos da Quadra de Tênis

## Seções:
1. Dimensões
   - Seção sempre visível.
   - Deve agrupar os campos dimensionais da quadra.
 
2. Alambrado (Possui alambrado? = Sim → Exibir seção Alambrado.)
   - Seção condicional: Terá uma checkbox inicial do tipo “Possui alambrado?" que se for preenchido, renderiza os campos da seção.
   - Deve ser exibida apenas quando o usuário indicar que haverá alambrado.

3. Iluminação (Possui iluminação? = Sim → Exibir seção Iluminação.)
   - Seção condicional: Terá uma checkbox inicial do tipo “Possui iluminação?" que se for preenchido, renderiza os campos da seção.
   - Deve ser exibida apenas quando o usuário indicar que haverá iluminação.

### Campos atômicos comuns:
1. Acessórios
   - Booleano.
   - Checkbox.
   - Indica se haverá rede de tênis.

2. Tipo de terreno
   - Select.
   - Opções: Solo Preparado; Laje/Concreto.

3. Dificuldade de acesso
   - Select.
   - Opções: Fácil; Médio; Difícil.

4. Responsável pelo material de pedreira
   - Select.
   - Opções: Playpiso; Cliente.

### Campos específicos da variante Piso Asfáltico:
1. Cor (Cor = Não Padrão → Exibir campo complementar para o usuário especificar a cor.)
   - Select.
   - Opções: Padrão; Não Padrão; Azul.
   - Exibido apenas para a variante Piso Asfáltico.
   - Se o valor for Não Padrão, deve abrir um campo complementar para especificação manual. 

2. PlayCushion
   - Booleano.
   - Checkbox.
   - Exibido apenas para a variante Piso Asfáltico.

### Campos específicos da variante Saibro:
1. Kit Saibro
   - Booleano.
   - Checkbox.
   - Exibido apenas para a variante Saibro.

### Campos específicos da variante Grama:
1. Tipo de grama
   - Select.
   - Opções: Esmeralda; Bermuda; Bermuda Celebration; Outros.
   - Exibido apenas para a variante Grama.
   - Se o valor for Outros, deve abrir um campo complementar para especificação manual.

Componentes reutilizáveis necessários:
1. CheckboxField
2. SelectField
3. SelectWithCustomOption
4. ConditionalSection
5. DimensionsSection

Regras condicionais principais:
1. Variante Piso Asfáltico exibe Cor e PlayCushion.
2. Variante Saibro exibe Kit Saibro.
3. Variante Grama exibe Tipo de grama.
4. Tipo de grama = Outros exibe campo de especificação manual.
5. Possui iluminação = Sim exibe seção Iluminação.
6. Possui alambrado = Sim exibe seção Alambrado.

# Etapa 4 - Desenho das seções da UI para Quadra de Tênis

Criar a interface do formulário para o produto Quadra de Tênis.

O produto Quadra de Tênis possui três variantes:
- Piso Asfáltico
- Saibro
- Grama

A nomenclatura Quadra de Tênis P.A. deve ser interpretada como sinônimo de Quadra de Tênis Piso Asfáltico.

A interface deve ser organizada nas seguintes seções, nesta ordem:
1. Dados do cliente
2. Dados da obra
3. Produto e variante
4. Dimensões
5. Condições da obra
6. Especificações da variante
7. Iluminação
8. Alambrado
9. Acessórios
10. Observações

A seção Dimensões aparece para todas as variantes.

A seção Condições da obra aparece para todas as variantes e contém:
- Tipo de terreno: Solo Preparado; Laje/Concreto
- Dificuldade de acesso: Fácil; Médio; Difícil
- Responsável pelo material de pedreira: Playpiso; Cliente

A seção Especificações da variante muda conforme a variante escolhida.

Se a variante for Piso Asfáltico:
- Exibir campo Cor com opções: Padrão; Não Padrão; Azul
- Exibir checkbox PlayCushion
- Se Cor = Não Padrão, exibir campo de texto "Especificar cor"

Se a variante for Saibro:
- Exibir checkbox Kit Saibro

Se a variante for Grama:
- Exibir campo Tipo de grama com opções: Esmeralda; Bermuda; Bermuda Celebration; Outros
- Se Tipo de grama = Outros, exibir campo de texto "Especificar tipo de grama"

A seção Iluminação deve ter uma checkbox inicial "Possui iluminação?"
- Se marcada, exibir os campos internos de iluminação.
- Se desmarcada, ocultar os campos internos de iluminação.

A seção Alambrado deve ter uma checkbox inicial "Possui alambrado?"
- Se marcada, exibir os campos internos de alambrado.
- Se desmarcada, ocultar os campos internos de alambrado.

A seção Iluminação deve aparecer antes da seção Alambrado.

Acessórios, para Quadra de Tênis, deve ser apenas um campo checkbox:
- Label recomendado: "Incluir rede de tênis?"
- Não criar uma seção complexa de acessórios para Quadra de Tênis.

A seção Observações deve aparecer no final do formulário como campo de texto livre.

# Etapa 5 — Regras condicionais da Quadra de Tênis

1. O produto Quadra de Tênis possui três variantes:
   - Piso Asfáltico
   - Saibro
   - Grama

2. Quadra de Tênis P.A. deve ser tratada como sinônimo de Quadra de Tênis Piso Asfáltico.

3. Se variante = Piso Asfáltico:
   - Exibir Cor
   - Exibir PlayCushion
   - Ocultar Kit Saibro
   - Ocultar Tipo de grama
   - Ocultar Especificar tipo de grama

4. Se variante = Saibro:
   - Exibir Kit Saibro
   - Ocultar Cor
   - Ocultar Especificar cor
   - Ocultar PlayCushion
   - Ocultar Tipo de grama
   - Ocultar Especificar tipo de grama

5. Se variante = Grama:
   - Exibir Tipo de grama
   - Ocultar Cor
   - Ocultar Especificar cor
   - Ocultar PlayCushion
   - Ocultar Kit Saibro

6. Se Cor = Não Padrão:
   - Exibir Especificar cor
   - Tornar Especificar cor obrigatório

7. Se Cor != Não Padrão:
   - Ocultar Especificar cor
   - Limpar ou ignorar Especificar cor

8. Se Tipo de grama = Outros:
   - Exibir Especificar tipo de grama
   - Tornar Especificar tipo de grama obrigatório

9. Se Tipo de grama != Outros:
   - Ocultar Especificar tipo de grama
   - Limpar ou ignorar Especificar tipo de grama

10. Se possui iluminação = Sim:
    - Exibir campos internos da seção Iluminação

11. Se possui iluminação = Não:
    - Ocultar campos internos da seção Iluminação
    - Limpar ou ignorar valores internos de Iluminação

12. Se possui alambrado = Sim:
    - Exibir campos internos da seção Alambrado

13. Se possui alambrado = Não:
    - Ocultar campos internos da seção Alambrado
    - Limpar ou ignorar valores internos de Alambrado

14. A seção Iluminação deve aparecer antes da seção Alambrado.

15. Acessórios, em Quadra de Tênis, deve ser apenas um checkbox para indicar inclusão de rede de tênis.

16. Não criar uma seção complexa de acessórios para Quadra de Tênis.

17. Se tipo_projeto = Reforma:
    - Exibir campos específicos de reforma

18. Se tipo_projeto = Obra Nova:
    - Ocultar campos específicos de reforma

19. Campos ocultos por regra condicional não devem ser obrigatórios.

20. Campos ocultos por regra condicional não devem contaminar o payload final.
