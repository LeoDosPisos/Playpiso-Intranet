"""Catálogo de Investimento — beach_tenis (1 variante: padrao).

5 itens possíveis: piso, alambrado, iluminação, acessório, proteção EVA opcional.
Textos literais dos templates atuais (slides/beach_tenis/investimento.pptx).

Observação: o item de iluminação no template antigo NÃO começa com 'Iluminação –'
(começa direto com '{{quantidade_projetores}} projetores ...'). Mantido literal.
"""
from pptx.dml.color import RGBColor

from context_builder import _is_truthy

from ..catalog import InvestItem, TextRun
from . import _common


# Vermelho do "Piso oficial da CBT..." na descrição do piso de beach tênis.
_VERMELHO = RGBColor(0xFF, 0x00, 0x00)


def _qtde_eva_perimetro(values: dict) -> float:
    """Perímetro da quadra: 2 * (largura + comprimento). Replica context_builder.py:258-266."""
    try:
        largura = float(values.get("largura") or 0)
        comprimento = float(values.get("comprimento") or 0)
        return 2 * (largura + comprimento)
    except (TypeError, ValueError):
        return 0.0


def _descricao_piso_beach_tenis(values: dict) -> list[TextRun]:
    """Descrição do piso de beach tênis (slide investimento).

    A linha da areia varia conforme `tipo_areia`:
      - 'rio'     → "areia de rio Lavada"
      - 'quartzo' → "areia de quartzo especial tratada"
      - outro/ausente → texto antigo (ambas variantes ligadas por "ou"), preservando
        o comportamento atual para entradas inesperadas.

    "Piso oficial da CBT..." sai sempre em parágrafo separado e em vermelho (#ff0000).
    """
    tipo = str(values.get("tipo_areia") or "").lower()
    if tipo == "rio":
        meio = "areia de rio Lavada"
    elif tipo == "quartzo":
        meio = "areia de quartzo especial tratada"
    else:
        meio = "areia de quartzo especial tratada ou areia de rio Lavada"
    primeiro = f"Quadra de Beach Tennis – Sistema de drenagem, mureta e {meio}"
    segundo = "Piso oficial da CBT – Confederação Brasileira de Tênis e Beach Tennis"
    # O "\n" no início do segundo TextRun faz o builder iniciar um novo parágrafo
    # (investimento/builder.py:266); a cor vermelha é preservada por _with_default_size.
    return [
        TextRun(text=primeiro),
        TextRun(text=f"\n{segundo}", color=_VERMELHO),
    ]


ITEMS: list[InvestItem] = [
    InvestItem(
        id="piso_beach_tenis",
        descricao_runs=[],  # gerado dinamicamente — ver _descricao_piso_beach_tenis
        descricao_resolver=_descricao_piso_beach_tenis,
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
