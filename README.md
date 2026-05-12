# SpendSmart - Expense Tracker

SpendSmart is a production-style personal finance application built with ASP.NET Core microservices and an Angular frontend.

It currently includes:
- JWT authentication with profile management
- Google sign-in integration
- Income, expense, category, and budget management
- Reports dashboard with financial health insights
- API Gateway routing for frontend-to-service communication

## Current Project Status

The core product flow is complete for deployment in its current scope.

Completed and verified:
- Core auth flow (register, login, profile)
- Currency behavior (editable in profile and auto-used in income/expense/reporting UX)
- Expense, income, category, and budget CRUD flows
- Reports page improvements (health score, expense-vs-budget, daily trend refinements)
- Gateway + frontend integration
- Successful frontend production build

Out of scope for now:
- Email delivery pipeline
- Blob/file storage
- PDF export pipeline
- Advanced infrastructure additions (event bus, Redis, etc.)

## Architecture

### Backend Services

| Service | Port | Purpose |
|---------|------|---------|
| Auth Service | 5184 | Authentication, JWT, profile, Google OAuth |
| Expense Service | 5002 | Expense management and filters |
| Income Service | 5003 | Income management and history |
| Category Service | 5004 | User category management |
| Budget Service | 5005 | Budget setup and usage tracking |
| Report Service | 5006 | Monthly/yearly reporting endpoints |
| Notification Service | 5007 | In-app notifications |
| API Gateway | 5000 | Single entry point for frontend |

### Frontend

- Angular application in `frontend/`
- Runs on `http://localhost:4200`
- Uses gateway routes to access backend services

## Tech Stack

- .NET 10 / ASP.NET Core Web API
- Entity Framework Core + SQL Server
- YARP API Gateway
- Angular
- JWT authentication

## Prerequisites

- .NET 10 SDK
- Node.js 20+ and npm
- SQL Server (Express or Developer)

## Run Locally

Run each service in a separate terminal.

## 1) Auth Service

```bash
cd backend/AuthService/SpendSmart.Auth.API
dotnet restore
dotnet ef database update
dotnet run
```

## 2) Category Service

```bash
cd backend/CategoryService/SpendSmart.Category.API
dotnet restore
dotnet ef database update
dotnet run
```

## 3) Expense Service

```bash
cd backend/ExpenseService/SpendSmart.Expense.API
dotnet restore
dotnet ef database update
dotnet run
```

## 4) Income Service

```bash
cd backend/IncomeService/SpendSmart.Income.API
dotnet restore
dotnet ef database update
dotnet run
```

## 5) Budget Service

```bash
cd backend/BudgetService/SpendSmart.Budget.API
dotnet restore
dotnet ef database update
dotnet run
```

## 6) Report Service

```bash
cd backend/ReportService/SpendSmart.Report.API
dotnet restore
dotnet ef database update
dotnet run
```

## 7) Notification Service

```bash
cd backend/NotificationService/SpendSmart.Notification.API
dotnet restore
dotnet ef database update
dotnet run
```

## 8) API Gateway

```bash
cd backend/GatewayService/SpendSmart.Gateway.API
dotnet restore
dotnet run
```

## 9) Frontend

```bash
cd frontend
npm install
npm run start
```

App URLs:
- Gateway: `http://localhost:5000`
- Frontend: `http://localhost:4200`

## Deployment Notes

- Build the frontend with `npm run build` and serve the `dist/` output via your preferred host.
- Set production environment values for API base URL, JWT settings, and Google OAuth client ID.
- Use production SQL Server connection strings for each microservice.
- Configure CORS to allow only trusted frontend origins.

## Authentication

Protected endpoints require a bearer token:

```http
Authorization: Bearer <jwt_token>
```

Auth endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

## Key Product Flows

1. Register or login
2. Set/update profile currency
3. Add income records
4. Add expense records by category
5. Create budgets and monitor usage
6. Review reports and health score insights

## API Testing (Quick)

1. Call `POST /api/auth/login` and copy the token.
2. Add `Authorization: Bearer <token>` to subsequent requests.
3. Test endpoints through gateway routes or direct service ports.

## Security Basics

- Password hashing with salt
- JWT-based authorization
- User-scoped data access across modules
- EF Core parameterization for SQL safety

## Repository Structure

```text
backend/
  AuthService/
  BudgetService/
  CategoryService/
  ExpenseService/
  GatewayService/
  IncomeService/
  NotificationService/
  ReportService/
frontend/
README.md
```


