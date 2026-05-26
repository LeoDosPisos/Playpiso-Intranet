"""Testes unitários do catálogo de Investimento (quadra_poliesportiva)."""
import pytest

from investimento.catalog import get_items


BASE_VALUES = {
    "area_total": 260.66,
    "possui_volei": False,
    "possui_futebol_futsal": False,
    "possui_basquete_adulto": False,
    "possui_basquete_juvenil": False,
    "possui_alambrado": False,
    "possui_iluminacao": False,
    "possui_tela_superior": False,
    "possui_tela_sombreamento": False,
}


def _values(**overrides):
    return {**BASE_VALUES, **overrides}


class TestGetItemsBasico:
    def test_produto_nao_migrado_levanta_not_implemented(self):
        # Todos os produtos atuais foram migrados; usa um id inexistente para validar.
        with pytest.raises(NotImplementedError):
            get_items("produto_inexistente", "padrao", {})

    def test_quadra_poli_sem_acessorios_retorna_apenas_piso(self):
        items = get_items("quadra_poliesportiva", "assoalho", _values())
        assert [i.id for i in items] == ["piso_assoalho"]

    def test_variant_filter_assoalho_omite_outras_variantes(self):
        items = get_items("quadra_poliesportiva", "assoalho", _values())
        ids = [i.id for i in items]
        assert "piso_asfaltico" not in ids
        assert "piso_poliuretano" not in ids

    def test_variant_filter_piso_asfaltico(self):
        items = get_items("quadra_poliesportiva", "piso_asfaltico", _values())
        assert "piso_asfaltico" in [i.id for i in items]
        assert "piso_assoalho" not in [i.id for i in items]


class TestAcessoriosCondicionais:
    def test_volei_on_inclui_item(self):
        items = get_items(
            "quadra_poliesportiva", "assoalho",
            _values(possui_volei=True),
        )
        assert "aces_volei" in [i.id for i in items]

    def test_futsal_off_omite_item(self):
        items = get_items(
            "quadra_poliesportiva", "assoalho",
            _values(possui_futebol_futsal=False),
        )
        assert "aces_futsal" not in [i.id for i in items]

    def test_basquete_adulto_metalica_render_bold(self):
        items = get_items(
            "quadra_poliesportiva", "assoalho",
            _values(possui_basquete_adulto=True, estrutura_basquete_adulto="metalica"),
        )
        item = next(i for i in items if i.id == "aces_basquete_adulto")
        runs = item.resolve_runs(_values(
            possui_basquete_adulto=True,
            estrutura_basquete_adulto="metalica",
        ))
        bold_texts = [r.text for r in runs if r.bold]
        assert any("Metálica" in t for t in bold_texts)

    def test_truthy_string_true_funciona(self):
        # _is_truthy aceita "True" (string) — vem do form que serializa via str(v)
        items = get_items(
            "quadra_poliesportiva", "assoalho",
            _values(possui_volei="True"),
        )
        assert "aces_volei" in [i.id for i in items]


class TestQtdeResolver:
    def test_piso_usa_area_total(self):
        items = get_items("quadra_poliesportiva", "assoalho", _values(area_total=300.5))
        piso = next(i for i in items if i.id == "piso_assoalho")
        assert piso.qtde_resolver(_values(area_total=300.5)) == 300.5

    def test_acessorio_volei_qtde_fixa_1(self):
        items = get_items(
            "quadra_poliesportiva", "assoalho",
            _values(possui_volei=True),
        )
        volei = next(i for i in items if i.id == "aces_volei")
        assert volei.qtde_resolver({}) == 1.0


class TestFechamentos:
    def test_alambrado_e_iluminacao_independentes(self):
        items = get_items(
            "quadra_poliesportiva", "assoalho",
            _values(possui_alambrado=True, possui_iluminacao=False),
        )
        ids = [i.id for i in items]
        assert "alambrado" in ids
        assert "iluminacao" not in ids

    def test_telas_condicionais(self):
        items = get_items(
            "quadra_poliesportiva", "assoalho",
            _values(possui_tela_superior=True, possui_tela_sombreamento=True),
        )
        ids = [i.id for i in items]
        assert "tela_superior" in ids
        assert "tela_sombreamento" in ids


class TestQuadraTenisCatalogo:
    """Catálogo de quadra_tenis com 3 variantes."""

    BASE = {
        "area_total": 260.66,
        "possui_alambrado": False,
        "possui_iluminacao": False,
        "possui_playcushion": False,
        "possui_kit_saibro": False,
    }

    def test_piso_asfaltico_minimo_tem_piso_e_acessorio(self):
        items = get_items("quadra_tenis", "piso_asfaltico", self.BASE)
        ids = [i.id for i in items]
        assert ids == ["piso_asfaltico", "acessorio_tenis_asfaltico"]

    def test_saibro_minimo_tem_piso_e_acessorio(self):
        items = get_items("quadra_tenis", "saibro", self.BASE)
        ids = [i.id for i in items]
        assert ids == ["piso_saibro", "acessorio_tenis_saibro"]

    def test_grama_natural_minimo_tem_piso_e_acessorio(self):
        items = get_items("quadra_tenis", "grama_natural", self.BASE)
        ids = [i.id for i in items]
        assert ids == ["piso_grama_natural", "acessorio_tenis_grama"]

    def test_playcushion_so_aparece_no_piso_asfaltico(self):
        values = {**self.BASE, "possui_playcushion": True}
        ids_asfaltico = [i.id for i in get_items("quadra_tenis", "piso_asfaltico", values)]
        ids_saibro    = [i.id for i in get_items("quadra_tenis", "saibro", values)]
        ids_grama     = [i.id for i in get_items("quadra_tenis", "grama_natural", values)]
        assert "playcushion" in ids_asfaltico
        assert "playcushion" not in ids_saibro
        assert "playcushion" not in ids_grama

    def test_kit_saibro_so_aparece_no_saibro(self):
        values = {**self.BASE, "possui_kit_saibro": True}
        ids = [i.id for i in get_items("quadra_tenis", "saibro", values)]
        assert "kit_saibro" in ids
        # piso_asfaltico não deve ter kit_saibro nem quando ligado
        ids2 = [i.id for i in get_items("quadra_tenis", "piso_asfaltico", values)]
        assert "kit_saibro" not in ids2

    def test_alambrado_e_iluminacao_compartilhados(self):
        values = {**self.BASE, "possui_alambrado": True, "possui_iluminacao": True}
        ids = [i.id for i in get_items("quadra_tenis", "piso_asfaltico", values)]
        assert "alambrado" in ids
        assert "iluminacao" in ids

    def test_telas_condicionais(self):
        values = {
            **self.BASE,
            "possui_tela_superior": True,
            "possui_tela_sombreamento": True,
        }
        ids = [i.id for i in get_items("quadra_tenis", "piso_asfaltico", values)]
        assert "tela_superior" in ids
        assert "tela_sombreamento" in ids

    def test_grama_natural_completo(self):
        values = {
            **self.BASE,
            "possui_alambrado": True,
            "possui_iluminacao": True,
            "possui_kit_saibro": True,      # ignorado: filtra fora desta variante
            "possui_playcushion": True,     # ignorado: filtra fora
        }
        ids = [i.id for i in get_items("quadra_tenis", "grama_natural", values)]
        assert ids == [
            "piso_grama_natural",
            "acessorio_tenis_grama",
            "alambrado",
            "iluminacao",
        ]


class TestPadelCatalogo:
    """Catálogo de padel (1 variante grama_sintetica)."""

    BASE = {"area_total": 200.0}

    def test_padel_minimo_tem_piso_e_estrutura_sem_acessorio(self):
        items = get_items("padel", "grama_sintetica", self.BASE)
        ids = [i.id for i in items]
        assert ids == ["piso_grama_sintetica", "estrutura_vidro_iluminacao"]

    def test_acessorio_aparece_quando_toggle_ligado(self):
        values = {**self.BASE, "possui_acessorio_padel": True}
        ids = [i.id for i in get_items("padel", "grama_sintetica", values)]
        assert "acessorio_padel" in ids

    def test_acessorio_omitido_quando_toggle_desligado(self):
        values = {**self.BASE, "possui_acessorio_padel": False}
        ids = [i.id for i in get_items("padel", "grama_sintetica", values)]
        assert "acessorio_padel" not in ids

    def test_estrutura_sempre_presente(self):
        # padel não tem toggle de alambrado — estrutura é obrigatória
        items = get_items("padel", "grama_sintetica", self.BASE)
        ids = [i.id for i in items]
        assert "estrutura_vidro_iluminacao" in ids


class TestSoftplayCatalogo:
    """Catálogo softplay (1 variante padrao, 1 item)."""

    BASE = {"area_total": 50.0, "espessura_sbr": 3, "espessura_epdm": 1}

    def test_softplay_tem_apenas_um_item(self):
        items = get_items("softplay", "padrao", self.BASE)
        assert [i.id for i in items] == ["piso_softplay"]

    def test_espessura_total_eh_sbr_mais_epdm(self):
        items = get_items("softplay", "padrao", self.BASE)
        runs = items[0].resolve_runs(self.BASE)
        text = runs[0].text
        assert "Espessura final: 4cm" in text

    def test_espessura_zero_se_campos_ausentes(self):
        items = get_items("softplay", "padrao", {"area_total": 50.0})
        runs = items[0].resolve_runs({"area_total": 50.0})
        assert "0cm" in runs[0].text


class TestPickleballCatalogo:
    """Catálogo pickleball (1 variante padrao, 3 itens compactos)."""

    BASE = {"area_total": 80.0, "possui_alambrado": False, "possui_iluminacao": False}

    def test_minimo_so_piso(self):
        items = get_items("pickleball", "padrao", self.BASE)
        assert [i.id for i in items] == ["piso_pickleball"]

    def test_com_alambrado_e_iluminacao(self):
        values = {**self.BASE, "possui_alambrado": True, "possui_iluminacao": True}
        ids = [i.id for i in get_items("pickleball", "padrao", values)]
        assert ids == ["piso_pickleball", "alambrado", "iluminacao"]

    def test_alambrado_unidade_eh_M2_maiuscula(self):
        values = {**self.BASE, "possui_alambrado": True}
        items = get_items("pickleball", "padrao", values)
        alambrado = next(i for i in items if i.id == "alambrado")
        assert alambrado.unidade == "M²"


class TestBeachTenisCatalogo:
    """Catálogo beach_tenis (1 variante padrao, 5 itens com EVA opcional)."""

    BASE = {
        "area_total": 78.0,
        "largura": 6.0,
        "comprimento": 13.0,
        "possui_alambrado": False,
        "possui_iluminacao": False,
        "possui_eva": False,
    }

    def test_minimo_tem_piso_e_acessorio(self):
        ids = [i.id for i in get_items("beach_tenis", "padrao", self.BASE)]
        assert ids == ["piso_beach_tenis", "acessorio_beach_tenis"]

    def test_eva_condicional(self):
        values = {**self.BASE, "possui_eva": True}
        ids = [i.id for i in get_items("beach_tenis", "padrao", values)]
        assert "protecao_eva" in ids

    def test_eva_omitido_quando_desligado(self):
        ids = [i.id for i in get_items("beach_tenis", "padrao", self.BASE)]
        assert "protecao_eva" not in ids

    def test_completo_com_tudo_ligado(self):
        values = {**self.BASE, "possui_alambrado": True, "possui_iluminacao": True, "possui_eva": True}
        ids = [i.id for i in get_items("beach_tenis", "padrao", values)]
        # Ordem: piso, alambrado, iluminacao, acessorio, eva
        assert ids == ["piso_beach_tenis", "alambrado", "iluminacao", "acessorio_beach_tenis", "protecao_eva"]


class TestCenarioCompleto:
    def test_quadra_poli_assoalho_com_3_esportes_alambrado_iluminacao(self):
        items = get_items(
            "quadra_poliesportiva", "assoalho",
            _values(
                possui_volei=True,
                possui_futebol_futsal=True,
                possui_basquete_adulto=True,
                estrutura_basquete_adulto="metalica",
                possui_alambrado=True,
                possui_iluminacao=True,
            ),
        )
        ids = [i.id for i in items]
        assert ids == [
            "piso_assoalho",
            "aces_volei",
            "aces_futsal",
            "aces_basquete_adulto",
            "alambrado",
            "iluminacao",
        ]
