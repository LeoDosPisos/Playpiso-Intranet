ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS generated_by_user_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS generated_by_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_proposals_generated_by ON proposals(generated_by_user_id);
