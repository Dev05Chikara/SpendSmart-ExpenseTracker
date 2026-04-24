using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendSmart.Auth.API.DTOs;
using SpendSmart.Auth.API.Services.Interfaces;
using System.Security.Claims;

namespace SpendSmart.Auth.API.Controllers;

/// <summary>
/// Controller for user authentication and profile management.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="UsersController"/> class.
    /// </summary>
    /// <param name="userService">The user service.</param>
    /// <param name="logger">The logger.</param>
    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Registers a new user.
    /// </summary>
    /// <param name="request">The registration request.</param>
    /// <returns>The created user information.</returns>
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<UserResponse>>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var user = await _userService.RegisterAsync(request);
            return Ok(new ApiResponse<UserResponse>(true, "User registered successfully.", user));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Registration failed: {ex.Message}");
            return BadRequest(new ApiResponse<UserResponse>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Register error: {ex.Message}");
            return StatusCode(500, new ApiResponse<UserResponse>(false, "An error occurred during registration."));
        }
    }

    /// <summary>
    /// Authenticates a user and returns a JWT token.
    /// </summary>
    /// <param name="request">The login request.</param>
    /// <returns>The JWT token and user information.</returns>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _userService.LoginAsync(request);
            return Ok(new ApiResponse<LoginResponse>(true, "Login successful.", response));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Login failed: {ex.Message}");
            return Unauthorized(new ApiResponse<LoginResponse>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Login error: {ex.Message}");
            return StatusCode(500, new ApiResponse<LoginResponse>(false, "An error occurred during login."));
        }
    }

    /// <summary>
    /// Gets the profile of the logged-in user.
    /// </summary>
    /// <returns>The user profile information.</returns>
    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<ApiResponse<UserResponse>>> GetProfile()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<UserResponse>(false, "Invalid token."));
            }

            var user = await _userService.GetProfileAsync(userId);
            return Ok(new ApiResponse<UserResponse>(true, "Profile retrieved successfully.", user));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Get profile failed: {ex.Message}");
            return NotFound(new ApiResponse<UserResponse>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get profile error: {ex.Message}");
            return StatusCode(500, new ApiResponse<UserResponse>(false, "An error occurred while retrieving profile."));
        }
    }

    /// <summary>
    /// Updates the profile of the logged-in user.
    /// </summary>
    /// <param name="request">The update profile request.</param>
    /// <returns>The updated user information.</returns>
    [Authorize]
    [HttpPut("update-profile")]
    public async Task<ActionResult<ApiResponse<UserResponse>>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<UserResponse>(false, "Invalid token."));
            }

            var user = await _userService.UpdateProfileAsync(userId, request);
            return Ok(new ApiResponse<UserResponse>(true, "Profile updated successfully.", user));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Update profile failed: {ex.Message}");
            return NotFound(new ApiResponse<UserResponse>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Update profile error: {ex.Message}");
            return StatusCode(500, new ApiResponse<UserResponse>(false, "An error occurred while updating profile."));
        }
    }

    /// <summary>
    /// Changes the password of the logged-in user.
    /// </summary>
    /// <param name="request">The change password request.</param>
    /// <returns>A success message.</returns>
    [Authorize]
    [HttpPut("change-password")]
    public async Task<ActionResult<ApiResponse<string>>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<string>(false, "Invalid token."));
            }

            var message = await _userService.ChangePasswordAsync(userId, request);
            return Ok(new ApiResponse<string>(true, message));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Change password failed: {ex.Message}");
            return BadRequest(new ApiResponse<string>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Change password error: {ex.Message}");
            return StatusCode(500, new ApiResponse<string>(false, "An error occurred while changing password."));
        }
    }

    /// <summary>
    /// Deactivates the account of the logged-in user.
    /// </summary>
    /// <returns>A success message.</returns>
    [Authorize]
    [HttpDelete("deactivate")]
    public async Task<ActionResult<ApiResponse<string>>> Deactivate()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<string>(false, "Invalid token."));
            }

            var message = await _userService.DeactivateAsync(userId);
            return Ok(new ApiResponse<string>(true, message));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Deactivate failed: {ex.Message}");
            return NotFound(new ApiResponse<string>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Deactivate error: {ex.Message}");
            return StatusCode(500, new ApiResponse<string>(false, "An error occurred while deactivating account."));
        }
    }

    /// <summary>
    /// Logs out the current user by blacklisting their JWT token.
    /// </summary>
    /// <param name="request">The logout request containing the token to revoke.</param>
    /// <returns>A success message.</returns>
    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult<ApiResponse<string>>> Logout([FromBody] LogoutRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<string>(false, "Invalid token."));
            }

            if (string.IsNullOrWhiteSpace(request.Token))
            {
                return BadRequest(new ApiResponse<string>(false, "Token is required."));
            }

            // Extract expiration from JWT token
            var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            System.IdentityModel.Tokens.Jwt.JwtSecurityToken jwtToken;
            
            try
            {
                jwtToken = tokenHandler.ReadToken(request.Token) as System.IdentityModel.Tokens.Jwt.JwtSecurityToken;
            }
            catch
            {
                return BadRequest(new ApiResponse<string>(false, "Invalid token format."));
            }

            if (jwtToken?.ValidTo == null)
            {
                return BadRequest(new ApiResponse<string>(false, "Could not determine token expiration."));
            }

            var message = await _userService.LogoutAsync(userId, request.Token, jwtToken.ValidTo);
            return Ok(new ApiResponse<string>(true, message));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Logout error: {ex.Message}");
            return StatusCode(500, new ApiResponse<string>(false, "An error occurred while logging out."));
        }
    }
}
