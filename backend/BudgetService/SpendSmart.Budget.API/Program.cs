using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SpendSmart.Budget.API.Data;
using SpendSmart.Budget.API.Integration;
using SpendSmart.Budget.API.Integration.Interfaces;
using SpendSmart.Budget.API.Repositories;
using SpendSmart.Budget.API.Repositories.Interfaces;
using SpendSmart.Budget.API.HostedServices;
using SpendSmart.Budget.API.Services;
using SpendSmart.Budget.API.Services.Interfaces;
using System;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IBudgetRepository, BudgetRepository>();
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddHttpClient();
builder.Services.AddHostedService<BudgetAlertDispatcherService>();

var expenseBaseUrl = builder.Configuration["ExpenseService:BaseUrl"] ?? "http://localhost:5002";
builder.Services.AddHttpClient<IExpenseIntegrationService, ExpenseIntegrationService>(client =>
{
    client.BaseAddress = new Uri(expenseBaseUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});

var categoryBaseUrl = builder.Configuration["CategoryService:BaseUrl"] ?? "http://localhost:5004";
builder.Services.AddHttpClient<ICategoryIntegrationService, CategoryIntegrationService>(client =>
{
    client.BaseAddress = new Uri(categoryBaseUrl);
    client.Timeout = TimeSpan.FromSeconds(10);
});

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT Key is not configured in appsettings.json");
}

var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        ClockSkew = TimeSpan.Zero
    };
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();

    if (app.Environment.IsDevelopment() && !dbContext.Budgets.Any())
    {
        dbContext.Budgets.AddRange(
            new SpendSmart.Budget.API.Models.Budget
            {
                UserId = 1,
                CategoryId = 1,
                LimitAmount = 5000,
                SpentAmount = 1800,
                Period = "Monthly",
                StartDate = DateTime.UtcNow.Date.AddDays(-10),
                EndDate = DateTime.UtcNow.Date.AddDays(20),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new SpendSmart.Budget.API.Models.Budget
            {
                UserId = 1,
                CategoryId = 2,
                LimitAmount = 10000,
                SpentAmount = 8800,
                Period = "Monthly",
                StartDate = DateTime.UtcNow.Date.AddDays(-10),
                EndDate = DateTime.UtcNow.Date.AddDays(20),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

        dbContext.SaveChanges();
    }
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
