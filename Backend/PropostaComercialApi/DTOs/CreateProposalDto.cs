using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PropostaComercialApi.DTOs;

public record CreateProposalDto(
    [Required] string NumeroProposta,
    DateOnly? DataSolicitacao,
    DateOnly? DataEnvio,

    [Required] string NomeRazaoSocial,
    string? CpfCnpj,
    string? NomeContato,
    string? Telefone,
    string? Email,

    [Required] string EnderecoObra,
    [Required] string Cidade,
    [Required] string Estado,
    [Required] string TipoProjeto,

    IEnumerable<CreateProductGroupDto> ProductGroups
);

public class CreateProductGroupDto
{
    [Required] public string ProductId { get; init; } = default!;
    [Required] public string VariantId { get; init; } = default!;
    public int Quantity { get; init; }
    public int GroupIndex { get; init; }

    public decimal? Largura { get; init; }
    public decimal? Comprimento { get; init; }
    public decimal? AreaTotal { get; init; }

    public string? TipoTerreno { get; init; }
    public string? DificuldadeAcesso { get; init; }
    public string? ResponsavelMaterialPedreira { get; init; }

    public bool PossuiIluminacao { get; init; }
    public bool? IluminacaoFixadaAlambrado { get; init; }
    public int? QuantidadePostesIluminacao { get; init; }
    public decimal? AlturaPostesIluminacao { get; init; }
    public int? QuantidadeProjetores { get; init; }
    public string? PotenciaProjetores { get; init; }
    public string? EspecificarPotenciaProjetores { get; init; }
    public int? QuantidadeCruzetas { get; init; }
    public string? ResponsavelLigacaoEletrica { get; init; }
    public string? TipoColigacao { get; init; }

    public bool PossuiAlambrado { get; init; }
    public decimal? ComprimentoAlambrado { get; init; }
    public decimal? AlturaAlambrado { get; init; }
    public decimal? EspacamentoPostesTubos { get; init; }
    public string? Galvanizacao { get; init; }
    public string? EspecificarGalvanizacao { get; init; }
    public bool? PossuiTrelica { get; init; }
    public string? Travamento { get; init; }
    public bool? PossuiTelaSuperior { get; init; }
    public bool? PossuiTelaSombreamento { get; init; }
    public decimal? LarguraSombreamento { get; init; }
    public decimal? ComprimentoSombreamento { get; init; }

    public string? Observacoes { get; init; }

    // campos especificos por produto/variante (JSON livre)
    [JsonExtensionData] public Dictionary<string, object?>? Specs { get; init; }
}
