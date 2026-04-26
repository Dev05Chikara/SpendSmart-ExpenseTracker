# SpendSmart - Expense Tracker

ASP.NET Core 10 microservices platform for personal expense management. Built with JWT authentication, SQL Server, and Entity Framework Core.

## Services Overview

| Service | Port | Purpose |
|---------|------|---------|
| **Auth Service** | 5184 | User authentication, JWT tokens, Google OAuth |
| **Category Service** | 5004 | Expense category management (CRUD) |
| **Expense Service** | 5002 | Expense tracking and reporting |
| Income Service | 5003 | Income tracking (coming soon) |
| Budget Service | 5005 | Budget management (coming soon) |

## Prerequisites

- .NET 10 SDK
- SQL Server Express
- Postman (for API testing)

## Quick Start

### 1. Auth Service (5184)
```bash
cd backend/AuthService/SpendSmart.Auth.API
dotnet restore
dotnet ef database update
dotnet run
```

### 2. Category Service (5004)
```bash
cd backend/CategoryService/SpendSmart.Category.API
dotnet restore
dotnet ef database update
dotnet run
```

### 3. Expense Service (5002)
```bash
cd backend/ExpenseService/SpendSmart.Expense.API
dotnet restore
dotnet ef database update
dotnet run
```

---

## Auth Service (Port 5184)

**Database:** SpendSmartAuthDB

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login with email/password | No |
| POST | `/api/auth/google` | Google OAuth sign-in | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |

---

## Category Service (Port 5004)

**Database:** SpendSmartCategoryDB

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | List all categories | Yes |
| GET | `/api/categories/{id}` | Get category by ID | Yes |
| POST | `/api/categories` | Create new category | Yes |
| PUT | `/api/categories/{id}` | Update category | Yes |
| DELETE | `/api/categories/{id}` | Delete category (soft) | Yes |

**Features:**
- User-scoped categories
- 12 seeded default categories
- Soft delete with IsActive flag

---

## Expense Service (Port 5002)

**Database:** SpendSmartExpenseDB

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/expenses` | List all expenses | Yes |
| GET | `/api/expenses/{id}` | Get expense by ID | Yes |
| GET | `/api/expenses/by-date` | Filter by date range | Yes |
| GET | `/api/expenses/by-category/{id}` | Filter by category | Yes |
| POST | `/api/expenses` | Create new expense | Yes |
| PUT | `/api/expenses/{id}` | Update expense | Yes |
| DELETE | `/api/expenses/{id}` | Delete expense (soft) | Yes |

**Features:**
- User-scoped expense tracking
- Soft delete with IsActive flag
- Performance indexes on (UserId, Date) and (UserId, CategoryId)
- Payment modes: Credit Card, Debit Card, Cash, Check, Online

---

## Authentication

All protected endpoints require JWT Bearer token:
```
Authorization: Bearer <jwt_token>
```

**JWT Config (all services):**
- Algorithm: HS256
- Expiry: 24 hours
- Issuer: SpendSmart
- Audience: SpendSmartUsers

---

## Response Format

All APIs return standardized format:
```json
{
  "success": true,
  "message": "Success message",
  "data": { }
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## Project Structure

Each service follows clean architecture:
```
SpendSmart.{Service}.API/
├── Controllers/        # API endpoints
├── Services/           # Business logic
├── Repositories/       # Data access
├── Models/             # Database entities
├── DTOs/               # Request/response models
├── Data/               # EF Core context
├── Migrations/         # Database migrations
└── Program.cs          # Startup & DI
```

---

## Testing in Postman

1. **Get JWT Token:**
   - POST `/api/auth/login` on Auth Service (5184)
   - Copy token from response

2. **Test Protected Endpoints:**
   - Add `Authorization: Bearer <token>` header
   - Call endpoints on Category (5004) or Expense (5002)

---

## Coming Soon

- Income Service (5003) - Track income sources
- Budget Service (5005) - Budget planning & alerts
- Report Service (5006) - Financial reports & analytics
- API Gateway (5000) - Single entry point for all services

---

## Security Notes

- Passwords: PBKDF2 hashing with salt
- SQL Injection: Parameterized queries via EF Core
- CORS: Enabled for development
- Role-based access: User & Admin roles
- Soft delete: Maintains data integrity


