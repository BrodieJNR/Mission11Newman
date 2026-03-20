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
            string sortOrder = "asc")
        {
            var query = _context.Books.AsQueryable();

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
    }
}
