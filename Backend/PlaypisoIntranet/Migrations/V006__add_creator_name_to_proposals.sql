-- Adiciona colunas para preservar o nome de exibição do criador da proposta
-- e do usuário que disparou a geração dos artefatos (PPTX/XLSX).
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS created_by_name   VARCHAR(255),
  ADD COLUMN IF NOT EXISTS generated_by_name VARCHAR(255);
