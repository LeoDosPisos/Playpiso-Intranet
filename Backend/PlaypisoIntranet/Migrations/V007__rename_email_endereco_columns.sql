-- Renomeia colunas do cliente para o padrão usado pelo código atual:
--   email          -> email_cliente
--   endereco_obra  -> endereco_cliente
-- Idempotente: cada RENAME só executa se a coluna de origem ainda existir
-- (cobre tanto DBs criados pela V001 antiga quanto instalações novas).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'email'
  ) THEN
    ALTER TABLE proposals RENAME COLUMN email TO email_cliente;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposals' AND column_name = 'endereco_obra'
  ) THEN
    ALTER TABLE proposals RENAME COLUMN endereco_obra TO endereco_cliente;
  END IF;
END $$;
