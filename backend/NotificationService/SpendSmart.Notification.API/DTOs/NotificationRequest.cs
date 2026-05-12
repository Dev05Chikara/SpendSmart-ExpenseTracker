using System.ComponentModel.DataAnnotations;

namespace SpendSmart.Notification.API.DTOs;

public class NotificationRequest
{
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Type { get; set; } = "General";
}
