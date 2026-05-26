"""Catálogo de Investimento — pickleball (1 variante: padrao).

3 itens: piso (com acessório embutido), alambrado, iluminação. Versão compacta
em relação à quadra de tênis — sem PlayCushion e sem altura dos postes.

Textos literais do template atual (slides/pickleball/investimento.pptx).
Unidade do piso e do alambrado é "M²" (maiúsculo) — mantido literal.
"""
from context_builder import _is_truthy

from ..catalog import InvestItem, TextRun
from . import _common


ITEMS: list[InvestItem] = [
    InvestItem(
        id="piso_pickleball",
        descricao_runs=[
            TextRun(
                text=(
                    "Piso – Quadra de Pickleball – Base Asfáltica Playpiso → "
                    "Incluso acessório: postes galvanizados a fogo, catraca e rede"
                ),
            ),
        ],
        unidade="M²",  # literal do template
        qtde_resolver=_common._area_total,
    ),
    # Alambrado segue o padrão compartilhado, mas com unidade "M²" maiúsculo
    _common.alambrado_item(unidade="M²"),
    # Iluminação compacta (sem altura de postes) — não cabe no _common, fica inline
    InvestItem(
        id="iluminacao",
        descricao_runs=[
            TextRun(
                text=(
                    "Iluminação – {{quantidade_projetores}} projetores LED "
                    "{{potencia_projetores}}W, {{quantidade_postes_iluminacao}} postes"
                ),
            ),
        ],
        unidade="Conjunto",
        qtde_resolver=lambda v: 1.0,
        applies_when=lambda v: _is_truthy(v.get("possui_iluminacao")),
    ),
]
