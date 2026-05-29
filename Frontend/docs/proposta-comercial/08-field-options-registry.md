# Field Options Registry — Quadra de Tenis

## 1. Objetivo

Este documento define a fonte de verdade codavel para opcoes de campos `enum` e `enum/custom` do formulario comercial de **Quadra de Tenis**.

Cada opcao deve ter:

```ts
type FieldOption = {
  value: string;
  label: string;
  aliases?: string[];
  isDefault?: boolean;
};
```

O valor salvo no estado do formulario e no payload deve ser sempre `value`.

O texto exibido na UI deve ser sempre `label`.

---

## 2. Variantes

```ts
const variante_quadra_tenis_options: FieldOption[] = [
  {
    value: "piso_asfaltico",
    label: "Piso Asfaltico",
    aliases: [
      "Quadra de Tenis P.A.",
      "Quadra de Tenis PA",
      "Quadra Tenis P.A.",
      "Quadra Tenis PA",
      "Tenis P.A.",
      "Tenis PA"
    ],
    isDefault: true
  },
  {
    value: "saibro",
    label: "Saibro"
  },
  {
    value: "grama",
    label: "Grama"
  }
];
```

Regra de negocio:

```txt
Grama significa apenas Grama Natural para Quadra de Tenis.
```

---

## 3. Dados da obra

```ts
const tipo_projeto_options: FieldOption[] = [
  {
    value: "obra_nova",
    label: "Obra Nova"
  },
  {
    value: "reforma",
    label: "Reforma"
  }
];
```

Status:

```txt
O valor reforma ainda nao possui campos complementares definidos.
```

---

## 4. Condicoes da obra

```ts
const tipo_terreno_options: FieldOption[] = [
  {
    value: "solo_preparado",
    label: "Solo Preparado"
  },
  {
    value: "laje_concreto",
    label: "Laje/Concreto"
  }
];
```

```ts
const dificuldade_acesso_options: FieldOption[] = [
  {
    value: "facil",
    label: "Facil"
  },
  {
    value: "medio",
    label: "Medio"
  },
  {
    value: "dificil",
    label: "Dificil"
  }
];
```

```ts
const responsavel_material_pedreira_options: FieldOption[] = [
  {
    value: "playpiso",
    label: "Playpiso"
  },
  {
    value: "cliente",
    label: "Cliente"
  }
];
```

---

## 5. Piso Asfaltico

```ts
const cor_piso_asfaltico_options: FieldOption[] = [
  {
    value: "padrao",
    label: "Padrao"
  },
  {
    value: "nao_padrao",
    label: "Nao Padrao"
  },
  {
    value: "azul",
    label: "Azul"
  }
];
```

Regra condicional:

```txt
cor_piso_asfaltico = nao_padrao -> exibir e obrigar especificar_cor
```

---

## 6. Grama

```ts
const tipo_grama_options: FieldOption[] = [
  {
    value: "esmeralda",
    label: "Esmeralda"
  },
  {
    value: "bermuda",
    label: "Bermuda"
  },
  {
    value: "bermuda_celebration",
    label: "Bermuda Celebration"
  },
  {
    value: "outros",
    label: "Outros"
  }
];
```

Regra condicional:

```txt
tipo_grama = outros -> exibir e obrigar especificar_tipo_grama
```

---

## 7. Iluminacao

```ts
const potencia_projetores_options: FieldOption[] = [
  {
    value: "outro",
    label: "Outro"
  }
];
```

Status:

```txt
As potencias padrao de projetores ainda devem ser definidas pelo negocio.
Enquanto isso, o campo deve permitir a opcao Outro e abrir especificar_potencia_projetores.
```

---

## 8. Fechamentos e Protecoes

```ts
const galvanizacao_options: FieldOption[] = [
  {
    value: "outro",
    label: "Outro"
  }
];
```

Status:

```txt
As opcoes padrao de galvanizacao ainda devem ser definidas pelo negocio.
Enquanto isso, o campo deve permitir a opcao Outro e abrir especificar_galvanizacao.
```

```ts
const travamento_options: FieldOption[] = [];
```

Status:

```txt
O planejamento informa que Travamento e um select com tres posicoes, mas nao define os valores.
Este campo permanece pendente ate o negocio informar labels e values.
```

---

## 9. Mapeamento field_id -> options

```ts
const fieldOptionsRegistry = {
  variante_quadra_tenis: variante_quadra_tenis_options,
  tipo_projeto: tipo_projeto_options,
  tipo_terreno: tipo_terreno_options,
  dificuldade_acesso: dificuldade_acesso_options,
  responsavel_material_pedreira: responsavel_material_pedreira_options,
  cor_piso_asfaltico: cor_piso_asfaltico_options,
  tipo_grama: tipo_grama_options,
  potencia_projetores: potencia_projetores_options,
  galvanizacao: galvanizacao_options,
  travamento: travamento_options
};
```

---

## 10. Pendencias para fonte de verdade completa

Antes de implementacao final, o negocio deve confirmar:

```txt
- Opcoes padrao de potencia_projetores.
- Opcoes padrao de galvanizacao.
- As tres opcoes tecnicas de travamento.
- Se tipo_projeto = reforma tera campos complementares nesta primeira versao.
```
