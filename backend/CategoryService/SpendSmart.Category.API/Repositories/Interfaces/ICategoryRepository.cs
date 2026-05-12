using SpendSmart.Category.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SpendSmart.Category.API.Repositories.Interfaces;

public interface ICategoryRepository
{
    Task<List<Models.Category>> GetAllCategoriesAsync(int userId);
    Task<Models.Category?> GetCategoryByIdAsync(int categoryId);
    Task<Models.Category> CreateCategoryAsync(Models.Category category);
    Task UpdateCategoryAsync(Models.Category category);
    Task DeleteCategoryAsync(int categoryId);
}
