using Microsoft.EntityFrameworkCore;
using SpendSmart.Expense.API.Models;
using System;
using System.Collections.Generic;

namespace SpendSmart.Expense.API.Data;

public class AppDbContext : DbContext
{
    public DbSet<Models.Expense> Expenses { get; set; } = default!;

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Expense entity
        modelBuilder.Entity<Models.Expense>().HasKey(e => e.ExpenseId);
        modelBuilder.Entity<Models.Expense>().Property(e => e.Description).IsRequired().HasMaxLength(500);
        modelBuilder.Entity<Models.Expense>().Property(e => e.PaymentMode).IsRequired().HasMaxLength(50);

        // Create indexes for performance
        modelBuilder.Entity<Models.Expense>()
            .HasIndex(e => new { e.UserId, e.Date })
            .HasDatabaseName("IX_Expense_UserId_Date");

        modelBuilder.Entity<Models.Expense>()
            .HasIndex(e => new { e.UserId, e.CategoryId })
            .HasDatabaseName("IX_Expense_UserId_CategoryId");
    }
}
