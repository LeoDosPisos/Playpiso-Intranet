"""Catálogo de Investimento — softplay (1 variante: padrao).

Catálogo minimalista: apenas uma linha de produto (sistema softplay moldado
in loco). Espessura total = SBR + EPDM (computada dinamicamente; não existe
no context_builder).

Texto literal do template atual (slides/softplay/investimento.pptx).
"""
from ..catalog import InvestItem, TextRun
from . import _common


def _espessura_total_cm(values: dict) -> str:
    """Soma espessura_sbr + espessura_epdm em cm. Retorna string formatada."""
    try:
        sbr = float(values.get("espessura_sbr") or 0)
    except (TypeError, ValueError):
        sbr = 0.0
    try:
        epdm = float(values.get("espessura_epdm") or 0)
    except (TypeError, ValueError):
        epdm = 0.0
    total = sbr + epdm
    # Formata sem decimais se for inteiro; senão com 1 casa
    return str(int(total)) if total == int(total) else f"{total:.1f}".replace(".", ",")


def _piso_softplay_runs(values: dict) -> list[TextRun]:
    espessura = _espessura_total_cm(values)
    return [
        TextRun(
            text=(
                f"Playground – Sistema Softplay – Moldado 'in loco' – "
                f"Espessura final: {espessura}cm"
            ),
        ),
    ]


ITEMS: list[InvestItem] = [
    InvestItem(
        id="piso_softplay",
        descricao_runs=[],
        descricao_resolver=_piso_softplay_runs,
        unidade="m²",
        qtde_resolver=_common._area_total,
    ),
]
