using System.Net.Http.Headers;
using System.Text.Json;
using SpendSmart.Budget.API.Integration.Interfaces;

namespace SpendSmart.Budget.API.Integration;

public class CategoryIntegrationService : ICategoryIntegrationService
{
    private readonly HttpClient _httpClient;

    public CategoryIntegrationService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string?> GetCategoryNameAsync(int categoryId, string authToken)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"api/categories/{categoryId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", authToken);

            using var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return null;

            var payload = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var envelope = JsonSerializer.Deserialize<CategoryApiResponse>(payload, options);
            return envelope?.Data?.Name;
        }
        catch
        {
            return null;
        }
    }
}

internal class CategoryApiResponse
{
    public bool Success { get; set; }
    public CategoryDto? Data { get; set; }
}

internal class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
