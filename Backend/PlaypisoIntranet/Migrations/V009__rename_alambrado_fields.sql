-- Renomeia 12 chaves do JSONB specs em proposal_product_groups para refletir
-- a nova nomenclatura dos lados do alambrado "Especial":
--   lateral_esquerda  -> lateral_1
--   lateral_direita   -> lateral_2
--   fundo_frontal     -> fundo_1
--   fundo_traseiro    -> fundo_2
-- Idempotente: cada UPDATE só toca linhas que ainda contêm a chave antiga.

BEGIN;

-- lateral_esquerda -> lateral_1
UPDATE proposal_product_groups
SET specs = (specs - 'comprimento_alambrado_lateral_esquerda')
            || jsonb_build_object('comprimento_alambrado_lateral_1', specs->'comprimento_alambrado_lateral_esquerda')
WHERE specs ? 'comprimento_alambrado_lateral_esquerda';

UPDATE proposal_product_groups
SET specs = (specs - 'altura_alambrado_lateral_esquerda')
            || jsonb_build_object('altura_alambrado_lateral_1', specs->'altura_alambrado_lateral_esquerda')
WHERE specs ? 'altura_alambrado_lateral_esquerda';

UPDATE proposal_product_groups
SET specs = (specs - 'espacamento_postes_tubos_lateral_esquerda')
            || jsonb_build_object('espacamento_postes_tubos_lateral_1', specs->'espacamento_postes_tubos_lateral_esquerda')
WHERE specs ? 'espacamento_postes_tubos_lateral_esquerda';

-- lateral_direita -> lateral_2
UPDATE proposal_product_groups
SET specs = (specs - 'comprimento_alambrado_lateral_direita')
            || jsonb_build_object('comprimento_alambrado_lateral_2', specs->'comprimento_alambrado_lateral_direita')
WHERE specs ? 'comprimento_alambrado_lateral_direita';

UPDATE proposal_product_groups
SET specs = (specs - 'altura_alambrado_lateral_direita')
            || jsonb_build_object('altura_alambrado_lateral_2', specs->'altura_alambrado_lateral_direita')
WHERE specs ? 'altura_alambrado_lateral_direita';

UPDATE proposal_product_groups
SET specs = (specs - 'espacamento_postes_tubos_lateral_direita')
            || jsonb_build_object('espacamento_postes_tubos_lateral_2', specs->'espacamento_postes_tubos_lateral_direita')
WHERE specs ? 'espacamento_postes_tubos_lateral_direita';

-- fundo_frontal -> fundo_1
UPDATE proposal_product_groups
SET specs = (specs - 'comprimento_alambrado_fundo_frontal')
            || jsonb_build_object('comprimento_alambrado_fundo_1', specs->'comprimento_alambrado_fundo_frontal')
WHERE specs ? 'comprimento_alambrado_fundo_frontal';

UPDATE proposal_product_groups
SET specs = (specs - 'altura_alambrado_fundo_frontal')
            || jsonb_build_object('altura_alambrado_fundo_1', specs->'altura_alambrado_fundo_frontal')
WHERE specs ? 'altura_alambrado_fundo_frontal';

UPDATE proposal_product_groups
SET specs = (specs - 'espacamento_postes_tubos_fundo_frontal')
            || jsonb_build_object('espacamento_postes_tubos_fundo_1', specs->'espacamento_postes_tubos_fundo_frontal')
WHERE specs ? 'espacamento_postes_tubos_fundo_frontal';

-- fundo_traseiro -> fundo_2
UPDATE proposal_product_groups
SET specs = (specs - 'comprimento_alambrado_fundo_traseiro')
            || jsonb_build_object('comprimento_alambrado_fundo_2', specs->'comprimento_alambrado_fundo_traseiro')
WHERE specs ? 'comprimento_alambrado_fundo_traseiro';

UPDATE proposal_product_groups
SET specs = (specs - 'altura_alambrado_fundo_traseiro')
            || jsonb_build_object('altura_alambrado_fundo_2', specs->'altura_alambrado_fundo_traseiro')
WHERE specs ? 'altura_alambrado_fundo_traseiro';

UPDATE proposal_product_groups
SET specs = (specs - 'espacamento_postes_tubos_fundo_traseiro')
            || jsonb_build_object('espacamento_postes_tubos_fundo_2', specs->'espacamento_postes_tubos_fundo_traseiro')
WHERE specs ? 'espacamento_postes_tubos_fundo_traseiro';

COMMIT;
