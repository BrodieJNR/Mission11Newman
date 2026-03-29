using Microsoft.AspNetCore.Mvc;
using Mission11Newman.Models;

namespace Mission11Newman.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly BookstoreContext _context;

        public BooksController(BookstoreContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetBooks(
            int pageNum = 1,
            int pageSize = 5,
            string sortOrder = "asc",
            string? category = null)
        {
            var query = _context.Books.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(b => b.Category == category);
            }

            // Sorting by title
            if (sortOrder == "desc")
            {
                query = query.OrderByDescending(b => b.Title);
            }
            else
            {
                query = query.OrderBy(b => b.Title);
            }

            var totalBooks = query.Count();

            var books = query
                .Skip((pageNum - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                books,
                totalBooks
            });
        }

        [HttpGet("categories")]
        public IActionResult GetCategories()
        {
            var categories = _context.Books
                .Select(b => b.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToList();

            return Ok(categories);
        }
    }
}
