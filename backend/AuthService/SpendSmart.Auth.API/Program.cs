using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SpendSmart.Auth.API.Data;
using SpendSmart.Auth.API.Repositories;
using SpendSmart.Auth.API.Repositories.Interfaces;
using SpendSmart.Auth.API.Services;
using SpendSmart.Auth.API.Services.Interfaces;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// Add Entity Framework Core with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add repositories and services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITokenBlacklistRepository, TokenBlacklistRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();

// Add controllers
builder.Services.AddControllers();

// Add CORS for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure JWT Authentication
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

    // Add event handler to check token blacklist
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var tokenBlacklistRepository = context.HttpContext.RequestServices.GetRequiredService<ITokenBlacklistRepository>();
            var token = context.SecurityToken as System.IdentityModel.Tokens.Jwt.JwtSecurityToken;
            
            if (token != null)
            {
                var rawToken = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                var isBlacklisted = await tokenBlacklistRepository.IsTokenBlacklistedAsync(rawToken);
                
                if (isBlacklisted)
                {
                    context.Fail("Token has been revoked.");
                }
            }
        }
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Enable CORS before authentication
app.UseCors("AngularDev");

// Add authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Apply migrations and seed admin user (development-friendly)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var services = scope.ServiceProvider;
        var db = services.GetRequiredService<AppDbContext>();
        // Apply any pending migrations
        db.Database.Migrate();

        // Seed admin user only in development if none exists
        if (app.Environment.IsDevelopment())
        {
            var hasAdmin = db.Users.Any(u => u.Role == "Admin");
            if (!hasAdmin)
            {
                var seedEmail = builder.Configuration["SeedAdmin:Email"] ?? "admin@spendsmart.local";
                var seedPassword = builder.Configuration["SeedAdmin:Password"] ?? "Admin@123";
                var seedFullName = builder.Configuration["SeedAdmin:FullName"] ?? "Administrator";

                var admin = new SpendSmart.Auth.API.Models.User
                {
                    FullName = seedFullName,
                    Email = seedEmail,
                    Currency = "INR",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Role = "Admin"
                };

                var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<SpendSmart.Auth.API.Models.User>();
                admin.PasswordHash = hasher.HashPassword(admin, seedPassword);

                db.Users.Add(admin);
                db.SaveChanges();
            }
        }
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

app.Run();
