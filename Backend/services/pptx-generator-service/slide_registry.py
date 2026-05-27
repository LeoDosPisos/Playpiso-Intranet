import os

from pptx.util import Inches

SLIDES_DIR = os.path.join(os.path.dirname(__file__), "slides")
SLIDE_W    = Inches(13.33)
SLIDE_H    = Inches(7.5)

# Pasta dos blocos reutilizáveis (fechamentos/acessórios) compartilhados entre esportes.
_COMMON_SUBDIR = "_comum"


def _resolve_slide_path(relative: str) -> str:
    """Resolve um caminho relativo a ``slides/``.

    Usa o arquivo específico do esporte quando existe; caso contrário cai no
    bloco compartilhado em ``slides/_comum/`` (mesmo nome de arquivo). Assim um
    esporte pode sobrescrever um bloco apenas adicionando o .pptx na própria
    pasta, sem precisar duplicar os blocos comuns.
    """
    path = os.path.join(SLIDES_DIR, relative)
    if os.path.exists(path):
        return path
    return os.path.join(SLIDES_DIR, _COMMON_SUBDIR, os.path.basename(relative))

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
    # ── quadra_tenis ──────────────────────────────────────────────────────
    "hero_piso_asfaltico_quadra_tenis":   "quadra_tenis/hero_piso_asfaltico.pptx",
    "hero_saibro_quadra_tenis":           "quadra_tenis/hero_saibro.pptx",
    "hero_grama_natural_quadra_tenis":    "quadra_tenis/hero_grama_natural.pptx",
    "specs_piso_asfaltico":               "quadra_tenis/specs_piso_asfaltico.pptx",
    "specs_saibro":                       "quadra_tenis/specs_saibro.pptx",
    "specs_grama_natural":                "quadra_tenis/specs_grama_natural.pptx",
    "playcushion_quadra_tenis":           "quadra_tenis/playcushion.pptx",
    # fechamentos_quadra_tenis: resolvido dinamicamente via compose_fechamentos
    "cores_piso_asfaltico":               "quadra_tenis/cores_piso_asfaltico.pptx",
    "detalhe_construtivo_sem_playcushion":"quadra_tenis/detalhe_construtivo_sem_playcushion.pptx",
    "detalhe_construtivo_com_playcushion":"quadra_tenis/detalhe_construtivo.pptx",
    "detalhe_construtivo_grama_natural":  "quadra_tenis/detalhe_construtivo_grama_natural.pptx",
    "investimento_piso_asfaltico_quadra_tenis":  "quadra_tenis/investimento_piso_asfaltico.pptx",
    "investimento_saibro_quadra_tenis":          "quadra_tenis/investimento_saibro.pptx",
    "investimento_grama_natural_quadra_tenis":   "quadra_tenis/investimento_grama_natural.pptx",
    # ── quadra_poliesportiva ──────────────────────────────────────────────
    "hero_piso_asfaltico_quadra_poliesportiva":           "quadra_poli/hero_piso_asfaltico.pptx",
    "hero_assoalho_quadra_poliesportiva":                 "quadra_poli/hero_assoalho.pptx",
    "hero_poliuretano_quadra_poliesportiva":              "quadra_poli/hero_poliuretano.pptx",
    "specs_piso_asfaltico_quadra_poliesportiva":          "quadra_poli/specs_piso_asfaltico.pptx",
    "specs_assoalho_quadra_poliesportiva":                "quadra_poli/specs_assoalho.pptx",
    "specs_poliuretano_quadra_poliesportiva":             "quadra_poli/specs_poliuretano.pptx",
    "detalhe_construtivo_assoalho_quadra_poliesportiva":  "quadra_poli/detalhe_construtivo_assoalho.pptx",
    "detalhe_construtivo_poliuretano_quadra_poliesportiva":   "quadra_poli/detalhe_construtivo_poliuretano.pptx",
    "recomendacao_execucao_poliuretano_quadra_poliesportiva": "quadra_poli/recomendacao_execucao_poliuretano.pptx",
    # acessorios_quadra_poliesportiva: resolvido dinamicamente via compose_acessorios
    # fechamentos_quadra_poliesportiva: resolvido dinamicamente via compose_fechamentos
    "cores_piso_asfaltico_quadra_poliesportiva":          "quadra_poli/cores_piso_asfaltico.pptx",
    "investimento_piso_asfaltico_quadra_poliesportiva":   "quadra_poli/investimento_piso_asfaltico.pptx",
    "investimento_assoalho_quadra_poliesportiva":         "quadra_poli/investimento_assoalho.pptx",
    "investimento_poliuretano_quadra_poliesportiva":      "quadra_poli/investimento_poliuretano.pptx",
    # ── padel ─────────────────────────────────────────────────────────────
    "hero_padel":              "padel/hero.pptx",
    "specs_padel":             "padel/specs_padel.pptx",
    # acessorios_padel: resolvido dinamicamente via compose_acessorios
    # fechamentos_padel: resolvido dinamicamente via compose_fechamentos
    # investimento_padel: resolvido dinamicamente via compose_investimento
    # ── pickleball ────────────────────────────────────────────────────────
    "hero_pickleball":         "pickleball/hero.pptx",
    "specs_pickleball":        "pickleball/specs_pickleball.pptx",
    # acessorios_pickleball: resolvido dinamicamente via compose_acessorios
    # fechamentos_pickleball: resolvido dinamicamente via compose_fechamentos
    # investimento_pickleball: resolvido dinamicamente via compose_investimento
    # ── softplay ──────────────────────────────────────────────────────────
    "hero_softplay":           "softplay/hero.pptx",
    "specs_softplay":          "softplay/specs_softplay.pptx",
    "amostra_softplay":        "softplay/amostra.pptx",
    "cores_softplay":          "softplay/cores.pptx",
    "recomendacao_execucao_softplay": "softplay/recomendacao_execucao_softplay.pptx",
    # investimento_softplay: resolvido dinamicamente via compose_investimento
    # ── Global pós-produto ────────────────────────────────────────────────
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
    "padel":                "padel",
    "pickleball":           "pickleball",
    "softplay":             "softplay",
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
