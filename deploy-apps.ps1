$RESOURCE_GROUP  = "rg-spendsmart"
$ACA_ENV         = "spendsmart-env"
$ACR_LOGIN_SERVER = "spendsmartacr.azurecr.io"
$ACR_USERNAME     = "spendsmartacr"
$ACR_PASSWORD     = "DAO5aFHc3I4AUqkWl6jMncViWqGCMFBBRuEuqFefW16EvrZCa0HwJQQJ99CEAC3pKaREqg7NAAACAZCRJ9hQ"

$SQL_SERVER_NAME = "spendsmart-sql"
$SQL_ADMIN_USER  = "sqladmin"
$SQL_ADMIN_PASS  = "SpendSmart_SA_Pass2024!"
$JWT_KEY         = "SpendSmartSuperSecretKey_ChangeMe_InProd_32chars!"
$JWT_ISSUER      = "SpendSmart"
$JWT_AUDIENCE    = "SpendSmartUsers"
$GOOGLE_CLIENT   = "453747910306-vid0si72gek01g9839mje46vm6m8tmpj.apps.googleusercontent.com"

$SQL_FQDN  = "${SQL_SERVER_NAME}.database.windows.net"
function Get-ConnStr($db) {
    return "Server=${SQL_FQDN},1433;Database=${db};User Id=${SQL_ADMIN_USER};Password=${SQL_ADMIN_PASS};TrustServerCertificate=False;Encrypt=True;"
}

function Deploy-App($name, $image, $envVars, $port) {
    Write-Host "Deploying $name on port $port..." -ForegroundColor Yellow

    az containerapp create `
        --name $name `
        --resource-group $RESOURCE_GROUP `
        --environment $ACA_ENV `
        --image $image `
        --registry-server $ACR_LOGIN_SERVER `
        --registry-username $ACR_USERNAME `
        --registry-password $ACR_PASSWORD `
        --target-port $port `
        --ingress internal `
        --min-replicas 1 `
        --max-replicas 2 `
        --cpu 0.25 `
        --memory 0.5Gi `
        --env-vars @($envVars | ForEach-Object { "$($_.Key)=$($_.Value)" })

    Write-Host "[SUCCESS] $name deployed" -ForegroundColor Green
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
) 8080

# Category Service
Deploy-App "category-service" "$ACR_LOGIN_SERVER/category-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartCategoryDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
) 8080

# Expense Service
Deploy-App "expense-service" "$ACR_LOGIN_SERVER/expense-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartExpenseDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
) 8080

# Income Service
Deploy-App "income-service" "$ACR_LOGIN_SERVER/income-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartIncomeDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
) 8080

# Budget Service
Deploy-App "budget-service" "$ACR_LOGIN_SERVER/budget-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartBudgetDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="ExpenseService__BaseUrl"; Value="https://expense-service.internal.nicewater-707ce070.eastasia.azurecontainerapps.io"}
    @{Key="NotificationService__BaseUrl"; Value="https://notification-service.internal.nicewater-707ce070.eastasia.azurecontainerapps.io"}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
) 8080

# Report Service
Deploy-App "report-service" "$ACR_LOGIN_SERVER/report-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartReportDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="ExpenseService__BaseUrl"; Value="https://expense-service.internal.nicewater-707ce070.eastasia.azurecontainerapps.io"}
    @{Key="IncomeService__BaseUrl"; Value="https://income-service.internal.nicewater-707ce070.eastasia.azurecontainerapps.io"}
    @{Key="CategoryService__BaseUrl"; Value="https://category-service.internal.nicewater-707ce070.eastasia.azurecontainerapps.io"}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
) 8080

# Notification Service
Deploy-App "notification-service" "$ACR_LOGIN_SERVER/notification-service:latest" @(
    @{Key="ConnectionStrings__DefaultConnection"; Value=(Get-ConnStr "SpendSmartNotificationDB")}
    @{Key="Jwt__Key"; Value=$JWT_KEY}
    @{Key="Jwt__Issuer"; Value=$JWT_ISSUER}
    @{Key="Jwt__Audience"; Value=$JWT_AUDIENCE}
    @{Key="ASPNETCORE_ENVIRONMENT"; Value="Production"}
) 8080

# Gateway — internal ingress but public facing URL logic needs to be set if this is the entrypoint!
Write-Host "Deploying gateway..." -ForegroundColor Yellow
az containerapp create `
    --name "gateway" `
    --resource-group $RESOURCE_GROUP `
    --environment $ACA_ENV `
    --image "$ACR_LOGIN_SERVER/gateway:latest" `
    --registry-server $ACR_LOGIN_SERVER `
    --registry-username $ACR_USERNAME `
    --registry-password $ACR_PASSWORD `
    --target-port 8080 `
    --ingress external `
    --min-replicas 1 `
    --max-replicas 2 `
    --cpu 0.25 `
    --memory 0.5Gi `
    --env-vars @(
        "ASPNETCORE_ENVIRONMENT=Docker"
    )

Write-Host "[SUCCESS] Gateway deployed!" -ForegroundColor Green
