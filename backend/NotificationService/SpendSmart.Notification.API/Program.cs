using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SpendSmart.Notification.API.Data;
using SpendSmart.Notification.API.Repositories;
using SpendSmart.Notification.API.Repositories.Interfaces;
using SpendSmart.Notification.API.Services;
using SpendSmart.Notification.API.Services.Interfaces;
using System;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();

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

    if (app.Environment.IsDevelopment() && !dbContext.Notifications.Any())
    {
        dbContext.Notifications.AddRange(
            new SpendSmart.Notification.API.Models.AppNotification
            {
                UserId = 1,
                Title = "Welcome to SpendSmart",
                Message = "Your notification center is ready.",
                Type = "General",
                IsRead = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new SpendSmart.Notification.API.Models.AppNotification
            {
                UserId = 1,
                Title = "Budget Alert Sample",
                Message = "This is a seeded sample notification for development.",
                Type = "BudgetAlert",
                BudgetId = 1,
                ThresholdPercentage = 80,
                IsRead = false,
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
