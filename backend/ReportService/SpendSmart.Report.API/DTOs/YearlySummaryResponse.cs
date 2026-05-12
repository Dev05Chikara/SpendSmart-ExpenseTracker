using System;
using System.Collections.Generic;

namespace SpendSmart.Report.API.DTOs
{
    public class YearlySummaryResponse
    {
        public int Year { get; set; }
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal NetSavings { get; set; }
        public decimal AverageMonthlyExpense { get; set; }
        public decimal AverageMonthlyIncome { get; set; }
        public List<YearlyMonthBreakdown> MonthlyBreakdown { get; set; } = new();
    }

    public class YearlyMonthBreakdown
    {
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal Income { get; set; }
        public decimal Expense { get; set; }
        public decimal NetSavings { get; set; }
    }
}
