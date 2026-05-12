using System;
using System.Collections.Generic;

namespace SpendSmart.Report.API.DTOs
{
    public class CategoryBreakdownResponse
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal TotalExpense { get; set; }
        public List<CategorySpending> Categories { get; set; } = new();
    }

    public class CategorySpending
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Percentage { get; set; }
    }
}
