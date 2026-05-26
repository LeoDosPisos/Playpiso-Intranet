"""Catálogo de Investimento — beach_tenis (1 variante: padrao).

5 itens possíveis: piso, alambrado, iluminação, acessório, proteção EVA opcional.
Textos literais dos templates atuais (slides/beach_tenis/investimento.pptx).

Observação: o item de iluminação no template antigo NÃO começa com 'Iluminação –'
(começa direto com '{{quantidade_projetores}} projetores ...'). Mantido literal.
"""
from context_builder import _is_truthy

from ..catalog import InvestItem, TextRun
from . import _common


def _qtde_eva_perimetro(values: dict) -> float:
    """Perímetro da quadra: 2 * (largura + comprimento). Replica context_builder.py:258-266."""
    try:
        largura = float(values.get("largura") or 0)
        comprimento = float(values.get("comprimento") or 0)
        return 2 * (largura + comprimento)
    except (TypeError, ValueError):
        return 0.0


ITEMS: list[InvestItem] = [
    InvestItem(
        id="piso_beach_tenis",
        descricao_runs=[
            TextRun(
                text=(
                    "Quadra de Beach Tennis – Sistema de drenagem, mureta e "
                    "areia de quartzo especial tratada ou areia de rio Lavada "
                    "Piso oficial da CBT – Confederação Brasileira de Tênis e "
                    "Beach Tennis"
                ),
            ),
        ],
        unidade="m²",
        qtde_resolver=_common._area_total,
    ),
    _common.alambrado_item(),
    # Iluminação sem prefixo "Iluminação – " (literal do template antigo)
    InvestItem(
        id="iluminacao",
        descricao_runs=[
            TextRun(
                text=(
                    "{{quantidade_projetores}} projetores em Led "
                    "{{potencia_projetores}}W, {{quantidade_postes_iluminacao}} "
                    "postes galvanizados com altura de {{altura_postes_iluminacao}}m"
                ),
            ),
        ],
        unidade="Conjunto",
        qtde_resolver=lambda v: 1.0,
        applies_when=lambda v: _is_truthy(v.get("possui_iluminacao")),
    ),
    InvestItem(
        id="acessorio_beach_tenis",
        descricao_runs=[
            TextRun(
                text=(
                    "Acessórios com/sem sistema de regulagem, "
                    "postes galvanizados a fogo, catraca, cabo tensor e rede"
                ),
            ),
        ],
        unidade="Conjunto",
        qtde_resolver=_common._group_quantity,
    ),
    InvestItem(
        id="protecao_eva",
        descricao_runs=[
            TextRun(text="Proteção EVA – Opcional"),
        ],
        unidade="ML",  # metro linear (literal do template)
        qtde_resolver=_qtde_eva_perimetro,
        applies_when=lambda v: _is_truthy(v.get("possui_eva")),
    ),
]
