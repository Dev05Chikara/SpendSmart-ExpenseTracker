using System.Threading.Tasks;
using SpendSmart.Report.API.DTOs;

namespace SpendSmart.Report.API.Services.Interfaces
{
    public interface IReportService
    {
        Task<MonthlySummaryResponse> GetMonthlySummaryAsync(int userId, int year, int month, string bearerToken);
        Task<YearlySummaryResponse> GetYearlySummaryAsync(int userId, int year, string bearerToken);
        Task<CategoryBreakdownResponse> GetCategoryBreakdownAsync(int userId, int year, int month, string bearerToken);
    }
}
