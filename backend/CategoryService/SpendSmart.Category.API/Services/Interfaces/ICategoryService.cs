using SpendSmart.Category.API.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SpendSmart.Category.API.Services.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryResponse>> GetAllCategoriesAsync(int userId);
    Task<CategoryResponse> GetCategoryByIdAsync(int categoryId);
    Task<CategoryResponse> CreateCategoryAsync(int userId, CategoryRequest request);
    Task<CategoryResponse> UpdateCategoryAsync(int categoryId, int userId, CategoryRequest request);
    Task DeleteCategoryAsync(int categoryId);
}
