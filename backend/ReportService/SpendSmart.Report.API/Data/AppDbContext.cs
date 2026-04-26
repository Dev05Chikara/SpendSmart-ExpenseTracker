using Microsoft.EntityFrameworkCore;
using SpendSmart.Report.API.Models;

namespace SpendSmart.Report.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<ReportSummary> ReportSummaries { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ReportSummary>()
                .HasKey(r => r.ReportId);

            modelBuilder.Entity<ReportSummary>()
                .HasIndex(r => new { r.UserId, r.ReportDate });
        }
    }
}
