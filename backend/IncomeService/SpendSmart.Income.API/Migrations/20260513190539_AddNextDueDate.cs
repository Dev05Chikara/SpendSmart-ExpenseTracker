using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpendSmart.Income.API.Migrations
{
    /// <inheritdoc />
    public partial class AddNextDueDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "NextDueDate",
                table: "Incomes",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecurrenceType",
                table: "Incomes",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NextDueDate",
                table: "Incomes");

            migrationBuilder.DropColumn(
                name: "RecurrenceType",
                table: "Incomes");
        }
    }
}
