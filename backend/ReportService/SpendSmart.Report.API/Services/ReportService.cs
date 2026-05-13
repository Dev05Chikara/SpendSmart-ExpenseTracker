using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using SpendSmart.Report.API.DTOs;
using SpendSmart.Report.API.Services.Interfaces;

namespace SpendSmart.Report.API.Services
{
    public class ReportService : IReportService
    {
        private readonly HttpClient _httpClient;
        private readonly Microsoft.Extensions.Configuration.IConfiguration _configuration;

        public ReportService(HttpClient httpClient, Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<MonthlySummaryResponse> GetMonthlySummaryAsync(int userId, int year, int month, string bearerToken)
        {
            try
            {
                ApplyBearerToken(bearerToken);

                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);

                var expenses = await FetchExpensesByDateAsync(startDate, endDate);
                var incomes = await FetchIncomesByDateAsync(startDate, endDate);
                var categories = await FetchCategoriesAsync();

                var totalIncome = incomes.Sum(item => item.Amount ?? 0m);
                var totalExpense = expenses.Sum(item => item.Amount ?? 0m);
                var categoryMap = categories.ToDictionary(item => item.CategoryId, item => item);

                var details = new List<MonthlyDetail>();

                if (totalIncome > 0)
                {
                    details.Add(new MonthlyDetail
                    {
                        Category = "Income",
                        Amount = totalIncome,
                        Type = "Income"
                    });
                }

                details.AddRange(expenses
                    .GroupBy(item => item.CategoryId)
                    .Select(group =>
                    {
                        categoryMap.TryGetValue(group.Key ?? 0, out var category);
                        return new MonthlyDetail
                        {
                            Category = category?.Name ?? $"Category {group.Key ?? 0}",
                            Amount = group.Sum(item => item.Amount ?? 0m),
                            Type = "Expense"
                        };
                    }));

                var dailyExpenses = expenses
                    .GroupBy(item => item.Date.Date)
                    .OrderBy(group => group.Key)
                    .Select(group => new DailyExpenseSummary
                    {
                        Date = group.Key,
                        Amount = group.Sum(item => item.Amount ?? 0m)
                    })
                    .ToList();

                return new MonthlySummaryResponse
                {
                    Year = year,
                    Month = month,
                    TotalIncome = totalIncome,
                    TotalExpense = totalExpense,
                    NetSavings = totalIncome - totalExpense,
                    Details = details,
                    DailyExpenses = dailyExpenses
                };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error getting monthly summary: {ex.Message}");
                return new MonthlySummaryResponse
                {
                    Year = year,
                    Month = month
                };
            }
        }

        public async Task<YearlySummaryResponse> GetYearlySummaryAsync(int userId, int year, string bearerToken)
        {
            try
            {
                ApplyBearerToken(bearerToken);

                var startDate = new DateTime(year, 1, 1);
                var endDate = new DateTime(year, 12, 31);

                var expenses = await FetchExpensesByDateAsync(startDate, endDate);
                var incomes = await FetchIncomesByDateAsync(startDate, endDate);

                var totalIncome = incomes.Sum(item => item.Amount ?? 0m);
                var totalExpense = expenses.Sum(item => item.Amount ?? 0m);

                var monthlyBreakdown = new List<YearlyMonthBreakdown>();
                for (var monthIndex = 1; monthIndex <= 12; monthIndex++)
                {
                    var monthStart = new DateTime(year, monthIndex, 1);
                    var monthEnd = monthStart.AddMonths(1).AddDays(-1);

                    var monthIncome = incomes.Where(item => item.Date >= monthStart && item.Date <= monthEnd).Sum(item => item.Amount ?? 0m);
                    var monthExpense = expenses.Where(item => item.Date >= monthStart && item.Date <= monthEnd).Sum(item => item.Amount ?? 0m);

                    monthlyBreakdown.Add(new YearlyMonthBreakdown
                    {
                        Month = monthIndex,
                        MonthName = monthStart.ToString("MMMM"),
                        Income = monthIncome,
                        Expense = monthExpense,
                        NetSavings = monthIncome - monthExpense
                    });
                }

                return new YearlySummaryResponse
                {
                    Year = year,
                    TotalIncome = totalIncome,
                    TotalExpense = totalExpense,
                    NetSavings = totalIncome - totalExpense,
                    AverageMonthlyExpense = totalExpense / 12m,
                    AverageMonthlyIncome = totalIncome / 12m,
                    MonthlyBreakdown = monthlyBreakdown
                };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error getting yearly summary: {ex.Message}");
                return new YearlySummaryResponse
                {
                    Year = year,
                    MonthlyBreakdown = GetMonthlyBreakdownList(year)
                };
            }
        }

        public async Task<CategoryBreakdownResponse> GetCategoryBreakdownAsync(int userId, int year, int month, string bearerToken)
        {
            try
            {
                ApplyBearerToken(bearerToken);

                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);

                var expenses = await FetchExpensesByDateAsync(startDate, endDate);
                var categories = await FetchCategoriesAsync();
                var categoryMap = categories.ToDictionary(item => item.CategoryId, item => item);

                var totalExpense = expenses.Sum(item => item.Amount ?? 0m);

                var categorySpending = expenses
                    .GroupBy(item => item.CategoryId)
                    .Select(group =>
                    {
                        categoryMap.TryGetValue(group.Key ?? 0, out var category);
                        var amount = group.Sum(item => item.Amount ?? 0m);
                        return new CategorySpending
                        {
                            CategoryId = group.Key ?? 0,
                            CategoryName = category?.Name ?? $"Category {group.Key ?? 0}",
                            Amount = amount,
                            Percentage = totalExpense > 0 ? amount * 100m / totalExpense : 0m
                        };
                    })
                    .OrderByDescending(item => item.Amount)
                    .ToList();

                return new CategoryBreakdownResponse
                {
                    Year = year,
                    Month = month,
                    MonthName = startDate.ToString("MMMM"),
                    TotalExpense = totalExpense,
                    Categories = categorySpending
                };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error getting category breakdown: {ex.Message}");
                return new CategoryBreakdownResponse
                {
                    Year = year,
                    Month = month,
                    MonthName = new DateTime(year, month, 1).ToString("MMMM")
                };
            }
        }

        private void ApplyBearerToken(string bearerToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);
        }

        private async Task<List<ExpenseResponse>> FetchExpensesByDateAsync(DateTime startDate, DateTime endDate)
        {
            var baseUrl = _configuration["ExpenseService:BaseUrl"] ?? "http://localhost:5002";
            var url = $"{baseUrl.TrimEnd('/')}/api/expenses/by-date?startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}";
            return await GetServiceDataAsync<ExpenseResponse>(url);
        }

        private async Task<List<IncomeResponse>> FetchIncomesByDateAsync(DateTime startDate, DateTime endDate)
        {
            var baseUrl = _configuration["IncomeService:BaseUrl"] ?? "http://localhost:5003";
            var url = $"{baseUrl.TrimEnd('/')}/api/incomes/by-date?startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}";
            return await GetServiceDataAsync<IncomeResponse>(url);
        }

        private async Task<List<CategoryResponse>> FetchCategoriesAsync()
        {
            var baseUrl = _configuration["CategoryService:BaseUrl"] ?? "http://localhost:5004";
            var url = $"{baseUrl.TrimEnd('/')}/api/categories";
            return await GetServiceDataAsync<CategoryResponse>(url);
        }

        private async Task<List<T>> GetServiceDataAsync<T>(string url) where T : class
        {
            try
            {
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    return new List<T>();
                }

                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var envelope = JsonSerializer.Deserialize<ApiResponseContainer<List<T>>>(content, options);
                return envelope?.Data ?? new List<T>();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error fetching service data from {url}: {ex.Message}");
                return new List<T>();
            }
        }

        private List<YearlyMonthBreakdown> GetMonthlyBreakdownList(int year)
        {
            var months = new List<YearlyMonthBreakdown>();
            for (var i = 1; i <= 12; i++)
            {
                months.Add(new YearlyMonthBreakdown
                {
                    Month = i,
                    MonthName = new DateTime(year, i, 1).ToString("MMMM"),
                    Income = 0,
                    Expense = 0,
                    NetSavings = 0
                });
            }

            return months;
        }
    }
}
