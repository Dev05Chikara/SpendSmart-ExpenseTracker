using Microsoft.AspNetCore.Mvc;
using SpendSmart.Notification.API.DTOs;
using SpendSmart.Notification.API.Services.Interfaces;

namespace SpendSmart.Notification.API.Controllers;

[ApiController]
[Route("internal/notifications")]
public class InternalNotificationsController : ControllerBase
{
    private readonly INotificationService _service;
    private readonly ILogger<InternalNotificationsController> _logger;

    public InternalNotificationsController(INotificationService service, ILogger<InternalNotificationsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpPost("budget-alerts")]
    public async Task<ActionResult<ApiResponse<NotificationResponse>>> CreateBudgetAlert([FromBody] BudgetAlertNotificationRequest request)
    {
        try
        {
            var created = await _service.CreateBudgetAlertNotificationAsync(request);
            return Ok(new ApiResponse<NotificationResponse>(true, "Budget alert notification stored.", created));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Create budget alert notification error");
            return StatusCode(500, new ApiResponse<NotificationResponse>(false, "An error occurred while storing the notification."));
        }
    }
}