using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SpendSmart.Category.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Color = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CategoryId);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "CategoryId", "Color", "Icon", "IsActive", "IsDefault", "Name", "Type", "UserId" },
                values: new object[,]
                {
                    { 1, "#FF6B6B", "🍕", true, true, "Food", "Expense", 0 },
                    { 2, "#4ECDC4", "🚗", true, true, "Transport", "Expense", 0 },
                    { 3, "#45B7D1", "🏠", true, true, "Housing", "Expense", 0 },
                    { 4, "#96CEB4", "🏥", true, true, "Health", "Expense", 0 },
                    { 5, "#FFEAA7", "🎬", true, true, "Entertainment", "Expense", 0 },
                    { 6, "#DDA15E", "🛍️", true, true, "Shopping", "Expense", 0 },
                    { 7, "#BC6C25", "📚", true, true, "Education", "Expense", 0 },
                    { 8, "#2ECC71", "💰", true, true, "Savings", "Expense", 0 },
                    { 9, "#3498DB", "💼", true, true, "Salary", "Income", 0 },
                    { 10, "#9B59B6", "💻", true, true, "Freelance", "Income", 0 },
                    { 11, "#E74C3C", "📈", true, true, "Investment", "Income", 0 },
                    { 12, "#F39C12", "🎁", true, true, "Bonus", "Income", 0 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
