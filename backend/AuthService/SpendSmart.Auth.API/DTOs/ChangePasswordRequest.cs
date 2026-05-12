namespace SpendSmart.Auth.API.DTOs;

/// <summary>
/// Data Transfer Object for changing user password.
/// </summary>
public class ChangePasswordRequest
{
    /// <summary>
    /// Gets or sets the user's current password.
    /// </summary>
    public string OldPassword { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's new password.
    /// </summary>
    public string NewPassword { get; set; } = null!;
}
