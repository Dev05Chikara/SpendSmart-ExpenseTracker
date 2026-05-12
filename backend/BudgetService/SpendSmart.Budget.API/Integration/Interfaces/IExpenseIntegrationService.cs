namespace SpendSmart.Budget.API.Integration.Interfaces;

public interface IExpenseIntegrationService
{
    Task<List<ExpenseDto>> GetUserExpensesAsync(string authToken);
}