using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SpendSmart.Income.API.DTOs;
using SpendSmart.Income.API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SpendSmart.Income.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncomesController : ControllerBase
{
    private readonly IIncomeService _service;
    private readonly ILogger<IncomesController> _logger;

    public IncomesController(IIncomeService service, ILogger<IncomesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<IncomeResponse>>>> GetAllIncomes()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<List<IncomeResponse>>(false, "Invalid token."));
            }

            var incomes = await _service.GetAllIncomesAsync(userId);
            return Ok(new ApiResponse<List<IncomeResponse>>(true, "Incomes retrieved successfully.", incomes));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get incomes error: {ex.Message}");
            return StatusCode(500, new ApiResponse<List<IncomeResponse>>(false, "An error occurred while retrieving incomes."));
        }
    }

    [Authorize]
    [HttpGet("by-date")]
    public async Task<ActionResult<ApiResponse<List<IncomeResponse>>>> GetIncomesByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<List<IncomeResponse>>(false, "Invalid token."));
            }

            var incomes = await _service.GetIncomesByDateRangeAsync(userId, startDate, endDate);
            return Ok(new ApiResponse<List<IncomeResponse>>(true, "Incomes retrieved successfully.", incomes));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get incomes by date error: {ex.Message}");
            return StatusCode(500, new ApiResponse<List<IncomeResponse>>(false, "An error occurred while retrieving incomes."));
        }
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<IncomeResponse>>> GetIncomeById(int id)
    {
        try
        {
            var income = await _service.GetIncomeByIdAsync(id);
            return Ok(new ApiResponse<IncomeResponse>(true, "Income retrieved successfully.", income));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<IncomeResponse>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get income error: {ex.Message}");
            return StatusCode(500, new ApiResponse<IncomeResponse>(false, "An error occurred while retrieving the income."));
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<IncomeResponse>>> CreateIncome([FromBody] IncomeRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<IncomeResponse>(false, "Invalid token."));
            }

            if (string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest(new ApiResponse<IncomeResponse>(false, "Description is required."));
            }

            var income = await _service.CreateIncomeAsync(userId, request);
            return Created($"/api/incomes/{income.IncomeId}", new ApiResponse<IncomeResponse>(true, "Income created successfully.", income));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Create income error: {ex.Message}");
            return StatusCode(500, new ApiResponse<IncomeResponse>(false, "An error occurred while creating the income."));
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<IncomeResponse>>> UpdateIncome(int id, [FromBody] IncomeRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<IncomeResponse>(false, "Invalid token."));
            }

            var income = await _service.UpdateIncomeAsync(id, userId, request);
            return Ok(new ApiResponse<IncomeResponse>(true, "Income updated successfully.", income));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<IncomeResponse>(false, ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Update income error: {ex.Message}");
            return StatusCode(500, new ApiResponse<IncomeResponse>(false, "An error occurred while updating the income."));
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteIncome(int id)
    {
        try
        {
            await _service.DeleteIncomeAsync(id);
            return Ok(new ApiResponse<string>(true, "Income deleted successfully.", null));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Delete income error: {ex.Message}");
            return StatusCode(500, new ApiResponse<string>(false, "An error occurred while deleting the income."));
        }
    }
}
