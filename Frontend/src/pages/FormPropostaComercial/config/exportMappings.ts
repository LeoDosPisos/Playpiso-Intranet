import type { ExportMappings } from "../types/proposalForm";

const exportMappings: ExportMappings = {
  xlsx: {
    columns: [
      { fieldId: "nome_razao_social", columnName: "Cliente" },
      { fieldId: "cpf_cnpj", columnName: "CPF/CNPJ" },
      { fieldId: "nome_contato", columnName: "Contato" },
      { fieldId: "telefone", columnName: "Telefone" },
      { fieldId: "email", columnName: "E-mail" },
      { fieldId: "endereco_cliente", columnName: "Endereço da obra" },
      { fieldId: "cidade", columnName: "Cidade" },
      { fieldId: "estado", columnName: "Estado" },
      { fieldId: "tipo_projeto", columnName: "Tipo de projeto" },
      { fieldId: "variante_quadra_tenis", columnName: "Variante" },
      {
        fieldId: "variante_quadra_poliesportiva",
        columnName: "Variante da quadra poliesportiva",
      },
      {
        fieldId: "variante_beach_tenis",
        columnName: "Variante do Beach Tennis",
      },
      { fieldId: "variante_campo", columnName: "Variante do Campo" },
      { fieldId: "variante_pickleball", columnName: "Variante do Pickleball" },
      { fieldId: "variante_padel", columnName: "Variante do Padel" },
      { fieldId: "variante_squash", columnName: "Variante do Squash" },
      { fieldId: "variante_pista", columnName: "Variante da Pista" },
      {
        fieldId: "variante_garagem_epoxi",
        columnName: "Variante da Garagem Epóxi",
      },
      { fieldId: "variante_softplay", columnName: "Variante do Softplay" },
      { fieldId: "numero_raias", columnName: "Número de raias" },
      { fieldId: "opcao_pu_200_b_pista", columnName: "Opção PU 200 B" },
      { fieldId: "area_piso_liso", columnName: "Área do piso liso (m2)" },
      {
        fieldId: "area_piso_derrapante",
        columnName: "Área do piso derrapante (m2)",
      },
      {
        fieldId: "possui_multilayer_garagem_epoxi",
        columnName: "Multilayer",
      },
      {
        fieldId: "condicao_base_piso_garagem_epoxi",
        columnName: "Condição da base/piso da garagem",
      },
      { fieldId: "metro_linear_faixa", columnName: "Metro linear faixa" },
      { fieldId: "largura", columnName: "Largura (m)" },
      { fieldId: "comprimento", columnName: "Comprimento (m)" },
      { fieldId: "area_total", columnName: "Área total (m2)" },
      { fieldId: "tipo_terreno", columnName: "Tipo de terreno" },
      { fieldId: "dificuldade_acesso", columnName: "Dificuldade de acesso" },
      {
        fieldId: "responsavel_material_pedreira",
        columnName: "Responsável pelo material de pedreira",
      },
      { fieldId: "cor_piso_asfaltico", columnName: "Cor do piso asfáltico" },
      { fieldId: "especificar_cor", columnName: "Especificar cor" },
      { fieldId: "cor_pickleball", columnName: "Cor do Pickleball" },
      {
        fieldId: "especificar_cor_pickleball",
        columnName: "Especificar cor do Pickleball",
      },
      { fieldId: "possui_playcushion", columnName: "PlayCushion" },
      { fieldId: "possui_kit_saibro", columnName: "Kit Saibro" },
      { fieldId: "tipo_grama_natural", columnName: "Tipo de grama natural" },
      {
        fieldId: "especificar_tipo_grama_natural",
        columnName: "Especificar tipo de grama natural",
      },
      {
        fieldId: "tipo_grama_sintetica",
        columnName: "Tipo de grama sintética",
      },
      {
        fieldId: "especificar_tipo_grama_sintetica",
        columnName: "Especificar tipo de grama sintética",
      },
      {
        fieldId: "altura_grama_sintetica",
        columnName: "Altura da grama sintética",
      },
      { fieldId: "base_drenante", columnName: "Base drenante" },
      { fieldId: "possui_shockpad", columnName: "Shockpad" },
      { fieldId: "tipo_madeira", columnName: "Tipo de madeira" },
      { fieldId: "anti_chama", columnName: "Anti-chama" },
      { fieldId: "condicao_base_piso", columnName: "Condição da base/piso" },
      { fieldId: "tipo_poliuretano", columnName: "Tipo de poliuretano" },
      { fieldId: "tipo_areia", columnName: "Tipo de areia" },
      { fieldId: "espessura_areia", columnName: "Espessura da areia (cm)" },
      { fieldId: "possui_eva", columnName: "Proteção EVA" },
      { fieldId: "espessura_sbr", columnName: "Espessura de SBR (cm)" },
      { fieldId: "espessura_epdm", columnName: "Espessura de EPDM (cm)" },
      { fieldId: "tipo_epdm", columnName: "Tipo de EPDM (mm)" },
      { fieldId: "possui_iluminacao", columnName: "Iluminação" },
      {
        fieldId: "iluminacao_fixada_alambrado",
        columnName: "Iluminação fixada no alambrado",
      },
      {
        fieldId: "quantidade_postes_iluminacao",
        columnName: "Quantidade de postes de iluminação",
      },
      {
        fieldId: "altura_postes_iluminacao",
        columnName: "Altura dos postes de iluminação",
      },
      {
        fieldId: "quantidade_projetores",
        columnName: "Quantidade de projetores",
      },
      { fieldId: "potencia_projetores", columnName: "Potência dos projetores" },
      {
        fieldId: "especificar_potencia_projetores",
        columnName: "Especificar potência dos projetores",
      },
      { fieldId: "quantidade_cruzetas", columnName: "Quantidade de cruzetas" },
      {
        fieldId: "responsavel_ligacao_eletrica",
        columnName: "Responsável pela ligação elétrica",
      },
      { fieldId: "tipo_coligacao", columnName: "Tipo de coligação" },
      { fieldId: "possui_alambrado", columnName: "Alambrado" },
      { fieldId: "sistema_alambrado", columnName: "Sistema do alambrado" },
      {
        fieldId: "comprimento_alambrado_laterais",
        columnName: "Comprimento — Laterais",
      },
      { fieldId: "altura_alambrado_laterais", columnName: "Altura — Laterais" },
      {
        fieldId: "espacamento_postes_tubos_laterais",
        columnName: "Espaçamento — Laterais",
      },
      {
        fieldId: "comprimento_alambrado_fundos",
        columnName: "Comprimento — Fundos",
      },
      { fieldId: "altura_alambrado_fundos", columnName: "Altura — Fundos" },
      {
        fieldId: "espacamento_postes_tubos_fundos",
        columnName: "Espaçamento — Fundos",
      },
      {
        fieldId: "comprimento_alambrado_lateral_1",
        columnName: "Comprimento — Lateral 1",
      },
      {
        fieldId: "altura_alambrado_lateral_1",
        columnName: "Altura — Lateral 1",
      },
      {
        fieldId: "espacamento_postes_tubos_lateral_1",
        columnName: "Espaçamento — Lateral 1",
      },
      {
        fieldId: "comprimento_alambrado_lateral_2",
        columnName: "Comprimento — Lateral 2",
      },
      {
        fieldId: "altura_alambrado_lateral_2",
        columnName: "Altura — Lateral 2",
      },
      {
        fieldId: "espacamento_postes_tubos_lateral_2",
        columnName: "Espaçamento — Lateral 2",
      },
      {
        fieldId: "comprimento_alambrado_fundo_1",
        columnName: "Comprimento — Fundo 1",
      },
      {
        fieldId: "altura_alambrado_fundo_1",
        columnName: "Altura — Fundo 1",
      },
      {
        fieldId: "espacamento_postes_tubos_fundo_1",
        columnName: "Espaçamento — Fundo 1",
      },
      {
        fieldId: "comprimento_alambrado_fundo_2",
        columnName: "Comprimento — Fundo 2",
      },
      {
        fieldId: "altura_alambrado_fundo_2",
        columnName: "Altura — Fundo 2",
      },
      {
        fieldId: "espacamento_postes_tubos_fundo_2",
        columnName: "Espaçamento — Fundo 2",
      },
      { fieldId: "galvanizacao", columnName: "Galvanização" },
      {
        fieldId: "especificar_galvanizacao",
        columnName: "Especificar galvanização",
      },
      { fieldId: "travamento", columnName: "Travamento" },
      { fieldId: "possui_tela_superior", columnName: "Tela superior" },
      {
        fieldId: "possui_tela_sombreamento",
        columnName: "Tela de sombreamento",
      },
      {
        fieldId: "cor_tela_sombreamento",
        columnName: "Cor da tela de sombreamento",
      },
      {
        fieldId: "possui_sombreamento_lateral_1",
        columnName: "Sombreamento — Lateral 1",
      },
      {
        fieldId: "altura_sombreamento_lateral_1",
        columnName: "Altura sombreamento — Lateral 1",
      },
      {
        fieldId: "comprimento_sombreamento_lateral_1",
        columnName: "Comprimento sombreamento — Lateral 1",
      },
      {
        fieldId: "possui_sombreamento_lateral_2",
        columnName: "Sombreamento — Lateral 2",
      },
      {
        fieldId: "altura_sombreamento_lateral_2",
        columnName: "Altura sombreamento — Lateral 2",
      },
      {
        fieldId: "comprimento_sombreamento_lateral_2",
        columnName: "Comprimento sombreamento — Lateral 2",
      },
      {
        fieldId: "possui_sombreamento_fundo_1",
        columnName: "Sombreamento — Fundo 1",
      },
      {
        fieldId: "altura_sombreamento_fundo_1",
        columnName: "Altura sombreamento — Fundo 1",
      },
      {
        fieldId: "comprimento_sombreamento_fundo_1",
        columnName: "Comprimento sombreamento — Fundo 1",
      },
      {
        fieldId: "possui_sombreamento_fundo_2",
        columnName: "Sombreamento — Fundo 2",
      },
      {
        fieldId: "altura_sombreamento_fundo_2",
        columnName: "Altura sombreamento — Fundo 2",
      },
      {
        fieldId: "comprimento_sombreamento_fundo_2",
        columnName: "Comprimento sombreamento — Fundo 2",
      },
      { fieldId: "incluir_rede_tenis", columnName: "Rede de tênis" },
      { fieldId: "possui_basquete_adulto", columnName: "Basquete adulto" },
      {
        fieldId: "estrutura_basquete_adulto",
        columnName: "Estrutura do basquete adulto",
      },
      { fieldId: "possui_basquete_juvenil", columnName: "Basquete juvenil" },
      { fieldId: "possui_volei", columnName: "Vôlei" },
      { fieldId: "possui_futebol_futsal", columnName: "Futebol/Futsal" },
      { fieldId: "possui_trave_3x2", columnName: "Trave 3x2" },
      { fieldId: "possui_trave_4x2", columnName: "Trave 4x2" },
      { fieldId: "possui_trave_5x2", columnName: "Trave 5x2" },
      {
        fieldId: "possui_trave_oficial",
        columnName: "Trave oficial 7,24 x 2,42",
      },
      { fieldId: "possui_rede_pickleball", columnName: "Rede de Pickleball" },
      {
        fieldId: "tipo_rede_pickleball",
        columnName: "Tipo da rede de Pickleball",
      },
      { fieldId: "tipo_grama_padel", columnName: "Tipo de grama do Padel" },
      {
        fieldId: "tipo_estrutura_alambrado_padel",
        columnName: "Tipo de estrutura do alambrado do Padel",
      },
      { fieldId: "possui_acessorio_padel", columnName: "Acessório Padel" },
      { fieldId: "observacoes", columnName: "Observações", },
    ],
  },
  pptx: {
    placeholders: [
      { fieldId: "nome_razao_social", placeholder: "{{cliente_nome}}" },
      {
        fieldId: "variante_quadra_tenis",
        placeholder: "{{variante_quadra_tenis}}",
      },
      {
        fieldId: "variante_quadra_poliesportiva",
        placeholder: "{{variante_quadra_poliesportiva}}",
      },
      {
        fieldId: "variante_beach_tenis",
        placeholder: "{{variante_beach_tenis}}",
      },
      { fieldId: "variante_campo", placeholder: "{{variante_campo}}" },
      {
        fieldId: "variante_pickleball",
        placeholder: "{{variante_pickleball}}",
      },
      { fieldId: "variante_padel", placeholder: "{{variante_padel}}" },
      { fieldId: "variante_squash", placeholder: "{{variante_squash}}" },
      { fieldId: "variante_pista", placeholder: "{{variante_pista}}" },
      {
        fieldId: "variante_garagem_epoxi",
        placeholder: "{{variante_garagem_epoxi}}",
      },
      {
        fieldId: "variante_softplay",
        placeholder: "{{variante_softplay}}",
      },
      { fieldId: "numero_raias", placeholder: "{{numero_raias}}" },
      {
        fieldId: "opcao_pu_200_b_pista",
        placeholder: "{{opcao_pu_200_b_pista}}",
      },
      { fieldId: "largura", placeholder: "{{largura}}" },
      { fieldId: "comprimento", placeholder: "{{comprimento}}" },
      { fieldId: "area_total", placeholder: "{{area_total}}" },
      { fieldId: "tipo_areia", placeholder: "{{tipo_areia}}" },
      { fieldId: "possui_eva", placeholder: "{{possui_eva}}" },
      { fieldId: "espessura_sbr", placeholder: "{{espessura_sbr}}" },
      { fieldId: "espessura_epdm", placeholder: "{{espessura_epdm}}" },
      { fieldId: "tipo_epdm", placeholder: "{{tipo_epdm}}" },
      { fieldId: "tipo_terreno", placeholder: "{{tipo_terreno}}" },
      { fieldId: "dificuldade_acesso", placeholder: "{{dificuldade_acesso}}" },
      { fieldId: "tipo_madeira", placeholder: "{{tipo_madeira}}" },
      { fieldId: "tipo_poliuretano", placeholder: "{{tipo_poliuretano}}" },
      {
        fieldId: "espessura_poliuretano",
        placeholder: "{{espessura_poliuretano}}",
      },
      { fieldId: "tipo_grama_padel", placeholder: "{{tipo_grama_padel}}" },
      {
        fieldId: "tipo_estrutura_alambrado_padel",
        placeholder: "{{tipo_estrutura_alambrado_padel}}",
      },
      { fieldId: "observacoes", placeholder: "{{observacoes}}" },
    ],
  },
};

export { exportMappings };
