using System;

namespace SpendSmart.Report.API.Models
{
    public class ReportSummary
    {
        public int ReportId { get; set; }
        public int UserId { get; set; }
        public string ReportType { get; set; } = string.Empty; // Monthly, Yearly, CategoryBreakdown
        public DateTime ReportDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
