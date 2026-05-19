ALTER TABLE proposals
ADD CONSTRAINT uq_proposals_numero_proposta UNIQUE (numero_proposta);
