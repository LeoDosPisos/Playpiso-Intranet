"""Itens compartilhados entre múltiplos produtos.

Cada função é uma factory que devolve um `InvestItem` configurado. Permite
reaproveitar a mesma descrição (incluindo placeholders) entre quadra_poli,
quadra_tenis, beach_tenis, padel, pickleball etc., sem duplicar strings.

Para resolver corretamente a quantidade, alguns itens dependem de campos do
contexto que NÃO estão em `values`. Esses campos são:
- `_quantity`: número de produtos do grupo (group.quantity), injetado pelo
  roteador em `presentation_builder.py` antes de chamar `compose_investimento`.
"""
from context_builder import _is_truthy

from ..catalog import InvestItem, TextRun

_ALAMBRADO_LADOS = (
    "lateral_1", "lateral_2", "fundo_1", "fundo_2",
)


def _area_total(values: dict) -> float:
    try:
        return float(values.get("area_total") or 0)
    except (TypeError, ValueError):
        return 0.0


def _area_alambrado(values: dict) -> float:
    """Replica o cálculo de context_builder.py:172-194 retornando float."""
    if not _is_truthy(values.get("possui_alambrado")):
        return 0.0

    sistema = values.get("sistema_alambrado")
    if sistema == "especial":
        total = 0.0
        for lado in _ALAMBRADO_LADOS:
            try:
                c = float(values.get(f"comprimento_alambrado_{lado}") or 0)
                h = float(values.get(f"altura_alambrado_{lado}") or 0)
                total += c * h
            except (TypeError, ValueError):
                pass
        return total

    try:
        c_lat = float(values.get("comprimento_alambrado_laterais") or 0)
        h_lat = float(values.get("altura_alambrado_laterais") or 0)
        c_fun = float(values.get("comprimento_alambrado_fundos") or 0)
        h_fun = float(values.get("altura_alambrado_fundos") or 0)
        return c_lat * h_lat + c_fun * h_fun
    except (TypeError, ValueError):
        return 0.0


def _group_quantity(values: dict) -> float:
    try:
        return float(values.get("_quantity") or 1)
    except (TypeError, ValueError):
        return 1.0


# ── factories ────────────────────────────────────────────────────────────────

def alambrado_item(
    *,
    id: str = "alambrado",
    unidade: str = "m²",
    qtde_resolver=_area_alambrado,
) -> InvestItem:
    return InvestItem(
        id=id,
        descricao_runs=[
            TextRun(
                text=(
                    "Alambrado – Sistema {{sistema_alambrado}}, "
                    "tubos galvanizados {{galvanizacao}}, "
                    "tela revestida em PVC {{cor_tela_malha}}, {{travamento_descricao}}"
                ),
            ),
        ],
        unidade=unidade,
        qtde_resolver=qtde_resolver,
        applies_when=lambda v: _is_truthy(v.get("possui_alambrado")),
    )


def iluminacao_item(
    *,
    id: str = "iluminacao",
    unidade: str = "Conjunto",
    qtde_resolver=lambda v: 1.0,
    incluir_postes: bool = True,
) -> InvestItem:
    if incluir_postes:
        text = (
            "Iluminação – {{quantidade_projetores}} projetores em Led "
            "{{potencia_projetores}}W, {{quantidade_postes_iluminacao}} "
            "postes galvanizados com altura de {{altura_postes_iluminacao}}m"
        )
    else:
        text = (
            "Iluminação – {{quantidade_projetores}} projetores em Led "
            "{{potencia_projetores}}W"
        )
    return InvestItem(
        id=id,
        descricao_runs=[TextRun(text=text)],
        unidade=unidade,
        qtde_resolver=qtde_resolver,
        applies_when=lambda v: _is_truthy(v.get("possui_iluminacao")),
    )


def tela_superior_item(*, id: str = "tela_superior") -> InvestItem:
    return InvestItem(
        id=id,
        descricao_runs=[
            TextRun(
                text=(
                    "Tela superior – PVC cor {{cor_tela_superior}}, "
                    "fixada em estrutura metálica"
                ),
            ),
        ],
        unidade="m²",
        qtde_resolver=_area_total,
        applies_when=lambda v: _is_truthy(v.get("possui_tela_superior")),
    )


def tela_sombreamento_item(*, id: str = "tela_sombreamento") -> InvestItem:
    return InvestItem(
        id=id,
        descricao_runs=[
            TextRun(
                text=(
                    "Tela de sombreamento – monofilamento de polietileno "
                    "(sombreamento 80%)"
                ),
            ),
        ],
        unidade="m²",
        qtde_resolver=_area_total,
        applies_when=lambda v: _is_truthy(v.get("possui_tela_sombreamento")),
    )
