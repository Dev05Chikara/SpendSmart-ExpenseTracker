using SpendSmart.Category.API.DTOs;
using SpendSmart.Category.API.Models;
using SpendSmart.Category.API.Repositories.Interfaces;
using SpendSmart.Category.API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpendSmart.Category.API.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CategoryResponse>> GetAllCategoriesAsync(int userId)
    {
        var categories = await _repository.GetAllCategoriesAsync(userId);
        return categories.Select(c => new CategoryResponse
        {
            CategoryId = c.CategoryId,
            UserId = c.UserId,
            Name = c.Name,
            Icon = c.Icon,
            Color = c.Color,
            Type = c.Type,
            IsDefault = c.IsDefault,
            IsActive = c.IsActive
        }).ToList();
    }

    public async Task<CategoryResponse> GetCategoryByIdAsync(int categoryId)
    {
        var category = await _repository.GetCategoryByIdAsync(categoryId);
        if (category == null)
            throw new InvalidOperationException("Category not found");

        return new CategoryResponse
        {
            CategoryId = category.CategoryId,
            UserId = category.UserId,
            Name = category.Name,
            Icon = category.Icon,
            Color = category.Color,
            Type = category.Type,
            IsDefault = category.IsDefault,
            IsActive = category.IsActive
        };
    }

    public async Task<CategoryResponse> CreateCategoryAsync(int userId, CategoryRequest request)
    {
        var category = new Models.Category
        {
            UserId = userId,
            Name = request.Name,
            Icon = request.Icon,
            Color = request.Color,
            Type = request.Type,
            IsDefault = false,
            IsActive = true
        };

        var created = await _repository.CreateCategoryAsync(category);

        return new CategoryResponse
        {
            CategoryId = created.CategoryId,
            UserId = created.UserId,
            Name = created.Name,
            Icon = created.Icon,
            Color = created.Color,
            Type = created.Type,
            IsDefault = created.IsDefault,
            IsActive = created.IsActive
        };
    }

    public async Task<CategoryResponse> UpdateCategoryAsync(int categoryId, int userId, CategoryRequest request)
    {
        var category = await _repository.GetCategoryByIdAsync(categoryId);
        if (category == null)
            throw new InvalidOperationException("Category not found");

        if (category.UserId != userId && !category.IsDefault)
            throw new UnauthorizedAccessException("You can only update your own categories");

        category.Name = request.Name;
        category.Icon = request.Icon;
        category.Color = request.Color;
        category.Type = request.Type;

        await _repository.UpdateCategoryAsync(category);

        return new CategoryResponse
        {
            CategoryId = category.CategoryId,
            UserId = category.UserId,
            Name = category.Name,
            Icon = category.Icon,
            Color = category.Color,
            Type = category.Type,
            IsDefault = category.IsDefault,
            IsActive = category.IsActive
        };
    }

    public async Task DeleteCategoryAsync(int categoryId)
    {
        await _repository.DeleteCategoryAsync(categoryId);
    }
}
