using PropostaComercialApi.Models;

namespace PropostaComercialApi.Repositories;

public interface IProposalRepository
{
    Task<Proposal?> GetByIdAsync(Guid id);
    Task<IEnumerable<Proposal>> ListAsync(string? createdByUserId = null, string? status = null, int page = 1, int pageSize = 20);
    Task<Guid> CreateAsync(Proposal proposal);
    Task UpdateAsync(Proposal proposal);
    Task<bool> UpdateGeneratedOutputsAsync(Guid id, string? pptxUrl, string? xlsxUrl);
    Task<bool> DeleteAsync(Guid id, string? createdByUserId);
}
