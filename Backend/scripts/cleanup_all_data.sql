-- Limpa TODAS as propostas e grupos de produto, registrando a operação em audit_cleanup_log.
--
-- Uso:
--   psql "<connection-string-azure>" -f cleanup_all_data.sql
-- ou cole o conteúdo no Query Editor do portal Azure (Azure Database for PostgreSQL).
--
-- Pré-requisito: a tabela audit_cleanup_log precisa existir (criada pela migration V008 do DbUp).
--
-- ATENÇÃO: operação destrutiva e irreversível. CASCADE limpa proposal_product_groups
-- automaticamente via FK proposal_id REFERENCES proposals(id) ON DELETE CASCADE.

BEGIN;

WITH counts AS (
  SELECT
    (SELECT COUNT(*) FROM proposals)               AS p_count,
    (SELECT COUNT(*) FROM proposal_product_groups) AS g_count
)
INSERT INTO audit_cleanup_log (
  executed_by_postgres_user,
  proposals_deleted,
  product_groups_deleted,
  notes
)
SELECT
  current_user,
  p_count,
  g_count,
  'Manual cleanup via cleanup_all_data.sql'
FROM counts;

TRUNCATE TABLE proposals CASCADE;

COMMIT;

-- Verificação pós-execução:
SELECT * FROM audit_cleanup_log ORDER BY executed_at DESC LIMIT 5;
SELECT COUNT(*) AS remaining_proposals FROM proposals;
SELECT COUNT(*) AS remaining_groups    FROM proposal_product_groups;
