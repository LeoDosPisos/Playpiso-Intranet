-- Adiciona a coluna local_obra para bancos que aplicaram V001 antes da coluna ser incluída.
-- Em instalações novas, V001 já cria a coluna; o IF NOT EXISTS torna este script no-op.
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS local_obra TEXT NOT NULL DEFAULT '';
