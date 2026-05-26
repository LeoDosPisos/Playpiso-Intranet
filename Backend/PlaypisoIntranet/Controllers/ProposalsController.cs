using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PlaypisoIntranet.DTOs;
using PlaypisoIntranet.Infrastructure;
using PlaypisoIntranet.Models;
using PlaypisoIntranet.Repositories;
using PlaypisoIntranet.Services;

namespace PlaypisoIntranet.Controllers;

[ApiController]
[Route("api/proposals")]
[Authorize(Policy = "AllowedUsers")]
public class ProposalsController(
    IProposalRepository repo,
    PptxGeneratorClient pptxClient,
    IOptions<AllowedUsersOptions> allowedUsersOptions) : ControllerBase
{
    private string UserId => User.FindFirstValue("oid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
    private string? UserEmail => User.FindFirstValue("email")
        ?? User.FindFirstValue("preferred_username")
        ?? User.FindFirstValue("upn")
        ?? User.FindFirstValue("unique_name");
    private string? UserName => User.FindFirstValue("name") ?? UserEmail;
    private bool IsAdmin => allowedUsersOptions.Value.AdminObjectIds.Contains(UserId);

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? status, [FromQuery] string? scope, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        string? userFilter;
        switch (scope)
        {
            case "mine":
                userFilter = UserId;
                break;
            case "all":
                if (!IsAdmin) return Forbid();
                userFilter = null;
                break;
            default:
                userFilter = IsAdmin ? null : UserId;
                break;
        }

        var proposals = await repo.ListAsync(userFilter, status, page, pageSize);
        var result = proposals.Select(p => new ProposalSummaryResponse(
            p.Id, p.NumeroProposta, p.Status,
            p.NomeRazaoSocial, p.Cidade, p.Estado,
            p.DataSolicitacao, p.DataEnvio,
            p.PptxUrl, p.XlsxUrl,
            p.CreatedByEmail ?? "",
            p.CreatedByName,
            p.GeneratedByUserId, p.GeneratedByEmail, p.GeneratedByName, p.GeneratedAt,
            p.CreatedAt,
            p.TotalProducts
        ));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var p = await repo.GetByIdAsync(id);
        if (p is null) return NotFound();
        if (!IsAdmin && p.CreatedByUserId != UserId) return Forbid();

        return Ok(ToDetailResponse(p));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProposalDto dto)
    {
        var proposal = MapToModel(dto);
        proposal.CreatedByUserId = UserId;
        proposal.CreatedByEmail = UserEmail;
        proposal.CreatedByName = UserName;

        var id = await repo.CreateAsync(proposal);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateProposalDto dto)
    {
        var existing = await repo.GetByIdAsync(id);
        if (existing is null) return NotFound();
        if (!IsAdmin && existing.CreatedByUserId != UserId) return Forbid();
        if (existing.Status != "rascunho") return Conflict(new { error = "Apenas rascunhos podem ser editados." });

        var proposal = MapToModel(dto);
        proposal.Id = id;
        proposal.CreatedByUserId = existing.CreatedByUserId;
        proposal.CreatedByEmail = existing.CreatedByEmail;

        await repo.UpdateAsync(proposal);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await repo.DeleteAsync(id, IsAdmin ? null : UserId);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{id:guid}/generate")]
    public async Task<IActionResult> Generate(Guid id, [FromBody] object pptxPayload)
    {
        var existing = await repo.GetByIdAsync(id);
        if (existing is null) return NotFound();
        if (!IsAdmin && existing.CreatedByUserId != UserId) return Forbid();

        byte[] pptxBytes;
        try
        {
            pptxBytes = await pptxClient.GenerateAsync(pptxPayload);
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(502, new { error = "Erro ao chamar o gerador de proposta.", detail = ex.Message });
        }

        // armazena o arquivo PPTX e obtém a URL
        // por ora, salva localmente e retorna o conteudo direto para o cliente
        var filename = $"proposta_{existing.NumeroProposta}_{DateTime.UtcNow:yyyyMMddHHmmss}.pptx";
        var pptxUrl = $"/files/{filename}";
        await repo.UpdateGeneratedOutputsAsync(id, pptxUrl, xlsxUrl: null, UserId, UserEmail, UserName);

        return File(pptxBytes, "application/vnd.openxmlformats-officedocument.presentationml.presentation", filename);
    }

    private static Proposal MapToModel(CreateProposalDto dto) => new()
    {
        NumeroProposta = dto.NumeroProposta,
        Status = "rascunho",
        DataSolicitacao = dto.DataSolicitacao,
        DataEnvio = dto.DataEnvio,
        NomeRazaoSocial = dto.NomeRazaoSocial,
        CpfCnpj = dto.CpfCnpj,
        NomeContato = dto.NomeContato,
        Telefone = dto.Telefone,
        EmailCliente = dto.EmailCliente,
        EnderecoCliente = dto.EnderecoCliente,
        LocalObra = dto.LocalObra,
        Cidade = dto.Cidade,
        Estado = dto.Estado,
        TipoProjeto = dto.TipoProjeto,
        ProductGroups = (dto.ProductGroups ?? []).Select((g, i) => new ProposalProductGroup
        {
            ProductId = g.ProductId,
            VariantId = g.VariantId,
            Quantity = g.Quantity,
            GroupIndex = g.GroupIndex,
            Largura = g.Largura,
            Comprimento = g.Comprimento,
            AreaTotal = g.AreaTotal,
            TipoTerreno = g.TipoTerreno,
            DificuldadeAcesso = g.DificuldadeAcesso,
            ResponsavelMaterialPedreira = g.ResponsavelMaterialPedreira,
            PossuiIluminacao = g.PossuiIluminacao,
            IluminacaoFixadaAlambrado = g.IluminacaoFixadaAlambrado,
            QuantidadePostesIluminacao = g.QuantidadePostesIluminacao,
            AlturaPostesIluminacao = g.AlturaPostesIluminacao,
            QuantidadeProjetores = g.QuantidadeProjetores,
            PotenciaProjetores = g.PotenciaProjetores,
            EspecificarPotenciaProjetores = g.EspecificarPotenciaProjetores,
            QuantidadeCruzetas = g.QuantidadeCruzetas,
            ResponsavelLigacaoEletrica = g.ResponsavelLigacaoEletrica ?? "cliente",
            TipoColigacao = g.TipoColigacao,
            PossuiAlambrado = g.PossuiAlambrado,
            Galvanizacao = g.Galvanizacao,
            EspecificarGalvanizacao = g.EspecificarGalvanizacao,
            PossuiTrelica = g.PossuiTrelica,
            Travamento = g.Travamento,
            QuantidadePortoes = g.QuantidadePortoes,
            AlturaPortoes = g.AlturaPortoes,
            ComprimentoPortoes = g.ComprimentoPortoes,
            PossuiTelaSuperior = g.PossuiTelaSuperior,
            PossuiTelaSombreamento = g.PossuiTelaSombreamento,
            AlturaSombreamento = g.AlturaSombreamento,
            ComprimentoSombreamento = g.ComprimentoSombreamento,
            Observacoes = g.Observacoes,
            Specs = g.Specs is not null ? JsonSerializer.Serialize(g.Specs) : "{}"
        }).ToList()
    };

    private static ProposalDetailResponse ToDetailResponse(Proposal p) => new(
        p.Id, p.NumeroProposta, p.Status,
        p.DataSolicitacao, p.DataEnvio,
        p.NomeRazaoSocial, p.CpfCnpj, p.NomeContato, p.Telefone, p.EmailCliente,
        p.EnderecoCliente, p.LocalObra, p.Cidade, p.Estado, p.TipoProjeto,
        p.PptxUrl, p.XlsxUrl,
        p.CreatedByUserId, p.CreatedByEmail, p.CreatedByName,
        p.GeneratedByUserId, p.GeneratedByEmail, p.GeneratedByName, p.GeneratedAt,
        p.CreatedAt, p.UpdatedAt,
        p.ProductGroups.Select(g => new ProductGroupResponse(
            g.Id, g.ProductId, g.VariantId, g.Quantity, g.GroupIndex,
            g.Largura, g.Comprimento, g.AreaTotal,
            g.TipoTerreno, g.DificuldadeAcesso, g.ResponsavelMaterialPedreira,
            g.PossuiIluminacao, g.IluminacaoFixadaAlambrado,
            g.QuantidadePostesIluminacao, g.AlturaPostesIluminacao,
            g.QuantidadeProjetores, g.PotenciaProjetores, g.EspecificarPotenciaProjetores,
            g.QuantidadeCruzetas, g.ResponsavelLigacaoEletrica, g.TipoColigacao,
            g.PossuiAlambrado, g.Galvanizacao, g.EspecificarGalvanizacao,
            g.PossuiTrelica, g.Travamento, g.QuantidadePortoes, g.AlturaPortoes, g.ComprimentoPortoes, g.PossuiTelaSuperior,
            g.PossuiTelaSombreamento, g.AlturaSombreamento, g.ComprimentoSombreamento,
            g.Observacoes, g.Specs
        ))
    );
}
