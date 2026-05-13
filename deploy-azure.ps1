# =============================================================
# SpendSmart Azure Deployment Script
# Run this from the project root in a NEW PowerShell terminal
# after restarting to pick up Docker + Azure CLI in PATH.
# =============================================================

# ── CONFIG — edit these before running ──────────────────────
$RESOURCE_GROUP  = "rg-spendsmart"
$LOCATION        = "eastus"           # Change if you prefer another region
$ACR_NAME        = "spendsmartacr"    # Must be globally unique, lowercase only
$ACA_ENV         = "spendsmart-env"
$SQL_SERVER_NAME = "spendsmart-sql"   # Must be globally unique
$SQL_ADMIN_USER  = "sqladmin"
$SQL_ADMIN_PASS  = "SpendSmart_SA_Pass2024!"   # ← Change this!
$JWT_KEY         = "SpendSmartSuperSecretKey_ChangeMe_InProd_32chars!"  # ← Change this!
$JWT_ISSUER      = "SpendSmart"
$JWT_AUDIENCE    = "SpendSmartUsers"
$GOOGLE_CLIENT   = "453747910306-vid0si72gek01g9839mje46vm6m8tmpj.apps.googleusercontent.com"
$SUBSCRIPTION_ID = "b7945316-be70-4c50-9dd9-ffe94d926106"

# ── DATABASES ────────────────────────────────────────────────
$DATABASES = @(
    "SpendSmartAuthDB",
    "SpendSmartCategoryDB",
    "SpendSmartExpenseDB",
    "SpendSmartIncomeDB",
    "SpendSmartBudgetDB",
    "SpendSmartReportDB",
    "SpendSmartNotificationDB"
)

# ── SERVICES: name → Dockerfile context path ────────────────
$SERVICES = [ordered]@{
    "auth-service"         = "backend/AuthService/SpendSmart.Auth.API"
    "category-service"     = "backend/CategoryService/SpendSmart.Category.API"
    "expense-service"      = "backend/ExpenseService/SpendSmart.Expense.API"
    "income-service"       = "backend/IncomeService/SpendSmart.Income.API"
    "budget-service"       = "backend/BudgetService/SpendSmart.Budget.API"
    "report-service"       = "backend/ReportService/SpendSmart.Report.API"
    "notification-service" = "backend/NotificationService/SpendSmart.Notification.API"
    "gateway"              = "backend/GatewayService/SpendSmart.Gateway.API"
    "frontend"             = "frontend"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SpendSmart Azure Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ── STEP 1: Set subscription ─────────────────────────────────
Write-Host "`n[1/7] Setting subscription..." -ForegroundColor Yellow
az account set --subscription $SUBSCRIPTION_ID

# ── STEP 2: Register required providers ──────────────────────
Write-Host "`n[2/7] Registering Azure providers..." -ForegroundColor Yellow
az provider register --namespace Microsoft.App --wait
az provider register --namespace Microsoft.OperationalInsights --wait
az provider register --namespace Microsoft.ContainerRegistry --wait

# ── STEP 3: Create Resource Group ────────────────────────────
Write-Host "`n[3/7] Creating resource group '$RESOURCE_GROUP'..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION

# ── STEP 4: Create Azure Container Registry ──────────────────
Write-Host "`n[4/7] Creating Azure Container Registry '$ACR_NAME'..." -ForegroundColor Yellow
az acr create `
    --resource-group $RESOURCE_GROUP `
    --name $ACR_NAME `
    --sku Basic `
    --admin-enabled true

# Get ACR credentials
$ACR_LOGIN_SERVER = (az acr show --name $ACR_NAME --query loginServer -o tsv)
$ACR_USERNAME     = (az acr credential show --name $ACR_NAME --query username -o tsv)
$ACR_PASSWORD     = (az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)
Write-Host "  ACR: $ACR_LOGIN_SERVER" -ForegroundColor Green

# ── STEP 5: Create Azure SQL Server + Databases ──────────────
Write-Host "`n[5/7] Creating Azure SQL Server '$SQL_SERVER_NAME'..." -ForegroundColor Yellow
az sql server create `
    --resource-group $RESOURCE_GROUP `
    --name $SQL_SERVER_NAME `
    --location $LOCATION `
    --admin-user $SQL_ADMIN_USER `
    --admin-password $SQL_ADMIN_PASS

# Allow Azure services to access SQL Server
az sql server firewall-rule create `
    --resource-group $RESOURCE_GROUP `
    --server $SQL_SERVER_NAME `
    --name "AllowAzureServices" `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0

Write-Host "  Creating databases..." -ForegroundColor Yellow
foreach ($db in $DATABASES) {
    Write-Host "    Creating $db..." -ForegroundColor Gray
    az sql db create `
        --resource-group $RESOURCE_GROUP `
        --server $SQL_SERVER_NAME `
        --name $db `
        --edition Basic `
        --capacity 5 `
        --no-wait
}
Write-Host "  Databases queued (running in parallel)" -ForegroundColor Green

# ── STEP 6: Build & Push Docker images to ACR ────────────────
Write-Host "`n[6/7] Building and pushing images to ACR..." -ForegroundColor Yellow
docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD

foreach ($svc in $SERVICES.GetEnumerator()) {
    $name    = $svc.Key
    $context = $svc.Value
    $tag     = "$ACR_LOGIN_SERVER/${name}:latest"
    Write-Host "  Building $name from $context..." -ForegroundColor Gray
    docker build -t $tag $context
    Write-Host "  Pushing $name..." -ForegroundColor Gray
    docker push $tag
    Write-Host "  ✓ $name pushed" -ForegroundColor Green
}

# ── STEP 7: Create Container Apps Environment ─────────────────
Write-Host "`n[7/7] Creating Container Apps Environment..." -ForegroundColor Yellow
az containerapp env create `
    --name $ACA_ENV `
    --resource-group $RESOURCE_GROUP `
    --location $LOCATION

# ── CONNECTION STRING HELPER ──────────────────────────────────
$SQL_FQDN  = "${SQL_SERVER_NAME}.database.windows.net"
function Get-ConnStr($db) {
    return "Server=${SQL_FQDN},1433;Database=${db};User Id=${SQL_ADMIN_USER};Password=${SQL_ADMIN_PASS};TrustServerCertificate=False;Encrypt=True;"
}

# ── DEPLOY MICROSERVICES ──────────────────────────────────────
Write-Host "`nDeploying microservices to Container Apps..." -ForegroundColor Cyan

# Helper function
function Deploy-App($name, $image, $envVars) {
    Write-Host "  Deploying $name..." -ForegroundColor Yellow
    $envStr = ($envVars | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join " "

    az containerapp create `
        --name $name `
        --resource-group $RESOURCE_GROUP `
        --environment $ACA_ENV `
        --image $image `
        --registry-server $ACR_LOGIN_SERVER `
        --registry-username $ACR_USERNAME `
        --registry-password $ACR_PASSWORD `
        --target-port 80 `
        --ingress internal `
        --min-replicas 1 `
        --max-replicas 2 `
        --cpu 0.25 `
        --memory 0.5Gi `
        --env-vars @($envVars | ForEach-Object { "$($_.Key)=$($_.Value)" })

    Write-Host "  ✓ $name deployed" -ForegroundColor Green
}

# Auth Service
Deploy-App "auth-service" "$ACR_LOGIN_SERVER/auth-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartAuthDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="Google__ClientId"; Value=$GOOGLE_CLIENT}
    @{Key="SeedAdmin__Email"; Value="admin@spendsmart.local"}
    @{Key="SeedAdmin__Password"; Value="Admin@123"}
    @{Key="SeedAdmin__FullName"; Value="Administrator"}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
)

# Category Service
Deploy-App "category-service" "$ACR_LOGIN_SERVER/category-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartCategoryDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
)

# Expense Service
Deploy-App "expense-service" "$ACR_LOGIN_SERVER/expense-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartExpenseDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
)

# Income Service
Deploy-App "income-service" "$ACR_LOGIN_SERVER/income-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartIncomeDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
)

# Budget Service
Deploy-App "budget-service" "$ACR_LOGIN_SERVER/budget-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartBudgetDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="ExpenseService__BaseUrl"; Value="http://expense-service"}
    @{Key="NotificationService__BaseUrl"; Value="http://notification-service"}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
)

# Report Service
Deploy-App "report-service" "$ACR_LOGIN_SERVER/report-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartReportDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
)

# Notification Service
Deploy-App "notification-service" "$ACR_LOGIN_SERVER/notification-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartNotificationDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
)

# Gateway — internal, gets service discovery URLs via YARP Docker config
Deploy-App "gateway" "$ACR_LOGIN_SERVER/gateway:latest" @(
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Docker"}
)

# ── FRONTEND — public ingress ─────────────────────────────────
Write-Host "  Deploying frontend (public)..." -ForegroundColor Yellow
az containerapp create `
    --name "frontend" `
    --resource-group $RESOURCE_GROUP `
    --environment $ACA_ENV `
    --image "$ACR_LOGIN_SERVER/frontend:latest" `
    --registry-server $ACR_LOGIN_SERVER `
    --registry-username $ACR_USERNAME `
    --registry-password $ACR_PASSWORD `
    --target-port 80 `
    --ingress external `
    --min-replicas 1 `
    --max-replicas 3 `
    --cpu 0.25 `
    --memory 0.5Gi

$FRONTEND_URL = (az containerapp show --name "frontend" --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Frontend URL: https://$FRONTEND_URL" -ForegroundColor Green
Write-Host ""
Write-Host "  Next: Add https://$FRONTEND_URL to Google OAuth" -ForegroundColor Yellow
Write-Host "        Authorized JavaScript Origins in Google Cloud Console" -ForegroundColor Yellow
