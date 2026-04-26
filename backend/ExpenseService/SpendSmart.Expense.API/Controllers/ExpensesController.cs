using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SpendSmart.Expense.API.DTOs;
using SpendSmart.Expense.API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SpendSmart.Expense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _service;
    private readonly ILogger<ExpensesController> _logger;

    public ExpensesController(IExpenseService service, ILogger<ExpensesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ExpenseResponse>>>> GetAllExpenses()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<List<ExpenseResponse>>(false, "Invalid token."));
            }

            var expenses = await _service.GetAllExpensesAsync(userId);
            return Ok(new ApiResponse<List<ExpenseResponse>>(true, "Expenses retrieved successfully.", expenses));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get expenses error: {ex.Message}");
            return StatusCode(500, new ApiResponse<List<ExpenseResponse>>(false, "An error occurred while retrieving expenses."));
        }
    }

    [Authorize]
    [HttpGet("by-date")]
    public async Task<ActionResult<ApiResponse<List<ExpenseResponse>>>> GetExpensesByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<List<ExpenseResponse>>(false, "Invalid token."));
            }

            var expenses = await _service.GetExpensesByDateRangeAsync(userId, startDate, endDate);
            return Ok(new ApiResponse<List<ExpenseResponse>>(true, "Expenses retrieved successfully.", expenses));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get expenses by date error: {ex.Message}");
            return StatusCode(500, new ApiResponse<List<ExpenseResponse>>(false, "An error occurred while retrieving expenses."));
        }
    }

    [Authorize]
    [HttpGet("by-category/{categoryId}")]
    public async Task<ActionResult<ApiResponse<List<ExpenseResponse>>>> GetExpensesByCategory(int categoryId)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<List<ExpenseResponse>>(false, "Invalid token."));
            }

            var expenses = await _service.GetExpensesByCategoryAsync(userId, categoryId);
            return Ok(new ApiResponse<List<ExpenseResponse>>(true, "Expenses retrieved successfully.", expenses));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get expenses by category error: {ex.Message}");
            return StatusCode(500, new ApiResponse<List<ExpenseResponse>>(false, "An error occurred while retrieving expenses."));
        }
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ExpenseResponse>>> GetExpenseById(int id)
    {
        try
        {
            var expense = await _service.GetExpenseByIdAsync(id);
            return Ok(new ApiResponse<ExpenseResponse>(true, "Expense retrieved successfully.", expense));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<ExpenseResponse>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get expense error: {ex.Message}");
            return StatusCode(500, new ApiResponse<ExpenseResponse>(false, "An error occurred while retrieving the expense."));
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ExpenseResponse>>> CreateExpense([FromBody] ExpenseRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<ExpenseResponse>(false, "Invalid token."));
            }

            if (string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest(new ApiResponse<ExpenseResponse>(false, "Description is required."));
            }

            var expense = await _service.CreateExpenseAsync(userId, request);
            return Created($"/api/expenses/{expense.ExpenseId}", new ApiResponse<ExpenseResponse>(true, "Expense created successfully.", expense));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Create expense error: {ex.Message}");
            return StatusCode(500, new ApiResponse<ExpenseResponse>(false, "An error occurred while creating the expense."));
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ExpenseResponse>>> UpdateExpense(int id, [FromBody] ExpenseRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<ExpenseResponse>(false, "Invalid token."));
            }

            var expense = await _service.UpdateExpenseAsync(id, userId, request);
            return Ok(new ApiResponse<ExpenseResponse>(true, "Expense updated successfully.", expense));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<ExpenseResponse>(false, ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Update expense error: {ex.Message}");
            return StatusCode(500, new ApiResponse<ExpenseResponse>(false, "An error occurred while updating the expense."));
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteExpense(int id)
    {
        try
        {
            await _service.DeleteExpenseAsync(id);
            return Ok(new ApiResponse<string>(true, "Expense deleted successfully.", null));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Delete expense error: {ex.Message}");
            return StatusCode(500, new ApiResponse<string>(false, "An error occurred while deleting the expense."));
        }
    }
}
