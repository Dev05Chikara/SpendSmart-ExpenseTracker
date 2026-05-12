using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SpendSmart.Category.API.DTOs;
using SpendSmart.Category.API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SpendSmart.Category.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _service;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ICategoryService service, ILogger<CategoriesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryResponse>>>> GetAllCategories()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<List<CategoryResponse>>(false, "Invalid token."));
            }

            var categories = await _service.GetAllCategoriesAsync(userId);
            return Ok(new ApiResponse<List<CategoryResponse>>(true, "Categories retrieved successfully.", categories));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get categories error: {ex.Message}");
            return StatusCode(500, new ApiResponse<List<CategoryResponse>>(false, "An error occurred while retrieving categories."));
        }
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryResponse>>> GetCategoryById(int id)
    {
        try
        {
            var category = await _service.GetCategoryByIdAsync(id);
            return Ok(new ApiResponse<CategoryResponse>(true, "Category retrieved successfully.", category));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<CategoryResponse>(false, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get category error: {ex.Message}");
            return StatusCode(500, new ApiResponse<CategoryResponse>(false, "An error occurred while retrieving the category."));
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryResponse>>> CreateCategory([FromBody] CategoryRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<CategoryResponse>(false, "Invalid token."));
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new ApiResponse<CategoryResponse>(false, "Category name is required."));
            }

            var category = await _service.CreateCategoryAsync(userId, request);
            return CreatedAtAction(nameof(GetCategoryById), new { id = category.CategoryId }, new ApiResponse<CategoryResponse>(true, "Category created successfully.", category));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Create category error: {ex.Message}");
            return StatusCode(500, new ApiResponse<CategoryResponse>(false, "An error occurred while creating the category."));
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryResponse>>> UpdateCategory(int id, [FromBody] CategoryRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ApiResponse<CategoryResponse>(false, "Invalid token."));
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new ApiResponse<CategoryResponse>(false, "Category name is required."));
            }

            var category = await _service.UpdateCategoryAsync(id, userId, request);
            return Ok(new ApiResponse<CategoryResponse>(true, "Category updated successfully.", category));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ApiResponse<CategoryResponse>(false, ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Update category error: {ex.Message}");
            return StatusCode(500, new ApiResponse<CategoryResponse>(false, "An error occurred while updating the category."));
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteCategory(int id)
    {
        try
        {
            await _service.DeleteCategoryAsync(id);
            return Ok(new ApiResponse<string>(true, "Category deleted successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Delete category error: {ex.Message}");
            return StatusCode(500, new ApiResponse<string>(false, "An error occurred while deleting the category."));
        }
    }
}
