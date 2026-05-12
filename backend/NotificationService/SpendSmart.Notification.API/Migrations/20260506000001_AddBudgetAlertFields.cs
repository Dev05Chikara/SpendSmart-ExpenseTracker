using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpendSmart.Notification.API.Migrations
{
    public partial class AddBudgetAlertFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BudgetId",
                table: "Notifications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ThresholdPercentage",
                table: "Notifications",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_BudgetId_ThresholdPercentage",
                table: "Notifications",
                columns: new[] { "UserId", "BudgetId", "ThresholdPercentage" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId_BudgetId_ThresholdPercentage",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "BudgetId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "ThresholdPercentage",
                table: "Notifications");
        }
    }
}