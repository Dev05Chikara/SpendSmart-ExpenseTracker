using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendSmart.Auth.API.DTOs;
using SpendSmart.Auth.API.Services.Interfaces;

namespace SpendSmart.Auth.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IUserService userService, ILogger<AdminController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpGet("users")]
    public async Task<ActionResult<ApiResponse<List<UserResponse>>>> GetUsers()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(new ApiResponse<List<UserResponse>>(true, "Users retrieved.", users));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get users failed");
            return StatusCode(500, new ApiResponse<List<UserResponse>>(false, "An error occurred."));
        }
    }

    [HttpPut("users/{id}/suspend")]
    public async Task<ActionResult<ApiResponse<string>>> Suspend(int id)
    {
        try
        {
            var msg = await _userService.SuspendUserAsync(id);
            return Ok(new ApiResponse<string>(true, msg));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<string>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Suspend failed");
            return StatusCode(500, new ApiResponse<string>(false, "An error occurred."));
        }
    }

    [HttpPut("users/{id}/activate")]
    public async Task<ActionResult<ApiResponse<string>>> Activate(int id)
    {
        try
        {
            var msg = await _userService.ActivateUserAsync(id);
            return Ok(new ApiResponse<string>(true, msg));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<string>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Activate failed");
            return StatusCode(500, new ApiResponse<string>(false, "An error occurred."));
        }
    }

    [HttpDelete("users/{id}")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
    {
        try
        {
            var msg = await _userService.DeleteUserAsync(id);
            return Ok(new ApiResponse<string>(true, msg));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<string>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Delete failed");
            return StatusCode(500, new ApiResponse<string>(false, "An error occurred."));
        }
    }
}
