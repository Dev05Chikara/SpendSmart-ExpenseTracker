using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SpendSmart.Budget.API.DTOs;
using SpendSmart.Budget.API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SpendSmart.Budget.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly IBudgetService _service;
    private readonly ILogger<BudgetsController> _logger;

    public BudgetsController(IBudgetService service, ILogger<BudgetsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<BudgetResponse>>>> GetAllBudgets()
    {
        try
        {
            var userId = GetUserId();
            var authToken = GetAuthToken();
            var budgets = await _service.GetAllBudgetsAsync(userId, authToken);
            return Ok(new ApiResponse<List<BudgetResponse>>(true, "Budgets retrieved successfully.", budgets));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<List<BudgetResponse>>(false, "Invalid token."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get budgets error");
            return StatusCode(500, new ApiResponse<List<BudgetResponse>>(false, "An error occurred while retrieving budgets."));
        }
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BudgetResponse>>> GetBudgetById(int id)
    {
        try
        {
            var authToken = GetAuthToken();
            var budget = await _service.GetBudgetByIdAsync(id, authToken);
            return Ok(new ApiResponse<BudgetResponse>(true, "Budget retrieved successfully.", budget));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<BudgetResponse>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get budget by id error");
            return StatusCode(500, new ApiResponse<BudgetResponse>(false, "An error occurred while retrieving the budget."));
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<BudgetResponse>>> CreateBudget([FromBody] BudgetRequest request)
    {
        try
        {
            var userId = GetUserId();
            var authToken = GetAuthToken();
            var budget = await _service.CreateBudgetAsync(userId, request, authToken);
            return Created($"/api/budgets/{budget.BudgetId}", new ApiResponse<BudgetResponse>(true, "Budget created successfully.", budget));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<BudgetResponse>(false, "Invalid token."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<BudgetResponse>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Create budget error");
            return StatusCode(500, new ApiResponse<BudgetResponse>(false, "An error occurred while creating the budget."));
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<BudgetResponse>>> UpdateBudget(int id, [FromBody] BudgetRequest request)
    {
        try
        {
            var userId = GetUserId();
            var authToken = GetAuthToken();
            var budget = await _service.UpdateBudgetAsync(id, userId, request, authToken);
            return Ok(new ApiResponse<BudgetResponse>(true, "Budget updated successfully.", budget));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ApiResponse<BudgetResponse>(false, "Invalid token."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<BudgetResponse>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Update budget error");
            return StatusCode(500, new ApiResponse<BudgetResponse>(false, "An error occurred while updating the budget."));
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteBudget(int id)
    {
        try
        {
            await _service.DeleteBudgetAsync(id);
            return Ok(new ApiResponse<string>(true, "Budget deleted successfully."));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<string>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Delete budget error");
            return StatusCode(500, new ApiResponse<string>(false, "An error occurred while deleting the budget."));
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

    private string GetAuthToken()
    {
        var authorizationHeader = Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(authorizationHeader) || !authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Invalid token");
        }

        return authorizationHeader[7..].Trim();
    }
}
