CREATE TABLE proposal_product_groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id     UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,

  product_id      VARCHAR(50) NOT NULL,
  variant_id      VARCHAR(50) NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1,
  group_index     INTEGER NOT NULL,

  -- dimensoes
  largura                       NUMERIC(10,2),
  comprimento                   NUMERIC(10,2),
  area_total                    NUMERIC(10,2),

  -- condicoes_obra
  tipo_terreno                  VARCHAR(50),
  dificuldade_acesso            VARCHAR(20),
  responsavel_material_pedreira VARCHAR(20),

  -- iluminacao
  possui_iluminacao                 BOOLEAN DEFAULT FALSE,
  iluminacao_fixada_alambrado       BOOLEAN,
  quantidade_postes_iluminacao      INTEGER,
  altura_postes_iluminacao          NUMERIC(10,2),
  quantidade_projetores             INTEGER,
  potencia_projetores               VARCHAR(50),
  especificar_potencia_projetores   VARCHAR(255),
  quantidade_cruzetas               INTEGER,
  responsavel_ligacao_eletrica      VARCHAR(50) DEFAULT 'cliente',
  tipo_coligacao                    VARCHAR(20),

  -- fechamentos_protecoes
  -- As variantes por lado (fundos/laterais) ficam em specs (JSONB), por isso
  -- nao ha colunas dedicadas para comprimento/altura/espacamento genericos.
  possui_alambrado              BOOLEAN DEFAULT FALSE,
  galvanizacao                  VARCHAR(50),
  especificar_galvanizacao      VARCHAR(255),
  possui_trelica                BOOLEAN,
  travamento                    TEXT,
  possui_tela_superior          BOOLEAN,
  possui_tela_sombreamento      BOOLEAN,
  largura_sombreamento          NUMERIC(10,2),
  comprimento_sombreamento      NUMERIC(10,2),

  -- portoes
  quantidade_portoes            INTEGER,
  altura_portoes                NUMERIC(8,2),
  largura_portoes               NUMERIC(8,2),

  observacoes TEXT,

  -- campos especificos do produto/variante (ex: cor_piso_asfaltico, tipo_grama, vagas, etc.)
  specs JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ppg_proposal_id ON proposal_product_groups(proposal_id);
CREATE INDEX idx_ppg_product_id  ON proposal_product_groups(product_id);
CREATE INDEX idx_ppg_specs       ON proposal_product_groups USING gin(specs);
