using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendSmart.Notification.API.DTOs;
using SpendSmart.Notification.API.Services.Interfaces;
using System.Security.Claims;

namespace SpendSmart.Notification.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _service;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(INotificationService service, ILogger<NotificationsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<NotificationResponse>>>> GetNotifications()
    {
        try
        {
            var userId = GetUserId();
            var notifications = await _service.GetAllNotificationsAsync(userId);
            return Ok(new ApiResponse<List<NotificationResponse>>(true, "Notifications retrieved successfully.", notifications));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<List<NotificationResponse>>(false, "Invalid token."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get notifications error");
            return StatusCode(500, new ApiResponse<List<NotificationResponse>>(false, "An error occurred while retrieving notifications."));
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<NotificationResponse>>> CreateNotification([FromBody] NotificationRequest request)
    {
        try
        {
            var userId = GetUserId();
            var notification = await _service.CreateNotificationAsync(userId, request);
            return Created($"/api/notifications/{notification.NotificationId}", new ApiResponse<NotificationResponse>(true, "Notification created successfully.", notification));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<NotificationResponse>(false, "Invalid token."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Create notification error");
            return StatusCode(500, new ApiResponse<NotificationResponse>(false, "An error occurred while creating notification."));
        }
    }

    [Authorize]
    [HttpPut("{id}/read")]
    public async Task<ActionResult<ApiResponse<NotificationResponse>>> MarkAsRead(int id)
    {
        try
        {
            var userId = GetUserId();
            var notification = await _service.MarkAsReadAsync(id, userId);
            return Ok(new ApiResponse<NotificationResponse>(true, "Notification marked as read.", notification));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<NotificationResponse>(false, "Invalid token."));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<NotificationResponse>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Mark notification as read error");
            return StatusCode(500, new ApiResponse<NotificationResponse>(false, "An error occurred while updating notification."));
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteNotification(int id)
    {
        try
        {
            var userId = GetUserId();
            await _service.DeleteNotificationAsync(id, userId);
            return Ok(new ApiResponse<string>(true, "Notification deleted successfully."));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<string>(false, "Invalid token."));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<string>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Delete notification error");
            return StatusCode(500, new ApiResponse<string>(false, "An error occurred while deleting notification."));
        }
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid token");
        }

        return userId;
    }
}
