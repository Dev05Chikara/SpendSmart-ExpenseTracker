using Microsoft.EntityFrameworkCore;
using SpendSmart.Notification.API.Models;

namespace SpendSmart.Notification.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<AppNotification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppNotification>()
            .HasIndex(n => new { n.UserId, n.IsRead, n.IsActive });

        modelBuilder.Entity<AppNotification>()
            .HasIndex(n => new { n.UserId, n.CreatedAt });

        modelBuilder.Entity<AppNotification>()
            .HasIndex(n => new { n.UserId, n.BudgetId, n.ThresholdPercentage })
            .HasDatabaseName("IX_Notifications_UserId_BudgetId_ThresholdPercentage");
    }
}
