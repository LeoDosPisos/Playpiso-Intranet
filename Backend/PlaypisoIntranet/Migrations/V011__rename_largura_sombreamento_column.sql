-- Renomeia a coluna largura_sombreamento -> altura_sombreamento em proposal_product_groups,
-- alinhando a chave interna ao novo rótulo "Altura do sombreamento".
-- A coluna foi criada como normalizada na V002 (nunca esteve no JSONB specs),
-- então um RENAME COLUMN preserva os dados existentes.
-- Idempotente: só renomeia se a coluna antiga ainda existir.

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposal_product_groups' AND column_name = 'largura_sombreamento'
  ) THEN
    ALTER TABLE proposal_product_groups RENAME COLUMN largura_sombreamento TO altura_sombreamento;
  END IF;
END $$;

COMMIT;
