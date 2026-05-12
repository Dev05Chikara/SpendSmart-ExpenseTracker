using System;

namespace SpendSmart.Report.API.DTOs
{
    public class IncomeResponse
    {
        public int IncomeId { get; set; }
        public int UserId { get; set; }
        public string Source { get; set; } = string.Empty;
        public decimal? Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsRecurring { get; set; }
        public string? RecurrenceType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
