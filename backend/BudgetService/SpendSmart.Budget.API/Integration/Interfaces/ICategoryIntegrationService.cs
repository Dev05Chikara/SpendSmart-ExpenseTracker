namespace SpendSmart.Budget.API.Integration.Interfaces;

public interface ICategoryIntegrationService
{
    Task<string?> GetCategoryNameAsync(int categoryId, string authToken);
}
