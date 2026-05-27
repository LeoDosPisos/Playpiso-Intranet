import copy
import logging
import os

from pptx import Presentation

from context_builder import _is_truthy
from placeholder_engine import _replace_placeholders
from slide_copier import _copy_slide, _shift_shape_top
from slide_registry import _PRODUCT_SLIDES_DIR, _resolve_slide_path

logger = logging.getLogger("pptx_generator.merger")

_CM_TO_EMU                  = 914400 / 2.54
_CONTENT_TOP_EMU            = round(0.5 * _CM_TO_EMU)
_ACESSORIOS_CONTENT_TOP_EMU = round(2.25 * _CM_TO_EMU)
_SECTION_GAP_EMU            = round(0 * _CM_TO_EMU)
_ACESSORIOS_SECTION_GAP_EMU = round(-0.1 * _CM_TO_EMU)

_FECHAMENTOS_SECTIONS: list[tuple[str, str]] = [
    ("possui_alambrado",         "alambrado"),
    ("possui_iluminacao",        "iluminacao"),
    ("possui_tela_superior",     "tela_superior"),
    ("possui_tela_sombreamento", "tela_sombreamento"),
]


def _get_active_acessorios_sections(product_id: str, values: dict) -> list[str]:
    if product_id == "padel":
        return ["padel"] if _is_truthy(values.get("possui_acessorio_padel")) else []

    if product_id == "pickleball":
        return ["pickleball"] if _is_truthy(values.get("possui_rede_pickleball")) else []

    sections: list[str] = []

    if _is_truthy(values.get("possui_basquete_adulto")):
        estrutura = str(values.get("estrutura_basquete_adulto") or "comum")
        if estrutura in ("metalica", "hidraulica", "comum"):
            sections.append(f"basquete_adulto_{estrutura}")
        else:
            sections.append("basquete_adulto_comum")

    if _is_truthy(values.get("possui_basquete_juvenil")):
        sections.append("basquete_juvenil")

    if _is_truthy(values.get("possui_volei")):
        sections.append("volei")

    if _is_truthy(values.get("possui_tenis")):
        sections.append("tenis")

    if _is_truthy(values.get("possui_futebol_futsal")):
        tipo = str(values.get("tipo_futsal") or "padrao")
        sections.append(f"futsal_{tipo}" if tipo in ("padrao", "mini_trave") else "futsal_padrao")

    return sections


def compose_fechamentos(
    merged: Presentation,
    base_path: str,
    product_id: str,
    values: dict,
    ctx: dict,
    img_counter: list[int],
) -> None:
    active = [
        name for field, name in _FECHAMENTOS_SECTIONS if _is_truthy(values.get(field))
    ]

    # Padel: alambrado é obrigatório, renderiza o slide base mesmo sem nenhuma
    # das seções dinâmicas ativas (as informações de alambrado já estão no base).
    if not active:
        if product_id == "padel":
            if not os.path.exists(base_path):
                logger.warning("fechamentos_base não encontrado: %s", base_path)
                return
            src_base = Presentation(base_path)
            new_slide = _copy_slide(merged, src_base.slides[0], img_counter)
            _replace_placeholders(new_slide, ctx)
        return

    pages = [active] if len(active) <= 3 else [active[:2], active[2:]]
    product_subdir = _PRODUCT_SLIDES_DIR.get(product_id, product_id)

    for page_sections in pages:
        if not os.path.exists(base_path):
            logger.warning("fechamentos_base não encontrado: %s", base_path)
            return

        src_base = Presentation(base_path)
        new_slide = _copy_slide(merged, src_base.slides[0], img_counter)

        sp_tree = new_slide.shapes._spTree
        current_top = _CONTENT_TOP_EMU
        gap = 0 if len(page_sections) == 2 else _SECTION_GAP_EMU

        for section_name in page_sections:
            comp_path = _resolve_slide_path(os.path.join(product_subdir, f"secao_{section_name}.pptx"))
            if not os.path.exists(comp_path):
                logger.warning("componente não encontrado: %s", comp_path)
                continue
            src_comp = Presentation(comp_path)
            comp_slide = src_comp.slides[0]

            comp_height = max(
                (shape.top + shape.height for shape in comp_slide.shapes),
                default=0,
            )

            for shape in comp_slide.shapes:
                el = copy.deepcopy(shape._element)
                _shift_shape_top(el, current_top)
                sp_tree.append(el)

            current_top += comp_height + gap

        _replace_placeholders(new_slide, ctx)


def compose_acessorios(
    merged: Presentation,
    base_path: str,
    product_id: str,
    values: dict,
    ctx: dict,
    img_counter: list[int],
) -> None:
    active = _get_active_acessorios_sections(product_id, values)
    if not active:
        return

    product_subdir = _PRODUCT_SLIDES_DIR.get(product_id, product_id)
    pages = [active[i:i + 4] for i in range(0, len(active), 4)]

    for page_sections in pages:
        if not os.path.exists(base_path):
            logger.warning("acessorios_base não encontrado: %s", base_path)
            return

        src_base = Presentation(base_path)
        new_slide = _copy_slide(merged, src_base.slides[0], img_counter)
        sp_tree = new_slide.shapes._spTree
        current_top = _ACESSORIOS_CONTENT_TOP_EMU

        for section_name in page_sections:
            comp_path = _resolve_slide_path(
                os.path.join(product_subdir, f"secao_acessorio_{section_name}.pptx")
            )
            if not os.path.exists(comp_path):
                logger.warning("componente acessório não encontrado: %s", comp_path)
                continue

            src_comp = Presentation(comp_path)
            comp_slide = src_comp.slides[0]
            comp_height = max(
                (shape.top + shape.height for shape in comp_slide.shapes),
                default=0,
            )
            for shape in comp_slide.shapes:
                el = copy.deepcopy(shape._element)
                _shift_shape_top(el, current_top)
                sp_tree.append(el)
            current_top += comp_height + _ACESSORIOS_SECTION_GAP_EMU

        _replace_placeholders(new_slide, ctx)
