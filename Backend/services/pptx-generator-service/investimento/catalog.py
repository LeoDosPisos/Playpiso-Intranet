from dataclasses import dataclass, field
from typing import Callable

from pptx.dml.color import RGBColor


@dataclass
class TextRun:
    text: str
    bold: bool = False
    italic: bool = False
    color: RGBColor | None = None
    size_pt: int | None = None


@dataclass
class InvestItem:
    id: str
    descricao_runs: list[TextRun]
    unidade: str
    qtde_resolver: Callable[[dict], float]
    applies_when: Callable[[dict], bool] = field(default=lambda v: True)
    variant_filter: set[str] | None = None
    descricao_resolver: Callable[[dict], list[TextRun]] | None = None

    def resolve_runs(self, values: dict) -> list[TextRun]:
        if self.descricao_resolver is not None:
            return self.descricao_resolver(values)
        return self.descricao_runs


def get_items(product_id: str, variant_id: str, values: dict) -> list[InvestItem]:
    if product_id == "quadra_poliesportiva":
        from .products.quadra_poli import ITEMS
    elif product_id == "quadra_tenis":
        from .products.quadra_tenis import ITEMS
    elif product_id == "padel":
        from .products.padel import ITEMS
    elif product_id == "softplay":
        from .products.softplay import ITEMS
    elif product_id == "pickleball":
        from .products.pickleball import ITEMS
    elif product_id == "beach_tenis":
        from .products.beach_tenis import ITEMS
    else:
        raise NotImplementedError(
            f"Catálogo de investimento não implementado para product_id={product_id!r}"
        )

    out: list[InvestItem] = []
    for item in ITEMS:
        if item.variant_filter is not None and variant_id not in item.variant_filter:
            continue
        if not item.applies_when(values):
            continue
        out.append(item)
    return out
