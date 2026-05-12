using System;

namespace SpendSmart.Report.API.DTOs
{
    public class ExpenseResponse
    {
        public int ExpenseId { get; set; }
        public int UserId { get; set; }
        public decimal? Amount { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? CategoryName { get; set; }
        public int? CategoryId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
