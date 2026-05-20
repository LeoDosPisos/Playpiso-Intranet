from datetime import datetime

_GALVANIZACAO_LABELS = {'fogo': 'a fogo', 'eletrolitico': 'eletroliticamente'}

_SISTEMA_ALAMBRADO_LABELS = {'gaiola': 'Gaiola', 'trapezio': 'Trapézio'}

_ILUMINACAO_FALLBACK_KEYS = (
    'quantidade_projetores', 'potencia_projetores',
    'quantidade_postes_iluminacao', 'altura_postes_iluminacao',
    'quantidade_cruzetas',
)

_ESTRUTURA_BASQUETE_LABELS = {'metalica': 'Metálica', 'hidraulica': 'Hidráulica', 'comum': 'Comum'}

_TRAVAMENTO_ORDER = ['travamento_superior', 'travamento_intermediario', 'travamento_inferior']
_TRAVAMENTO_LABELS = {
    'travamento_superior':      'superior',
    'travamento_intermediario': 'intermediário',
    'travamento_inferior':      'inferior',
}


def _is_truthy(value) -> bool:
    """Normaliza valores que podem vir como bool, str ou None do contexto.

    Necessário porque _build_group_context converte tudo com str(v), então
    False vira "False" (string truthy).
    """
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('true', '1', 'yes')
    return bool(value)


def _fmt_date(iso: str) -> str:
    try:
        return datetime.strptime(iso, "%Y-%m-%d").strftime("%d/%m/%Y")
    except (ValueError, TypeError):
        return iso or ""


def _fmt_dimension(value) -> str:
    try:
        return f"{float(value):.2f}".replace('.', ',') + 'm'
    except (ValueError, TypeError):
        return "—"


def _fmt_numero(value) -> str:
    try:
        return f"{float(value):.2f}".replace('.', ',')
    except (ValueError, TypeError):
        return "—"


def _fmt_alambrado_descricao(values: dict) -> str:
    sistema = values.get('sistema_alambrado', '')
    h_fun = values.get('altura_alambrado_fundos')
    h_lat = values.get('altura_alambrado_laterais')
    if sistema == 'trapezio' and h_fun is not None and h_lat is not None:
        return (
            f"Sistema trapézio: alambrado com fundo de {_fmt_dimension(h_fun)}m"
            f" e corrimão (altura de 1,00m) conectando as laterais de {_fmt_dimension(h_lat)}m;"
        )
    if sistema == 'gaiola' and h_fun is not None:
        return f"Sistema gaiola: alambrado com fundo e laterais de {_fmt_dimension(h_fun)}m;"
    return '—'


def _fmt_travamento(value) -> str:
    if isinstance(value, list):
        items = value
    elif isinstance(value, str) and value:
        items = [t.strip() for t in value.split(',')]
    else:
        return 'Sem travamento'

    selected = [t for t in _TRAVAMENTO_ORDER if t in items]
    if not selected or selected == ['sem_travamento'] or items == ['sem_travamento']:
        return 'Sem travamento'

    labels = [_TRAVAMENTO_LABELS[t] for t in selected]
    if len(labels) == 1:
        return f'Instalação de travamento {labels[0]}'
    return f'Instalação de travamento {", ".join(labels[:-1])} e {labels[-1]}'


def _build_base_context(global_values: dict, product_groups: list) -> dict:
    return {
        "nome_razao_social": global_values.get("nome_razao_social", ""),
        "nome_contato":      global_values.get("nome_contato", ""),
        "endereco_obra":     global_values.get("endereco_obra", ""),
        "local_obra":        global_values.get("local_obra", ""),
        "telefone":          global_values.get("telefone", ""),
        "email":             global_values.get("email", ""),
        "numero_proposta":   global_values.get("numero_proposta", ""),
        "data_solicitacao":  _fmt_date(global_values.get("data_solicitacao", "")),
        "data_envio":        _fmt_date(global_values.get("data_envio", "")),
        "sumario":           (
            product_groups[0].sumarioText
            if len(product_groups) == 1
            else "\n".join(f"{i + 1}. {g.sumarioText}" for i, g in enumerate(product_groups))
        ),
    }


def _build_group_context(group) -> dict:
    ctx: dict = {}
    values = group.values or {}

    ctx.update({k: str(v) if v is not None else "" for k, v in values.items()})

    if ctx.get('potencia_projetores') == 'outro':
        ctx['potencia_projetores'] = ctx.get('especificar_potencia_projetores') or '—'

    galv = ctx.get('galvanizacao', '')
    if galv in _GALVANIZACAO_LABELS:
        ctx['galvanizacao'] = _GALVANIZACAO_LABELS[galv]
    elif galv == 'outro':
        ctx['galvanizacao'] = ctx.get('especificar_galvanizacao') or '—'

    altura = values.get('altura_portoes')
    largura = values.get('largura_portoes')
    qtd = values.get('quantidade_portoes', 0)
    if qtd and altura is not None and largura is not None:
        ctx['dimensoes_portoes'] = f"{_fmt_dimension(altura)} x {_fmt_dimension(largura)}"
    else:
        ctx['dimensoes_portoes'] = "—"

    ctx['travamento_descricao'] = _fmt_travamento(values.get('travamento'))
    ctx['alambrado_descricao'] = _fmt_alambrado_descricao(values)
    ctx['descricao_alambrado'] = ctx['alambrado_descricao']

    ctx['quantity']       = _fmt_numero(group.quantity)
    ctx['area_total_fmt'] = _fmt_numero(values.get('area_total'))

    if values.get('possui_alambrado'):
        c_lat = values.get('comprimento_alambrado_laterais')
        h_lat = values.get('altura_alambrado_laterais')
        c_fun = values.get('comprimento_alambrado_fundos')
        h_fun = values.get('altura_alambrado_fundos')
        try:
            area = float(c_lat or 0) * float(h_lat or 0) + float(c_fun or 0) * float(h_fun or 0)
            ctx['area_alambrado'] = _fmt_numero(area) if area else '—'
        except (TypeError, ValueError):
            ctx['area_alambrado'] = '—'
    else:
        ctx['area_alambrado'] = '—'

    ctx['qtde_iluminacao'] = '1,00' if values.get('possui_iluminacao') else '—'
    ctx['area_playcushion'] = (
        _fmt_numero(values.get('area_total')) if values.get('possui_playcushion') else '—'
    )

    ctx['area_fmt']           = ctx.get('area_total_fmt', '—')
    ctx['area_tela_superior'] = ctx.get('area_total_fmt', '—')
    ctx['kit_saibro']         = '1,00' if values.get('possui_kit_saibro') else '—'

    raw_sistema = values.get('sistema_alambrado', '')
    if raw_sistema:
        ctx['sistema_alambrado'] = _SISTEMA_ALAMBRADO_LABELS.get(raw_sistema, raw_sistema)
    else:
        ctx['sistema_alambrado'] = '—'
    ctx['sistema_alabrado'] = ctx['sistema_alambrado']

    if not ctx.get('galvanizacao'):
        ctx['galvanizacao'] = '—'

    for _k in _ILUMINACAO_FALLBACK_KEYS:
        if not ctx.get(_k):
            ctx[_k] = '—'

    if group.productId == 'quadra_poliesportiva':
        _sports: list[str] = []
        if values.get('possui_basquete_adulto'):
            _est = str(values.get('estrutura_basquete_adulto', ''))
            _lbl = _ESTRUTURA_BASQUETE_LABELS.get(_est, _est)
            _sports.append(f'Basquete Adulto ({_lbl})' if _lbl else 'Basquete Adulto')
        if values.get('possui_basquete_juvenil'):
            _sports.append('Basquete Juvenil')
        if values.get('possui_volei'):
            _sports.append('Vôlei')
        if values.get('possui_futebol_futsal'):
            _sports.append('Futebol/Futsal')
        ctx['acessorios_esportivos_descricao'] = f'Acessórios – {", ".join(_sports)}' if _sports else '—'
        ctx['qtde_acessorios_esportivos'] = _fmt_numero(len(_sports)) if _sports else '—'

    ctx['qtde_tela_superior'] = '1,00' if values.get('possui_tela_superior') else '—'
    if not ctx.get('cor_tela_superior'):
        ctx['cor_tela_superior'] = '—'

    if values.get('possui_eva'):
        try:
            ctx['qtde_eva'] = _fmt_numero(
                2 * (float(values.get('largura', 0)) + float(values.get('comprimento', 0)))
            )
        except (TypeError, ValueError):
            ctx['qtde_eva'] = '1,00'
    else:
        ctx['qtde_eva'] = '—'

    return ctx


def _build_context(global_values: dict, product_groups: list) -> dict:
    """Legacy flat context for the slideIds format. Merges all groups (last wins)."""
    ctx = _build_base_context(global_values, product_groups)
    for group in product_groups:
        ctx.update(_build_group_context(group))
    return ctx
