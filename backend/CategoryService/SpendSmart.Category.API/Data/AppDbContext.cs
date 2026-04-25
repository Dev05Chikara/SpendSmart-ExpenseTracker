using Microsoft.EntityFrameworkCore;
using SpendSmart.Category.API.Models;
using System;
using System.Collections.Generic;

namespace SpendSmart.Category.API.Data;

public class AppDbContext : DbContext
{
    public DbSet<Models.Category> Categories { get; set; } = default!;

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Category entity
        modelBuilder.Entity<Models.Category>().HasKey(c => c.CategoryId);
        modelBuilder.Entity<Models.Category>().Property(c => c.Name).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<Models.Category>().Property(c => c.Icon).IsRequired().HasMaxLength(10);
        modelBuilder.Entity<Models.Category>().Property(c => c.Color).IsRequired().HasMaxLength(7);
        modelBuilder.Entity<Models.Category>().Property(c => c.Type).IsRequired().HasMaxLength(20);

        // Seed default expense categories
        var defaultCategories = new List<Models.Category>
        {
            // Expense categories
            new() { CategoryId = 1, UserId = 0, Name = "Food", Icon = "🍕", Color = "#FF6B6B", Type = "Expense", IsDefault = true, IsActive = true },
            new() { CategoryId = 2, UserId = 0, Name = "Transport", Icon = "🚗", Color = "#4ECDC4", Type = "Expense", IsDefault = true, IsActive = true },
            new() { CategoryId = 3, UserId = 0, Name = "Housing", Icon = "🏠", Color = "#45B7D1", Type = "Expense", IsDefault = true, IsActive = true },
            new() { CategoryId = 4, UserId = 0, Name = "Health", Icon = "🏥", Color = "#96CEB4", Type = "Expense", IsDefault = true, IsActive = true },
            new() { CategoryId = 5, UserId = 0, Name = "Entertainment", Icon = "🎬", Color = "#FFEAA7", Type = "Expense", IsDefault = true, IsActive = true },
            new() { CategoryId = 6, UserId = 0, Name = "Shopping", Icon = "🛍️", Color = "#DDA15E", Type = "Expense", IsDefault = true, IsActive = true },
            new() { CategoryId = 7, UserId = 0, Name = "Education", Icon = "📚", Color = "#BC6C25", Type = "Expense", IsDefault = true, IsActive = true },
            new() { CategoryId = 8, UserId = 0, Name = "Savings", Icon = "💰", Color = "#2ECC71", Type = "Expense", IsDefault = true, IsActive = true },

            // Income categories
            new() { CategoryId = 9, UserId = 0, Name = "Salary", Icon = "💼", Color = "#3498DB", Type = "Income", IsDefault = true, IsActive = true },
            new() { CategoryId = 10, UserId = 0, Name = "Freelance", Icon = "💻", Color = "#9B59B6", Type = "Income", IsDefault = true, IsActive = true },
            new() { CategoryId = 11, UserId = 0, Name = "Investment", Icon = "📈", Color = "#E74C3C", Type = "Income", IsDefault = true, IsActive = true },
            new() { CategoryId = 12, UserId = 0, Name = "Bonus", Icon = "🎁", Color = "#F39C12", Type = "Income", IsDefault = true, IsActive = true }
        };

        modelBuilder.Entity<Models.Category>().HasData(defaultCategories);
    }
}
