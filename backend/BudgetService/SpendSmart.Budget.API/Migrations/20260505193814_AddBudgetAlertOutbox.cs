using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpendSmart.Budget.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBudgetAlertOutbox : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BudgetAlertOutbox",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BudgetId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    ThresholdPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    CurrentUsagePercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    LimitAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SpentAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: ""),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: ""),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "BudgetAlert"),
                    IsDelivered = table.Column<bool>(type: "bit", nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    LastAttemptAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeliveredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetAlertOutbox", x => x.Id);
                });

            // Create indexes for performance optimization
            migrationBuilder.CreateIndex(
                name: "IX_BudgetAlertOutbox_BudgetId_ThresholdPercentage",
                table: "BudgetAlertOutbox",
                columns: new[] { "BudgetId", "ThresholdPercentage" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BudgetAlertOutbox_IsDelivered_CreatedAt",
                table: "BudgetAlertOutbox",
                columns: new[] { "IsDelivered", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BudgetAlertOutbox");
        }
    }
}
