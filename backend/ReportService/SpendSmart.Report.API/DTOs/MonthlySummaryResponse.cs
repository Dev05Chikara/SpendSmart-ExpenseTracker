using System;
using System.Collections.Generic;

namespace SpendSmart.Report.API.DTOs
{
    public class MonthlySummaryResponse
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal NetSavings { get; set; }
        public List<MonthlyDetail> Details { get; set; } = new();
    }

    public class MonthlyDetail
    {
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty; // Income or Expense
    }
}
