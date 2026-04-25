using Microsoft.EntityFrameworkCore;
using SpendSmart.Category.API.Data;
using SpendSmart.Category.API.Models;
using SpendSmart.Category.API.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpendSmart.Category.API.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Models.Category>> GetAllCategoriesAsync(int userId)
    {
        return await _context.Categories
            .Where(c => (c.UserId == userId || c.IsDefault) && c.IsActive)
            .OrderBy(c => c.Type)
            .ThenBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Models.Category?> GetCategoryByIdAsync(int categoryId)
    {
        return await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == categoryId);
    }

    public async Task<Models.Category> CreateCategoryAsync(Models.Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task UpdateCategoryAsync(Models.Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteCategoryAsync(int categoryId)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == categoryId);
        if (category != null)
        {
            category.IsActive = false;
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
        }
    }
}
