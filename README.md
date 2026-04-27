# SpendSmart - Expense Tracker

ASP.NET Core 10 microservices platform for personal expense management. Built with JWT authentication, SQL Server, and Entity Framework Core.

## Services Overview

| Service | Port | Purpose |
|---------|------|---------|
| **Auth Service** | 5184 | User authentication, JWT tokens, Google OAuth |
| **Category Service** | 5004 | Expense category management (CRUD) |
| **Expense Service** | 5002 | Expense tracking and reporting |
| **Income Service** | 5003 | Income tracking and history |
| **Budget Service** | 5005 | Budget limits and status |
| **Report Service** | 5006 | Monthly, yearly, and category reports |
| **Notification Service** | 5007 | User notifications and alerts |

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

### 4. Income Service (5003)
```bash
cd backend/IncomeService/SpendSmart.Income.API
dotnet restore
dotnet ef database update
dotnet run
```

### 5. Budget Service (5005)
```bash
cd backend/BudgetService/SpendSmart.Budget.API
dotnet restore
dotnet ef database update
dotnet run
```

### 6. Report Service (5006)
```bash
cd backend/ReportService/SpendSmart.Report.API
dotnet restore
dotnet ef database update
dotnet run
```

### 7. Notification Service (5007)
```bash
cd backend/NotificationService/SpendSmart.Notification.API
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

## Income Service (Port 5003)

**Database:** SpendSmartIncomeDB

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/incomes` | List all incomes | Yes |
| GET | `/api/incomes/{id}` | Get income by ID | Yes |
| GET | `/api/incomes/by-date` | Filter by date range | Yes |
| POST | `/api/incomes` | Create new income | Yes |
| PUT | `/api/incomes/{id}` | Update income | Yes |
| DELETE | `/api/incomes/{id}` | Delete income (soft) | Yes |

---

## Budget Service (Port 5005)

**Database:** SpendSmartBudgetDB

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/budgets` | List all budgets | Yes |
| GET | `/api/budgets/{id}` | Get budget by ID | Yes |
| POST | `/api/budgets` | Create budget | Yes |
| PUT | `/api/budgets/{id}` | Update budget | Yes |
| DELETE | `/api/budgets/{id}` | Delete budget (soft) | Yes |

**Features:**
- User-scoped budgets
- Soft delete with IsActive flag
- Remaining amount and usage percentage in response

---

## Report Service (Port 5006)

**Database:** SpendSmartReportDB

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reports/monthly/{year}/{month}` | Monthly summary | Yes |
| GET | `/api/reports/yearly/{year}` | Yearly summary | Yes |
| GET | `/api/reports/category-breakdown/{year}/{month}` | Category breakdown | Yes |

---

## Notification Service (Port 5007)

**Database:** SpendSmartNotificationDB

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | List notifications | Yes |
| POST | `/api/notifications` | Create notification | Yes |
| PUT | `/api/notifications/{id}/read` | Mark as read | Yes |
| DELETE | `/api/notifications/{id}` | Delete notification (soft) | Yes |

**Features:**
- User-scoped notifications
- Soft delete with IsActive flag
- Read/unread status tracking

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

- API Gateway (5000) - Single entry point for all services
- Angular frontend (4200) - UI for all services

---

## Security Notes

- Passwords: PBKDF2 hashing with salt
- SQL Injection: Parameterized queries via EF Core
- CORS: Enabled for development
- Role-based access: User & Admin roles
- Soft delete: Maintains data integrity


