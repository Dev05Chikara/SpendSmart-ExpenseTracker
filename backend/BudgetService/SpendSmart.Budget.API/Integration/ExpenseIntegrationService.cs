using System.Net.Http.Headers;
using System.Text.Json;
using SpendSmart.Budget.API.Integration.Interfaces;

namespace SpendSmart.Budget.API.Integration;

public class ExpenseIntegrationService : IExpenseIntegrationService
{
    private readonly HttpClient _httpClient;

    public ExpenseIntegrationService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<List<ExpenseDto>> GetUserExpensesAsync(string authToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "api/expenses");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", authToken);

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadAsStringAsync();
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var apiResponse = JsonSerializer.Deserialize<ExpenseApiResponse<List<ExpenseDto>>>(payload, options);

        return apiResponse?.Success == true && apiResponse.Data != null
            ? apiResponse.Data
            : new List<ExpenseDto>();
    }
}