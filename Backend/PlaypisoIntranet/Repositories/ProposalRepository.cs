using Dapper;
using Npgsql;
using PlaypisoIntranet.Models;

namespace PlaypisoIntranet.Repositories;

public class ProposalRepository(string connectionString) : IProposalRepository
{
    private NpgsqlConnection Connect() => new(connectionString);

    private const string ProposalColumns = """
        id, numero_proposta, status,
        data_solicitacao, data_envio,
        nome_razao_social, cpf_cnpj, nome_contato, telefone, email_cliente,
        endereco_cliente, local_obra, cidade, estado, tipo_projeto,
        pptx_url, xlsx_url,
        created_by_user_id, created_by_email, created_by_name,
        generated_by_user_id, generated_by_email, generated_by_name, generated_at,
        created_at, updated_at
        """;

    private const string ProductGroupColumns = """
        id, proposal_id,
        product_id, variant_id, quantity, group_index,
        largura, comprimento, area_total,
        tipo_terreno, dificuldade_acesso, responsavel_material_pedreira,
        possui_iluminacao, iluminacao_fixada_alambrado, quantidade_postes_iluminacao,
        altura_postes_iluminacao, quantidade_projetores, potencia_projetores,
        especificar_potencia_projetores, quantidade_cruzetas,
        responsavel_ligacao_eletrica, tipo_coligacao,
        possui_alambrado, galvanizacao, especificar_galvanizacao,
        possui_trelica, travamento,
        possui_tela_superior, possui_tela_sombreamento,
        largura_sombreamento, comprimento_sombreamento,
        quantidade_portoes, altura_portoes, comprimento_portoes,
        observacoes, specs,
        created_at, updated_at
        """;

    public async Task<Proposal?> GetByIdAsync(Guid id)
    {
        using var conn = Connect();
        await conn.OpenAsync();

        var proposal = await conn.QuerySingleOrDefaultAsync<Proposal>(
            $"SELECT {ProposalColumns} FROM proposals WHERE id = @Id",
            new { Id = id });

        if (proposal is null) return null;

        var groups = await conn.QueryAsync<ProposalProductGroup>(
            $"SELECT {ProductGroupColumns} FROM proposal_product_groups WHERE proposal_id = @ProposalId ORDER BY group_index",
            new { ProposalId = id });

        proposal.ProductGroups = groups;
        return proposal;
    }

    public async Task<IEnumerable<Proposal>> ListAsync(string? createdByUserId = null, string? status = null, int page = 1, int pageSize = 20)
    {
        using var conn = Connect();
        await conn.OpenAsync();

        var where = new List<string>();
        if (createdByUserId is not null) where.Add("p.created_by_user_id = @CreatedByUserId");
        if (status is not null) where.Add("p.status = @Status");
        var whereClause = where.Count > 0 ? "WHERE " + string.Join(" AND ", where) : "";

        var prefixedColumns = string.Join(", ",
            ProposalColumns.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(c => $"p.{c}"));

        return await conn.QueryAsync<Proposal>(
            $"""
            SELECT
                {prefixedColumns},
                COUNT(ppg.id)::int AS total_products
            FROM proposals p
            LEFT JOIN proposal_product_groups ppg ON ppg.proposal_id = p.id
            {whereClause}
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT @PageSize OFFSET @Offset
            """,
            new { CreatedByUserId = createdByUserId, Status = status, PageSize = pageSize, Offset = (page - 1) * pageSize });
    }

    public async Task<Guid> CreateAsync(Proposal proposal)
    {
        using var conn = Connect();
        await conn.OpenAsync();
        using var tx = await conn.BeginTransactionAsync();

        var id = await conn.ExecuteScalarAsync<Guid>(
            """
            INSERT INTO proposals (
                numero_proposta, status,
                data_solicitacao, data_envio,
                nome_razao_social, cpf_cnpj, nome_contato, telefone, email_cliente,
                endereco_cliente, local_obra, cidade, estado, tipo_projeto,
                created_by_user_id, created_by_email, created_by_name
            ) VALUES (
                @NumeroProposta, @Status,
                @DataSolicitacao, @DataEnvio,
                @NomeRazaoSocial, @CpfCnpj, @NomeContato, @Telefone, @EmailCliente,
                @EnderecoCliente, @LocalObra, @Cidade, @Estado, @TipoProjeto,
                @CreatedByUserId, @CreatedByEmail, @CreatedByName
            ) RETURNING id
            """, proposal, tx);

        foreach (var g in proposal.ProductGroups)
        {
            g.ProposalId = id;
            await InsertProductGroupAsync(conn, g, tx);
        }

        await tx.CommitAsync();
        return id;
    }

    public async Task UpdateAsync(Proposal proposal)
    {
        using var conn = Connect();
        await conn.OpenAsync();
        using var tx = await conn.BeginTransactionAsync();

        await conn.ExecuteAsync(
            """
            UPDATE proposals SET
                numero_proposta = @NumeroProposta,
                data_solicitacao = @DataSolicitacao,
                data_envio = @DataEnvio,
                nome_razao_social = @NomeRazaoSocial,
                cpf_cnpj = @CpfCnpj,
                nome_contato = @NomeContato,
                telefone = @Telefone,
                email_cliente = @EmailCliente,
                endereco_cliente = @EnderecoCliente,
                local_obra = @LocalObra,
                cidade = @Cidade,
                estado = @Estado,
                tipo_projeto = @TipoProjeto,
                updated_at = NOW()
            WHERE id = @Id
            """, proposal, tx);

        await conn.ExecuteAsync(
            "DELETE FROM proposal_product_groups WHERE proposal_id = @Id",
            new { proposal.Id }, tx);

        foreach (var g in proposal.ProductGroups)
        {
            g.ProposalId = proposal.Id;
            await InsertProductGroupAsync(conn, g, tx);
        }

        await tx.CommitAsync();
    }

    public async Task<bool> UpdateGeneratedOutputsAsync(Guid id, string? pptxUrl, string? xlsxUrl, string generatedByUserId, string? generatedByEmail, string? generatedByName)
    {
        using var conn = Connect();
        var rows = await conn.ExecuteAsync(
            """
            UPDATE proposals SET
                pptx_url = @PptxUrl,
                xlsx_url = @XlsxUrl,
                generated_by_user_id = @GeneratedByUserId,
                generated_by_email = @GeneratedByEmail,
                generated_by_name = @GeneratedByName,
                generated_at = NOW(),
                status = 'gerada',
                updated_at = NOW()
            WHERE id = @Id
            """, new { Id = id, PptxUrl = pptxUrl, XlsxUrl = xlsxUrl, GeneratedByUserId = generatedByUserId, GeneratedByEmail = generatedByEmail, GeneratedByName = generatedByName });
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(Guid id, string? createdByUserId)
    {
        using var conn = Connect();
        var userFilter = createdByUserId is not null ? " AND created_by_user_id = @CreatedByUserId" : "";
        var rows = await conn.ExecuteAsync(
            $"DELETE FROM proposals WHERE id = @Id{userFilter} AND status = 'rascunho'",
            new { Id = id, CreatedByUserId = createdByUserId });
        return rows > 0;
    }

    private static async Task InsertProductGroupAsync(NpgsqlConnection conn, ProposalProductGroup g, Npgsql.NpgsqlTransaction tx)
    {
        await conn.ExecuteAsync(
            """
            INSERT INTO proposal_product_groups (
                proposal_id, product_id, variant_id, quantity, group_index,
                largura, comprimento, area_total,
                tipo_terreno, dificuldade_acesso, responsavel_material_pedreira,
                possui_iluminacao, iluminacao_fixada_alambrado, quantidade_postes_iluminacao,
                altura_postes_iluminacao, quantidade_projetores, potencia_projetores,
                especificar_potencia_projetores, quantidade_cruzetas,
                responsavel_ligacao_eletrica, tipo_coligacao,
                possui_alambrado, galvanizacao, especificar_galvanizacao,
                possui_trelica, travamento,
                quantidade_portoes, altura_portoes, comprimento_portoes,
                possui_tela_superior,
                possui_tela_sombreamento, largura_sombreamento, comprimento_sombreamento,
                observacoes, specs
            ) VALUES (
                @ProposalId, @ProductId, @VariantId, @Quantity, @GroupIndex,
                @Largura, @Comprimento, @AreaTotal,
                @TipoTerreno, @DificuldadeAcesso, @ResponsavelMaterialPedreira,
                @PossuiIluminacao, @IluminacaoFixadaAlambrado, @QuantidadePostesIluminacao,
                @AlturaPostesIluminacao, @QuantidadeProjetores, @PotenciaProjetores,
                @EspecificarPotenciaProjetores, @QuantidadeCruzetas,
                @ResponsavelLigacaoEletrica, @TipoColigacao,
                @PossuiAlambrado, @Galvanizacao, @EspecificarGalvanizacao,
                @PossuiTrelica, @Travamento,
                @QuantidadePortoes, @AlturaPortoes, @ComprimentoPortoes,
                @PossuiTelaSuperior,
                @PossuiTelaSombreamento, @LarguraSombreamento, @ComprimentoSombreamento,
                @Observacoes, @Specs::jsonb
            )
            """, g, tx);
    }
}
