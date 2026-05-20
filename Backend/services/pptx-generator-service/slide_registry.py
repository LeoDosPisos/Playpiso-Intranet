import os

from pptx.util import Inches

SLIDES_DIR = os.path.join(os.path.dirname(__file__), "slides")
SLIDE_W    = Inches(13.33)
SLIDE_H    = Inches(7.5)

SLIDE_FILE_MAP: dict[str, str] = {
    # ── Global pré-produto ────────────────────────────────────────────────
    "capa":                               "global/capa.pptx",
    "portfolio":                          "global/portfolio.pptx",
    "sobre_empresa":                      "global/sobre_empresa.pptx",
    "pilares":                            "global/pilares.pptx",
    "parceiros":                          "global/parceiros.pptx",
    "dados_cliente":                      "global/dados_cliente.pptx",
    "sumario":                            "global/sumario.pptx",
    # ── beach_tenis ───────────────────────────────────────────────────────
    "hero_beach_tenis":                   "beach_tenis/hero.pptx",
    "areia_rio_beach_tenis":              "beach_tenis/areia_rio.pptx",
    "areia_quartzo_beach_tenis":          "beach_tenis/areia_quartzo.pptx",
    "protecao_eva_beach_tenis":           "beach_tenis/protecao_eva.pptx",
    # fechamentos_beach_tenis: resolvido dinamicamente via compose_fechamentos
    "acessorio_beach_tenis":              "beach_tenis/acessorio.pptx",
    "investimento_beach_tenis":           "beach_tenis/investimento.pptx",
    # ── quadra_tenis ──────────────────────────────────────────────────────
    "hero_piso_asfaltico_quadra_tenis":   "quadra_tenis/hero_piso_asfaltico.pptx",
    "hero_saibro_quadra_tenis":           "quadra_tenis/hero_saibro.pptx",
    "hero_grama_quadra_tenis":            "quadra_tenis/hero_grama.pptx",
    "specs_piso_asfaltico":               "quadra_tenis/specs_piso_asfaltico.pptx",
    "specs_saibro":                       "quadra_tenis/specs_saibro.pptx",
    "specs_grama":                        "quadra_tenis/specs_grama.pptx",
    "playcushion_quadra_tenis":           "quadra_tenis/playcushion.pptx",
    # fechamentos_quadra_tenis: resolvido dinamicamente via compose_fechamentos
    "cores_piso_asfaltico":               "quadra_tenis/cores_piso_asfaltico.pptx",
    "detalhe_construtivo_sem_playcushion":"quadra_tenis/detalhe_construtivo_sem_playcushion.pptx",
    "detalhe_construtivo_com_playcushion":"quadra_tenis/detalhe_construtivo.pptx",
    "investimento_piso_asfaltico_quadra_tenis": "quadra_tenis/investimento_piso_asfaltico.pptx",
    "investimento_saibro_quadra_tenis":         "quadra_tenis/investimento_saibro.pptx",
    "investimento_grama_quadra_tenis":          "quadra_tenis/investimento_grama.pptx",
    # ── quadra_poliesportiva ──────────────────────────────────────────────
    "hero_piso_asfaltico_quadra_poliesportiva":          "quadra_poli/hero_piso_asfaltico.pptx",
    "specs_piso_asfaltico_quadra_poliesportiva":         "quadra_poli/specs_piso_asfaltico.pptx",
    # acessorios_quadra_poliesportiva: resolvido dinamicamente via compose_acessorios
    # fechamentos_quadra_poliesportiva: resolvido dinamicamente via compose_fechamentos
    "cores_piso_asfaltico_quadra_poliesportiva":         "quadra_poli/cores_piso_asfaltico.pptx",
    "investimento_piso_asfaltico_quadra_poliesportiva":  "quadra_poli/investimento_piso_asfaltico.pptx",
    # ── Global pós-produto ────────────────────────────────────────────────
    "condicoes_pagamento_direto_a":       "global/condicoes_pagamento_direto_a.pptx",
    "condicoes_pagamento_direto_b":       "global/condicoes_pagamento_direto_b.pptx",
    "condicoes_pagamento_playpiso":       "global/condicoes_pagamento_playpiso.pptx",
    "prazos_garantia":                    "global/prazos_garantia.pptx",
    "regras_contratada":                  "global/regras_contratada.pptx",
    "regras_contratante":                 "global/regras_contratante.pptx",
    "consideracoes_gerais":               "global/consideracoes_gerais.pptx",
    "encerramento":                       "global/encerramento.pptx",
}

_PRODUCT_SLIDES_DIR: dict[str, str] = {
    "beach_tenis":          "beach_tenis",
    "quadra_tenis":         "quadra_tenis",
    "quadra_poliesportiva": "quadra_poli",
}


def _slide_template_path(slide_id: str) -> str | None:
    rel = SLIDE_FILE_MAP.get(slide_id)
    if not rel:
        return None
    path = os.path.join(SLIDES_DIR, rel)
    return path if os.path.exists(path) else None


def is_slide_available(slide_id: str) -> bool:
    return _slide_template_path(slide_id) is not None


def get_available_slides() -> list[str]:
    return [sid for sid in SLIDE_FILE_MAP if is_slide_available(sid)]
