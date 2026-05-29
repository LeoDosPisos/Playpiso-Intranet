-- Adiciona a coluna cor_cruzetas em proposal_product_groups (campo do formulário Iluminação).
-- Idempotente: roda como no-op em bancos que já tenham a coluna.
ALTER TABLE proposal_product_groups ADD COLUMN IF NOT EXISTS cor_cruzetas VARCHAR(50);
