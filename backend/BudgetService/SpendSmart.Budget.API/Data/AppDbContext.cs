using Microsoft.EntityFrameworkCore;

namespace SpendSmart.Budget.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Models.Budget> Budgets { get; set; }

    public DbSet<Models.BudgetAlertOutbox> BudgetAlertOutbox { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Models.Budget>(entity =>
        {
            entity.HasKey(e => e.BudgetId);

            entity.Property(e => e.Period)
                .HasMaxLength(20);

            entity.Property(e => e.LimitAmount)
                .HasPrecision(18, 2);

            entity.Property(e => e.SpentAmount)
                .HasPrecision(18, 2);

            entity.HasIndex(e => new { e.UserId, e.CategoryId, e.IsActive })
                .HasDatabaseName("IX_Budget_UserId_CategoryId_IsActive");

            entity.HasIndex(e => new { e.UserId, e.StartDate, e.EndDate })
                .HasDatabaseName("IX_Budget_UserId_StartDate_EndDate");
        });

        modelBuilder.Entity<Models.BudgetAlertOutbox>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Message)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(e => e.Type)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("BudgetAlert");

            entity.Property(e => e.ThresholdPercentage)
                .HasPrecision(18, 2);

            entity.Property(e => e.CurrentUsagePercentage)
                .HasPrecision(18, 2);

            entity.Property(e => e.LimitAmount)
                .HasPrecision(18, 2);

            entity.Property(e => e.SpentAmount)
                .HasPrecision(18, 2);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.HasIndex(e => new { e.BudgetId, e.ThresholdPercentage })
                .IsUnique()
                .HasDatabaseName("UX_BudgetAlertOutbox_BudgetId_ThresholdPercentage");

            entity.HasIndex(e => new { e.IsDelivered, e.CreatedAt })
                .HasDatabaseName("IX_BudgetAlertOutbox_IsDelivered_CreatedAt");
        });
    }
}
