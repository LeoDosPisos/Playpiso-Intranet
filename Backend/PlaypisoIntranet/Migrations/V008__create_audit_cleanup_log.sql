-- Tabela de auditoria para operações de limpeza em massa do banco.
-- Populada pelo script Backend/scripts/cleanup_all_data.sql quando executado manualmente.
CREATE TABLE IF NOT EXISTS audit_cleanup_log (
  id                         BIGSERIAL PRIMARY KEY,
  executed_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_by_postgres_user  TEXT        NOT NULL,
  proposals_deleted          BIGINT      NOT NULL,
  product_groups_deleted     BIGINT      NOT NULL,
  notes                      TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_cleanup_log_executed_at
  ON audit_cleanup_log(executed_at DESC);
