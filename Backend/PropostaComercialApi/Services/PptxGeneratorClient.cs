using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace PropostaComercialApi.Services;

public class PptxGeneratorClient(HttpClient http)
{
    private static readonly JsonSerializerOptions _json = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task<byte[]> GenerateAsync(object payload)
    {
        var body = new StringContent(JsonSerializer.Serialize(payload, _json), Encoding.UTF8, "application/json");
        var response = await http.PostAsync("/gerar-proposta", body);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsByteArrayAsync();
    }
}
