CREATE TABLE proposals (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_proposta         VARCHAR(50) NOT NULL,
  status                  VARCHAR(20) NOT NULL DEFAULT 'rascunho',

  data_solicitacao        DATE,
  data_envio              DATE,

  nome_razao_social       VARCHAR(255) NOT NULL,
  cpf_cnpj                VARCHAR(20),
  nome_contato            VARCHAR(255),
  telefone                VARCHAR(20),
  email                   VARCHAR(255),

  endereco_obra           TEXT NOT NULL,
  local_obra              TEXT NOT NULL,
  cidade                  VARCHAR(100) NOT NULL,
  estado                  VARCHAR(2) NOT NULL,
  tipo_projeto            VARCHAR(20) NOT NULL,

  pptx_url                TEXT,
  xlsx_url                TEXT,

  created_by_user_id      VARCHAR(255) NOT NULL,
  created_by_email        VARCHAR(255),
  generated_by_user_id    VARCHAR(255),
  generated_by_email      VARCHAR(255),
  generated_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proposals_status      ON proposals(status);
CREATE INDEX idx_proposals_created_by  ON proposals(created_by_user_id);
CREATE INDEX idx_proposals_generated_by ON proposals(generated_by_user_id);
CREATE INDEX idx_proposals_created_at  ON proposals(created_at DESC);
