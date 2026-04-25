# SpendSmart Auth Service

A secure ASP.NET Core 10 microservice for user authentication and account management. Built with JWT tokens, SQL Server, and Entity Framework Core.

## Features

- User registration & login with JWT authentication (24-hour expiry)
- **Google OAuth authentication** (Sign with Google)
- User profile management (get, update)
- Admin user management (suspend, delete users)
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
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login & get JWT token | No |
| POST | `/api/auth/google` | Google OAuth login | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile (name, currency, avatar) | Yes |
| GET | `/api/admin/users` | List all users (Admin only) | Yes |
| PUT | `/api/admin/users/{id}/suspend` | Suspend user (Admin only) | Yes |
| DELETE | `/api/admin/users/{id}` | Delete user (Admin only) | Yes |

**Protected endpoints** require JWT Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Testing with Postman

1. **User Registration & Login**:
   - POST `/api/auth/register` with email & password
   - POST `/api/auth/login` with email & password → Get JWT token

2. **Google OAuth**:
   - POST `/api/auth/google` with Google ID token
   - Returns JWT token same as email/password login

3. **Protected Endpoints**:
   - GET `/api/auth/profile` with Bearer token → View user info
   - PUT `/api/auth/profile` with Bearer token → Update name, currency, avatar

4. **Admin Operations** (requires admin role):
   - GET `/api/admin/users` → List all users
   - PUT `/api/admin/users/{id}/suspend` → Suspend user account
   - DELETE `/api/admin/users/{id}` → Delete user account

## Security

- Password hashing with PBKDF2 (ASP.NET Core Identity)
- JWT with HS256 algorithm (24-hour expiration)
- Google OAuth token validation with official Google library
- SQL injection protection (parameterized queries)
- Role-based access control (Admin/User roles)

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

- Email verification for new registrations
- Password reset functionality
- Two-factor authentication (2FA)
- Refresh token rotation
- Activity audit logging
- Rate limiting on auth endpoints
