-- Renomeia a coluna largura_portoes -> comprimento_portoes em proposal_product_groups,
-- alinhando a chave interna ao novo rótulo "Comprimento dos portões".
-- A coluna foi criada como normalizada na V004 (nunca esteve no JSONB specs),
-- então um RENAME COLUMN preserva os dados existentes.
-- Idempotente: só renomeia se a coluna antiga ainda existir.

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposal_product_groups' AND column_name = 'largura_portoes'
  ) THEN
    ALTER TABLE proposal_product_groups RENAME COLUMN largura_portoes TO comprimento_portoes;
  END IF;
END $$;

COMMIT;
