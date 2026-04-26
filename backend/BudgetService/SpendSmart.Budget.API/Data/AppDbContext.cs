using Microsoft.EntityFrameworkCore;

namespace SpendSmart.Budget.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Models.Budget> Budgets { get; set; }

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
    }
}
