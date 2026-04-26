using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendSmart.Report.API.DTOs;
using SpendSmart.Report.API.Services.Interfaces;

namespace SpendSmart.Report.API.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("monthly/{year}/{month}")]
        public async Task<ActionResult<ApiResponse<MonthlySummaryResponse>>> GetMonthlySummary(int year, int month)
        {
            try
            {
                var userId = GetUserId();
                
                if (month < 1 || month > 12)
                    return BadRequest(new ApiResponse<MonthlySummaryResponse> 
                    { 
                        Success = false, 
                        Message = "Invalid month. Month must be between 1 and 12." 
                    });

                var summary = await _reportService.GetMonthlySummaryAsync(userId, year, month);
                return Ok(new ApiResponse<MonthlySummaryResponse>
                {
                    Success = true,
                    Message = "Monthly summary retrieved successfully",
                    Data = summary
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<MonthlySummaryResponse>
                {
                    Success = false,
                    Message = $"An error occurred: {ex.Message}"
                });
            }
        }

        [HttpGet("yearly/{year}")]
        public async Task<ActionResult<ApiResponse<YearlySummaryResponse>>> GetYearlySummary(int year)
        {
            try
            {
                var userId = GetUserId();

                if (year < 1900 || year > DateTime.UtcNow.Year + 10)
                    return BadRequest(new ApiResponse<YearlySummaryResponse>
                    {
                        Success = false,
                        Message = "Invalid year."
                    });

                var summary = await _reportService.GetYearlySummaryAsync(userId, year);
                return Ok(new ApiResponse<YearlySummaryResponse>
                {
                    Success = true,
                    Message = "Yearly summary retrieved successfully",
                    Data = summary
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<YearlySummaryResponse>
                {
                    Success = false,
                    Message = $"An error occurred: {ex.Message}"
                });
            }
        }

        [HttpGet("category-breakdown/{year}/{month}")]
        public async Task<ActionResult<ApiResponse<CategoryBreakdownResponse>>> GetCategoryBreakdown(int year, int month)
        {
            try
            {
                var userId = GetUserId();

                if (month < 1 || month > 12)
                    return BadRequest(new ApiResponse<CategoryBreakdownResponse>
                    {
                        Success = false,
                        Message = "Invalid month. Month must be between 1 and 12."
                    });

                var breakdown = await _reportService.GetCategoryBreakdownAsync(userId, year, month);
                return Ok(new ApiResponse<CategoryBreakdownResponse>
                {
                    Success = true,
                    Message = "Category breakdown retrieved successfully",
                    Data = breakdown
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<CategoryBreakdownResponse>
                {
                    Success = false,
                    Message = $"An error occurred: {ex.Message}"
                });
            }
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
                return userId;

            throw new UnauthorizedAccessException("User ID not found in token.");
        }
    }
}
