# Especificação funcional — `sectionRegistry` da Quadra de Tênis

## Objetivo do `sectionRegistry`

O `sectionRegistry` deve definir:

```txt
- quais seções existem no formulário
- ordem em que aparecem na UI
- quais campos pertencem a cada seção
- quais seções são sempre visíveis
- quais seções são condicionais
- quais campos internos aparecem ou somem conforme regras de negócio
```

O `sectionRegistry` **não deve redefinir tipo, label, opções ou validações dos campos**. Isso pertence ao `fieldRegistry`.

Opções de campos `enum` devem vir de `08-field-options-registry.md`.

---

# Ordem visual recomendada

Para o formulário de **Quadra de Tênis**, a ordem das seções deve ser:

```txt
1. Dados do cliente
2. Dados da obra
3. Produto e variante
4. Dimensões
5. Condições da obra
6. Especificações da variante
7. Iluminação
8. Fechamentos e Proteções
9. Acessórios
10. Observações
```

Essa ordem é importante porque primeiro coleta dados gerais, depois define o produto, depois detalha as características técnicas e, por fim, captura opcionais e observações.

---

# 1. Seção: Dados do cliente

```txt
section_id: dados_cliente
title: Dados do cliente
visibility: always
scope: global
```

Essa seção é global e não pertence exclusivamente à Quadra de Tênis.

Campos esperados:

```txt
- nome_razao_social
- cpf_cnpj
- nome_contato
- telefone
- email
```

Status:

```txt
Esta seção deve ser reaproveitada por todos os produtos.
Os campos ainda podem ser definidos em um fieldRegistry global.
```

Observação funcional:

```txt
A seção deve aparecer no início do formulário.
Ela não depende da variante da Quadra de Tênis.
```

---

# 2. Seção: Dados da obra

```txt
section_id: dados_obra
title: Dados da obra
visibility: always
scope: global
```

Campos esperados:

```txt
- endereco_obra
- cidade
- estado
- tipo_projeto
```

O campo `tipo_projeto` deve permitir:

```txt
- obra_nova -> Obra Nova
- reforma   -> Reforma
```

Status:

```txt
A regra de Reforma existe, mas os campos internos de reforma estão pendentes.
```

Comportamento futuro:

```txt
Se tipo_projeto = Reforma:
  exibir campos específicos de reforma

Se tipo_projeto = Obra Nova:
  ocultar campos específicos de reforma
```

---

# 3. Seção: Produto e variante

```txt
section_id: produto_variante
title: Produto e variante
visibility: always
scope: quadra_tenis
```

Campos:

```txt
- variante_quadra_tenis
```

Opções da variante:

```txt
- piso_asfaltico -> Piso Asfáltico
- saibro          -> Saibro
- grama           -> Grama
```

Observação funcional:

```txt
Quadra de Tênis P.A. deve ser interpretada como Quadra de Tênis Piso Asfáltico.
```

Comportamento:

```txt
A variante selecionada controla a seção "Especificações da variante".
```

Recomendação de UI:

```txt
Usar SelectField na primeira versão, conforme productCatalog.
RadioGroup ou cards selecionáveis podem ser avaliados como evolução futura.
```

---

# 4. Seção: Dimensões

```txt
section_id: dimensoes
title: Dimensões
visibility: always
scope: quadra_tenis
```

Campos, nesta ordem:

```txt
1. largura
2. comprimento
3. area_total
```

Comportamento:

```txt
- Largura inicia com 18m.
- Comprimento inicia com 36m.
- Área total é calculada automaticamente por largura × comprimento.
- Área total pode ser editada manualmente.
```

Descrição funcional refinada:

```txt
A área total deve ser preenchida automaticamente a partir de largura × comprimento, mas deve permitir edição manual caso o Comercial precise ajustar o valor.
```

Não incluir nesta seção:

```txt
- área de escape
- área total da obra separada da área da quadra
```

Recomendação de UI:

```txt
Renderizar largura e comprimento lado a lado.
Renderizar área total logo abaixo ou ao lado, com indicação de que foi calculada automaticamente.
```

---

# 5. Seção: Condições da obra

```txt
section_id: condicoes_obra
title: Condições da obra
visibility: always
scope: quadra_tenis
```

Campos, nesta ordem:

```txt
1. tipo_terreno
2. dificuldade_acesso
3. responsavel_material_pedreira
```

Campos obrigatórios:

```txt
- tipo_terreno
- dificuldade_acesso
- responsavel_material_pedreira
```

Observação funcional:

```txt
Esses campos aparecem para todas as variantes da Quadra de Tênis.
```

Recomendação de UI:

```txt
Renderizar os três campos como selects.
Usar labels diretos e curtos.
```

---

# 6. Seção: Especificações da variante

```txt
section_id: especificacoes_variante
title: Especificações da variante
visibility: depends_on_variant
scope: quadra_tenis
```

Essa seção é dinâmica. Ela muda conforme a variante selecionada.

## 6.1 Se variante = Piso Asfáltico

Título sugerido na UI:

```txt
Especificações — Piso Asfáltico
```

Campos, nesta ordem:

```txt
1. cor_piso_asfaltico
2. especificar_cor
3. possui_playcushion
```

Regras internas:

```txt
- cor_piso_asfaltico aparece apenas para Piso Asfáltico.
- especificar_cor aparece apenas se cor_piso_asfaltico = nao_padrao.
- possui_playcushion aparece apenas para Piso Asfáltico.
```

Observação funcional:

```txt
PlayCushion só se aplica à Quadra de Tênis Piso Asfáltico.
```

---

## 6.2 Se variante = Saibro

Título sugerido na UI:

```txt
Especificações — Saibro
```

Campos:

```txt
1. possui_kit_saibro
```

Regra interna:

```txt
- possui_kit_saibro aparece apenas para Saibro.
```

---

## 6.3 Se variante = Grama

Título sugerido na UI:

```txt
Especificações — Grama
```

Campos, nesta ordem:

```txt
1. tipo_grama
2. especificar_tipo_grama
```

Regras internas:

```txt
- tipo_grama aparece apenas para Grama.
- especificar_tipo_grama aparece apenas se tipo_grama = outros.
```

---

# 7. Seção: Iluminação

```txt
section_id: iluminacao
title: Iluminação
visibility: always
scope: quadra_tenis
```

Campo controlador sempre visível:

```txt
1. possui_iluminacao
```

Campos exibidos apenas se `possui_iluminacao = true`:

```txt
2. iluminacao_fixada_alambrado
3. quantidade_postes_iluminacao
4. altura_postes_iluminacao
5. quantidade_projetores
6. potencia_projetores
7. especificar_potencia_projetores
8. quantidade_cruzetas
9. responsavel_ligacao_eletrica
```

Regras internas:

```txt
Se possui_iluminacao = false:
  ocultar todos os campos internos de iluminação.

Se possui_iluminacao = true:
  exibir campos internos de iluminação.

Se iluminacao_fixada_alambrado = true:
  ocultar quantidade_postes_iluminacao.
  ocultar altura_postes_iluminacao.

Se potencia_projetores = outro:
  exibir especificar_potencia_projetores.
```

Label definido:

```txt
Iluminação será fixada em alambrado da Playpiso, existente ou de terceiros?
```

Texto auxiliar:

```txt
Marque esta opção quando os projetores forem fixados em alambrado existente, de terceiros ou fornecido pela Playpiso. Nesse caso, os campos de postes próprios serão ocultados.
```

Regra importante:

```txt
Se iluminação fixada no alambrado = Sim:
- Não obrigar "Possui alambrado?" a ser Sim.
- Não marcar automaticamente "Possui alambrado?".
- Apenas ocultar os campos de postes próprios da iluminação.
```

Observação:

```txt
A seção Iluminação deve aparecer antes de Fechamentos e Proteções.
```

---

# 8. Seção: Fechamentos e Proteções

```txt
section_id: fechamentos_protecoes
title: Fechamentos e Proteções
visibility: always
scope: quadra_tenis
```

Decisão de nomenclatura:

```txt
O planejamento original chama esta área de "Alambrado".
O contrato codável usa fechamentos_protecoes porque a seção também agrupa tela superior e tela de sombreamento.
O bloco interno de alambrado continua existindo e é controlado por possui_alambrado.
```

Campos sempre visíveis dentro da seção:

```txt
1. possui_alambrado
2. possui_tela_superior
3. possui_tela_sombreamento
```

Campos exibidos apenas se `possui_alambrado = true`:

```txt
4. comprimento_alambrado
5. altura_alambrado
6. espacamento_postes_tubos
7. galvanizacao
8. especificar_galvanizacao
9. possui_trelica
10. travamento
```

Regras internas:

```txt
Se possui_alambrado = false:
  ocultar campos técnicos do alambrado.
  manter possui_tela_superior visível.
  manter possui_tela_sombreamento visível.

Se possui_alambrado = true:
  exibir campos técnicos do alambrado.

Se galvanizacao = outro:
  exibir especificar_galvanizacao.
```

Regra importante:

```txt
Tela superior e tela de sombreamento ficam dentro da seção "Fechamentos e Proteções", mas não dependem da checkbox "Possui alambrado?".
```

Recomendação de UI:

```txt
Renderizar "Possui alambrado?" no início da seção.

Se marcado, abrir um bloco interno chamado "Dados do alambrado".

Renderizar "Tela superior" e "Tela de sombreamento" fora do bloco interno do alambrado, mas ainda dentro da seção Fechamentos e Proteções.
```

Estrutura visual recomendada:

```txt
Fechamentos e Proteções

[ ] Possui alambrado?

Se marcado:
  Dados do alambrado
  - Comprimento do alambrado
  - Altura do alambrado
  - Espaçamento entre postes/tubos
  - Tipo de alambrado
  - Galvanização
  - Treliça
  - Travamento

Proteções adicionais
[ ] Possui tela superior?
[ ] Possui tela de sombreamento?
```

---

# 9. Seção: Acessórios

```txt
section_id: acessorios
title: Acessórios
visibility: always
scope: quadra_tenis
```

Campos:

```txt
1. incluir_rede_tenis
```

Label na UI:

```txt
Incluir rede de tênis?
```

Regra funcional:

```txt
Para Quadra de Tênis, "Acessórios" significa apenas inclusão ou não de rede de tênis.
```

Restrição:

```txt
Não criar seção complexa de acessórios para Quadra de Tênis.
Não abrir campos adicionais ao marcar "Incluir rede de tênis?".
```

---

# 10. Seção: Observações

```txt
section_id: observacoes
title: Observações
visibility: always
scope: global
```

Campos:

```txt
1. observacoes
```

Comportamento:

```txt
Campo livre ao final do formulário.
Não obrigatório.
```

Recomendação de UI:

```txt
Usar TextArea com altura confortável.
Permitir observações comerciais, técnicas ou operacionais não previstas nos campos estruturados.
```

---

# Versão consolidada do `sectionRegistry`

```txt
sectionRegistry — Quadra de Tênis

1. dados_cliente
   - Escopo: global
   - Visibilidade: sempre visível
   - Campos definidos no registry global de dados do cliente

2. dados_obra
   - Escopo: global
   - Visibilidade: sempre visível
   - Campos definidos no registry global de dados da obra

3. produto_variante
   - Escopo: quadra_tenis
   - Visibilidade: sempre visível
   - Componente recomendado: Select
   - Campos:
     - variante_quadra_tenis

4. dimensoes
   - Escopo: quadra_tenis
   - Visibilidade: sempre visível
   - Campos:
     - largura
     - comprimento
     - area_total

5. condicoes_obra
   - Escopo: quadra_tenis
   - Visibilidade: sempre visível
   - Campos:
     - tipo_terreno
     - dificuldade_acesso
     - responsavel_material_pedreira

6. especificacoes_variante
   - Escopo: quadra_tenis
   - Visibilidade: dinâmica conforme variante selecionada
   - Variante Piso Asfáltico:
     - cor_piso_asfaltico
     - especificar_cor
     - possui_playcushion
   - Variante Saibro:
     - possui_kit_saibro
   - Variante Grama:
     - tipo_grama
     - especificar_tipo_grama

7. iluminacao
   - Escopo: quadra_tenis
   - Visibilidade: sempre mostra o campo controlador
   - Campo controlador:
     - possui_iluminacao
   - Campos condicionais:
     - iluminacao_fixada_alambrado
     - quantidade_postes_iluminacao
     - altura_postes_iluminacao
     - quantidade_projetores
     - potencia_projetores
     - especificar_potencia_projetores
     - quantidade_cruzetas
     - responsavel_ligacao_eletrica

8. fechamentos_protecoes
   - Escopo: quadra_tenis
   - Visibilidade: sempre visível
   - Campos sempre visíveis:
     - possui_alambrado
     - possui_tela_superior
     - possui_tela_sombreamento
   - Campos condicionais de alambrado:
     - comprimento_alambrado
     - altura_alambrado
     - espacamento_postes_tubos
     - galvanizacao
     - especificar_galvanizacao
     - possui_trelica
     - travamento

9. acessorios
   - Escopo: quadra_tenis
   - Visibilidade: sempre visível
   - Campos:
     - incluir_rede_tenis

10. observacoes
   - Escopo: global
   - Visibilidade: sempre visível
   - Campos definidos no registry global de observações, ou campo:
     - observacoes
```

**Nota**: As seções dados_cliente, dados_obra e observacoes são globais e reutilizáveis.
Este documento apenas referencia essas seções, sem redefinir seus campos internos.

# Pendências do `sectionRegistry`

```txt
1. Definir os campos globais finais de Dados do cliente.
2. Definir os campos globais finais de Dados da obra.
3. Definir futuramente os campos de Reforma.
4. Confirmar as opções técnicas finais de travamento.
5. Confirmar as opções técnicas finais de galvanização.
```

A seção `especificacoes_variante` deve permanecer como seção dinâmica única, porque isso reduz duplicação e facilita a manutenção.
