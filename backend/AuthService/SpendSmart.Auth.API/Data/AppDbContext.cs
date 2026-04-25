using Microsoft.EntityFrameworkCore;
using SpendSmart.Auth.API.Models;

namespace SpendSmart.Auth.API.Data;

/// <summary>
/// Application database context for SpendSmart.Auth.API.
/// Provides access to the database and manages entity mappings.
/// </summary>
public class AppDbContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the <see cref="AppDbContext"/> class.
    /// </summary>
    /// <param name="options">The database context options.</param>
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// Gets or sets the DbSet for User entities.
    /// </summary>
    public DbSet<User> Users { get; set; }

    /// <summary>
    /// Gets or sets the DbSet for TokenBlacklist entities.
    /// </summary>
    public DbSet<TokenBlacklist> TokenBlacklists { get; set; }

    /// <summary>
    /// Configures the model for the database context.
    /// </summary>
    /// <param name="modelBuilder">The model builder.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);

            entity.Property(e => e.UserId)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.FullName)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(255);

            entity.HasIndex(e => e.Email)
                .IsUnique();

            entity.Property(e => e.PasswordHash)
                .IsRequired();

            entity.Property(e => e.Currency)
                .IsRequired()
                .HasDefaultValue("INR")
                .HasMaxLength(10);

            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            entity.Property(e => e.LastLoginAt)
                .IsRequired(false);

            entity.Property(e => e.GoogleId)
                .IsRequired(false)
                .HasMaxLength(255);

            entity.HasIndex(e => e.GoogleId)
                .IsUnique();
        });

        // Configure TokenBlacklist entity
        modelBuilder.Entity<TokenBlacklist>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Token)
                .IsRequired()
                .HasMaxLength(2000); // JWT tokens can be long

            entity.Property(e => e.BlacklistedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            entity.Property(e => e.ExpiresAt)
                .IsRequired();

            entity.Property(e => e.UserId)
                .IsRequired();

            // Index on Token for quick lookup
            entity.HasIndex(e => e.Token)
                .IsUnique();

            // Index on ExpiresAt for cleanup queries
            entity.HasIndex(e => e.ExpiresAt);
        });
    }
}
