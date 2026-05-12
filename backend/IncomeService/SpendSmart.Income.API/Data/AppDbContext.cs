using Microsoft.EntityFrameworkCore;
using SpendSmart.Income.API.Models;

namespace SpendSmart.Income.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Models.Income> Incomes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Income table constraints
        modelBuilder.Entity<Models.Income>(entity =>
        {
            entity.HasKey(e => e.IncomeId);

            entity.Property(e => e.Description)
                .HasMaxLength(500);

            entity.Property(e => e.Source)
                .HasMaxLength(100);

            entity.Property(e => e.Amount)
                .HasPrecision(18, 2);

            // Performance indexes
            entity.HasIndex(e => new { e.UserId, e.Date })
                .HasDatabaseName("IX_Income_UserId_Date");

            entity.HasIndex(e => new { e.UserId, e.IsActive })
                .HasDatabaseName("IX_Income_UserId_IsActive");
        });
    }
}
