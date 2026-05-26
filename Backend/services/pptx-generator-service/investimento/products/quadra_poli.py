from pptx.dml.color import RGBColor

from context_builder import _is_truthy

from ..catalog import InvestItem, TextRun
from . import _common

VERMELHO = RGBColor(0xFF, 0x00, 0x00)

_ESTRUTURA_BASQUETE_LABELS = {
    "metalica":   "Metálica",
    "hidraulica": "Hidráulica",
    "comum":      "Comum",
}


def _basquete_adulto_runs(values: dict) -> list[TextRun]:
    estrutura_raw = str(values.get("estrutura_basquete_adulto") or "")
    estrutura = _ESTRUTURA_BASQUETE_LABELS.get(estrutura_raw, estrutura_raw or "Comum")
    return [
        TextRun(text="Acessórios – "),
        TextRun(text=f"Basquete Adulto ({estrutura})", bold=True),
        TextRun(text=": Estrutura galvanizada a fogo, tabela acrílica e rede"),
    ]


def _poliuretano_runs(values: dict) -> list[TextRun]:
    raw = str(values.get("tipo_poliuretano") or "")
    espessura = raw[1:] if raw.startswith("b") and raw[1:].isdigit() else raw
    sufixo = f" {espessura}mm" if espessura else ""
    return [
        TextRun(text=f"Piso – Quadra Poliesportiva – Poliuretano{sufixo}"),
        TextRun(text="\nDemarcações inclusas", color=VERMELHO),
    ]


ITEMS: list[InvestItem] = [
    # ── Piso por variante ────────────────────────────────────────────────────
    InvestItem(
        id="piso_assoalho",
        descricao_runs=[
            TextRun(text="Piso – Assoalho Flutuante Grápia"),
            TextRun(text="\nDemarcações inclusas", color=VERMELHO),
        ],
        unidade="m²",
        qtde_resolver=_common._area_total,
        variant_filter={"assoalho"},
    ),
    InvestItem(
        id="piso_asfaltico",
        descricao_runs=[
            TextRun(text="Piso – Quadra Poliesportiva – Base Asfáltica"),
            TextRun(text="\nDemarcações inclusas", color=VERMELHO),
        ],
        unidade="m²",
        qtde_resolver=_common._area_total,
        variant_filter={"piso_asfaltico"},
    ),
    InvestItem(
        id="piso_poliuretano",
        descricao_runs=[],
        descricao_resolver=_poliuretano_runs,
        unidade="m²",
        qtde_resolver=_common._area_total,
        variant_filter={"poliuretano"},
    ),
    # ── Acessórios esportivos (condicionais) ─────────────────────────────────
    InvestItem(
        id="aces_volei",
        descricao_runs=[
            TextRun(text="Acessórios – "),
            TextRun(text="Vôlei", bold=True),
            TextRun(text=": Postes galvanizados a fogo, cabo tensor e rede"),
        ],
        unidade="Conjunto",
        qtde_resolver=lambda v: 1.0,
        applies_when=lambda v: _is_truthy(v.get("possui_volei")),
    ),
    InvestItem(
        id="aces_futsal",
        descricao_runs=[
            TextRun(text="Acessórios – "),
            TextRun(text="Futsal", bold=True),
            TextRun(text=": Traves galvanizadas a fogo e rede"),
        ],
        unidade="Par",
        qtde_resolver=lambda v: 1.0,
        applies_when=lambda v: _is_truthy(v.get("possui_futebol_futsal")),
    ),
    InvestItem(
        id="aces_basquete_adulto",
        descricao_runs=[],
        descricao_resolver=_basquete_adulto_runs,
        unidade="Par",
        qtde_resolver=lambda v: 1.0,
        applies_when=lambda v: _is_truthy(v.get("possui_basquete_adulto")),
    ),
    InvestItem(
        id="aces_basquete_juvenil",
        descricao_runs=[
            TextRun(text="Acessórios – "),
            TextRun(text="Basquete Juvenil", bold=True),
            TextRun(text=": Estrutura galvanizada a fogo, tabela acrílica e rede"),
        ],
        unidade="Par",
        qtde_resolver=lambda v: 1.0,
        applies_when=lambda v: _is_truthy(v.get("possui_basquete_juvenil")),
    ),
    # ── Fechamentos / iluminação (condicionais, compartilhados em _common) ──
    _common.alambrado_item(unidade="Conjunto", qtde_resolver=lambda v: 1.0),
    _common.iluminacao_item(),
    _common.tela_superior_item(),
    _common.tela_sombreamento_item(),
]
