namespace PropostaComercialApi.Models;

public class ProposalProductGroup
{
    public Guid Id { get; set; }
    public Guid ProposalId { get; set; }

    public string ProductId { get; set; } = "";
    public string VariantId { get; set; } = "";
    public int Quantity { get; set; } = 1;
    public int GroupIndex { get; set; }

    // dimensoes
    public decimal? Largura { get; set; }
    public decimal? Comprimento { get; set; }
    public decimal? AreaTotal { get; set; }

    // condicoes_obra
    public string? TipoTerreno { get; set; }
    public string? DificuldadeAcesso { get; set; }
    public string? ResponsavelMaterialPedreira { get; set; }

    // iluminacao
    public bool PossuiIluminacao { get; set; }
    public bool? IluminacaoFixadaAlambrado { get; set; }
    public int? QuantidadePostesIluminacao { get; set; }
    public decimal? AlturaPostesIluminacao { get; set; }
    public int? QuantidadeProjetores { get; set; }
    public string? PotenciaProjetores { get; set; }
    public string? EspecificarPotenciaProjetores { get; set; }
    public int? QuantidadeCruzetas { get; set; }
    public string? ResponsavelLigacaoEletrica { get; set; } = "cliente";
    public string? TipoColigacao { get; set; }

    // fechamentos_protecoes
    public bool PossuiAlambrado { get; set; }
    public decimal? ComprimentoAlambrado { get; set; }
    public decimal? AlturaAlambrado { get; set; }
    public decimal? EspacamentoPostesTubos { get; set; }
    public string? Galvanizacao { get; set; }
    public string? EspecificarGalvanizacao { get; set; }
    public bool? PossuiTrelica { get; set; }
    public string? Travamento { get; set; }
    public bool? PossuiTelaSuperior { get; set; }
    public bool? PossuiTelaSombreamento { get; set; }
    public decimal? LarguraSombreamento { get; set; }
    public decimal? ComprimentoSombreamento { get; set; }

    public string? Observacoes { get; set; }

    // campos especificos por produto/variante (serializado como JSON)
    public string Specs { get; set; } = "{}";

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
