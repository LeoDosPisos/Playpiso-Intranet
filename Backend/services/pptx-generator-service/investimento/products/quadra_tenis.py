"""Catálogo de Investimento — quadra_tenis (3 variantes).

Variantes:
- piso_asfaltico: piso + acessório tênis + alambrado + iluminação + PlayCushion (opcional)
- saibro:         piso + acessórios + alambrado + iluminação + Kit saibro (opcional)
- grama_natural:  piso + alambrado + iluminação + acessórios

Textos das descrições são literais dos templates atuais (slides/quadra_tenis/
investimento_*.pptx) com placeholders {{ key }} mantidos para interpolação
via ctx no momento de renderizar.
"""
from context_builder import _is_truthy

from ..catalog import InvestItem, TextRun
from . import _common


_ACESSORIO_TENIS_DETALHE = (
    "Postes galvanizados a fogo, catraca, cabo tensor, faixa central e rede"
)


ITEMS: list[InvestItem] = [
    # ── Piso por variante ────────────────────────────────────────────────────
    InvestItem(
        id="piso_asfaltico",
        descricao_runs=[
            TextRun(
                text=(
                    "Piso – Quadra de Tênis – Base Asfáltica Playpiso "
                    "Piso oficial da CBT – Confederação Brasileira de Tênis"
                ),
            ),
        ],
        unidade="m²",
        qtde_resolver=_common._area_total,
        variant_filter={"piso_asfaltico"},
    ),
    InvestItem(
        id="piso_saibro",
        descricao_runs=[
            TextRun(
                text=(
                    "Piso – Quadra de Tênis Saibro "
                    "Piso oficial da CBT – Confederação Brasileira de Tênis"
                ),
            ),
        ],
        unidade="m²",
        qtde_resolver=_common._area_total,
        variant_filter={"saibro"},
    ),
    InvestItem(
        id="piso_grama_natural",
        descricao_runs=[
            TextRun(text="Piso – Quadra de Tênis Grama Natural"),
        ],
        unidade="M²",  # literal do template antigo
        qtde_resolver=_common._area_total,
        variant_filter={"grama_natural"},
    ),
    # ── Acessório tênis (texto/unidade variam por variante) ──────────────────
    InvestItem(
        id="acessorio_tenis_asfaltico",
        descricao_runs=[
            TextRun(text=f"Acessório Tênis – {_ACESSORIO_TENIS_DETALHE}"),
        ],
        unidade="Conjunto",
        qtde_resolver=_common._group_quantity,
        variant_filter={"piso_asfaltico"},
    ),
    InvestItem(
        id="acessorio_tenis_saibro",
        descricao_runs=[
            TextRun(text=f"Acessórios: {_ACESSORIO_TENIS_DETALHE}"),
        ],
        unidade="Conj.",  # literal do template antigo
        qtde_resolver=_common._group_quantity,
        variant_filter={"saibro"},
    ),
    InvestItem(
        id="acessorio_tenis_grama",
        descricao_runs=[
            TextRun(text=f"Acessórios – {_ACESSORIO_TENIS_DETALHE}"),
        ],
        unidade="Conjunto",
        qtde_resolver=_common._group_quantity,
        variant_filter={"grama_natural"},
    ),
    # ── Fechamentos compartilhados ───────────────────────────────────────────
    _common.alambrado_item(),
    _common.iluminacao_item(),
    _common.tela_superior_item(),
    _common.tela_sombreamento_item(),
    # ── Itens opcionais específicos por variante ────────────────────────────
    InvestItem(
        id="playcushion",
        descricao_runs=[TextRun(text="PlayCushion")],
        unidade="m²",
        qtde_resolver=_common._area_total,
        applies_when=lambda v: _is_truthy(v.get("possui_playcushion")),
        variant_filter={"piso_asfaltico"},
    ),
    InvestItem(
        id="kit_saibro",
        descricao_runs=[
            TextRun(
                text=(
                    "Kit saibro – Cilindro metálico manual, "
                    "vassourão e limpador de linha"
                ),
            ),
        ],
        unidade="Vb",  # verba (literal do template)
        qtde_resolver=lambda v: 1.0,
        applies_when=lambda v: _is_truthy(v.get("possui_kit_saibro")),
        variant_filter={"saibro"},
    ),
]
