using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SpendSmart.Report.API.DTOs;
using SpendSmart.Report.API.Services.Interfaces;

namespace SpendSmart.Report.API.Services
{
    public class ReportService : IReportService
    {
        public Task<MonthlySummaryResponse> GetMonthlySummaryAsync(int userId, int year, int month)
        {
            var response = new MonthlySummaryResponse
            {
                Year = year,
                Month = month,
                TotalIncome = 0, // Will be calculated from Income Service
                TotalExpense = 0, // Will be calculated from Expense Service
                NetSavings = 0,
                Details = new List<MonthlyDetail>()
            };

            return Task.FromResult(response);
        }

        public Task<YearlySummaryResponse> GetYearlySummaryAsync(int userId, int year)
        {
            var response = new YearlySummaryResponse
            {
                Year = year,
                TotalIncome = 0,
                TotalExpense = 0,
                NetSavings = 0,
                AverageMonthlyExpense = 0,
                AverageMonthlyIncome = 0,
                MonthlyBreakdown = GetMonthlyBreakdownList(year)
            };

            return Task.FromResult(response);
        }

        public Task<CategoryBreakdownResponse> GetCategoryBreakdownAsync(int userId, int year, int month)
        {
            var monthName = new DateTime(year, month, 1).ToString("MMMM");
            var response = new CategoryBreakdownResponse
            {
                Year = year,
                Month = month,
                MonthName = monthName,
                TotalExpense = 0,
                Categories = new List<CategorySpending>()
            };

            return Task.FromResult(response);
        }

        private List<YearlyMonthBreakdown> GetMonthlyBreakdownList(int year)
        {
            var months = new List<YearlyMonthBreakdown>();
            for (int i = 1; i <= 12; i++)
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
