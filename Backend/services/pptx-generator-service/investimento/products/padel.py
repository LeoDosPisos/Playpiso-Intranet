"""Catálogo de Investimento — padel (1 variante: grama_sintetica).

Padel tem estrutura de vidro + iluminação combinadas num único item (não
desmontável como na quadra de tênis), por isso não reaproveita o `alambrado_item`
de `_common`. O alambrado é obrigatório (não há toggle).

Textos literais dos templates atuais (slides/padel/investimento.pptx).
"""
from context_builder import _is_truthy

from ..catalog import InvestItem, TextRun
from . import _common


ITEMS: list[InvestItem] = [
    InvestItem(
        id="piso_grama_sintetica",
        descricao_runs=[
            TextRun(text="Grama Sintética Limonta – Fornecimento e instalação"),
        ],
        unidade="m²",
        qtde_resolver=_common._area_total,
    ),
    InvestItem(
        id="estrutura_vidro_iluminacao",
        descricao_runs=[
            TextRun(
                text=(
                    "Estrutura de Vidro + Iluminação + Acessórios - "
                    "Estrutura metálica com vidro temperado, "
                    "04 postes de iluminação fixados na estrutura, "
                    "08 projetores led 200W"
                ),
            ),
        ],
        unidade="Unid.",
        qtde_resolver=_common._area_alambrado,
    ),
    InvestItem(
        id="acessorio_padel",
        descricao_runs=[
            TextRun(text="Acessório – Suporte da rede e rede de nylon"),
        ],
        unidade="Unid.",
        qtde_resolver=_common._group_quantity,
        applies_when=lambda v: _is_truthy(v.get("possui_acessorio_padel")),
    ),
]
