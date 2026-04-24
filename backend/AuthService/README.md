# SpendSmart Auth Service

A secure ASP.NET Core 10 microservice for user authentication and account management. Built with JWT tokens, SQL Server, and Entity Framework Core.

## Features

- User registration & login with JWT authentication (24-hour expiry)
- Profile management (get, update)
- Password change & account deactivation
- Secure logout with server-side token blacklisting
- Clean architecture with dependency injection
- SQL Server with EF Core migrations

## Prerequisites

- .NET 10 SDK
- SQL Server Express
- Postman (for testing)

## Quick Start

1. **Configure Database** - Update `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=SpendSmartAuthDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "YourSuperSecretKey123456789012345",
    "Issuer": "SpendSmart",
    "Audience": "SpendSmartUsers",
    "ExpiryMinutes": 1440
  }
}
```

2. **Setup Database**
```bash
dotnet restore
dotnet ef database update
```

3. **Run Service**
```bash
dotnet run
```
API runs on: **http://localhost:5184**

## Project Structure

```
SpendSmart.Auth.API/
├── Controllers/          # API endpoints
├── Services/            # Business logic
├── Repositories/        # Data access
├── Models/              # Database entities
├── DTOs/                # Request/response models
├── Data/                # EF Core context
├── Migrations/          # Database migrations
└── Program.cs           # Startup configuration
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users/register` | Register new user | No |
| POST | `/api/users/login` | Login & get JWT token | No |
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/update-profile` | Update profile (name, currency) | Yes |
| PUT | `/api/users/change-password` | Change password | Yes |
| POST | `/api/users/logout` | Logout & blacklist token | Yes |
| DELETE | `/api/users/deactivate` | Deactivate account | Yes |

**Protected endpoints** require JWT Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Testing with Postman

1. **Set Environment Variable:**
   - Create environment: `baseUrl = http://localhost:5184`

2. **Test Flow:**
   - POST `/api/users/login` → Get JWT token
   - Copy token from response
   - For protected endpoints, add Bearer token in Authorization tab
   - Test each endpoint

3. **Verify Logout:**
   - POST `/api/users/logout` with token
   - Try protected endpoint again → Should get 401 (Token revoked)

## Security

- Password hashing with PBKDF2 (ASP.NET Core Identity)
- JWT with HS256 algorithm
- Token expiration (24 hours)
- Server-side token blacklisting for logout
- SQL injection protection (parameterized queries)
- Account deactivation support

## Response Format

All responses follow standardized format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": { ... }
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized (invalid/expired token)
- `404` - Not Found
- `500` - Server Error

## Future Enhancements

- Email verification
- Password reset
- Two-factor authentication
- Refresh token rotation
- OAuth 2.0 support
- Rate limiting
- Activity logging
