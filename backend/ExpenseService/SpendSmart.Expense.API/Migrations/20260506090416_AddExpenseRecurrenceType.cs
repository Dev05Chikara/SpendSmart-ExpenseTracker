using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpendSmart.Expense.API.Migrations
{
    /// <inheritdoc />
    public partial class AddExpenseRecurrenceType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RecurrenceType",
                table: "Expenses",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecurrenceType",
                table: "Expenses");
        }
    }
}
