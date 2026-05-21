namespace PlaypisoIntranet.Models;

public class Proposal
{
    public Guid Id { get; set; }
    public string NumeroProposta { get; set; } = "";
    public string Status { get; set; } = "rascunho";

    public DateOnly? DataSolicitacao { get; set; }
    public DateOnly? DataEnvio { get; set; }

    public string NomeRazaoSocial { get; set; } = "";
    public string? CpfCnpj { get; set; }
    public string? NomeContato { get; set; }
    public string? Telefone { get; set; }
    public string? Email { get; set; }

    public string EnderecoObra { get; set; } = "";
    public string LocalObra { get; set; } = ""; 
    public string Cidade { get; set; } = "";
    public string Estado { get; set; } = "";
    public string TipoProjeto { get; set; } = "";

    public string? PptxUrl { get; set; }
    public string? XlsxUrl { get; set; }

    public string CreatedByUserId { get; set; } = "";
    public string? CreatedByEmail { get; set; }
    public string? GeneratedByUserId { get; set; }
    public string? GeneratedByEmail { get; set; }
    public DateTime? GeneratedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int TotalProducts { get; set; }

    public IEnumerable<ProposalProductGroup> ProductGroups { get; set; } = [];
}
