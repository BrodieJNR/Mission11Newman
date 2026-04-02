import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Book } from '../types/Book';
import { useCart } from '../context/CartContext';
import { fetchBooks, fetchCategories } from '../API/booksApi';
import Pagination from './Pagination';

interface RestoredState {
  pageNum?: number;
  pageSize?: number;
  sortOrder?: string;
  selectedCategory?: string;
}

function BookList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, cartCount, cartTotal } = useCart();

  const restored = location.state as RestoredState | null;

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState<number>(restored?.pageNum ?? 1);
  const [pageSize, setPageSize] = useState<number>(restored?.pageSize ?? 5);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<string>(
    restored?.sortOrder ?? 'asc'
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    restored?.selectedCategory ?? ''
  );

  // Fetch available categories once on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Restore page state when navigating back from cart
  useEffect(() => {
    if (restored) {
      setPageNum(restored.pageNum ?? 1);
      setPageSize(restored.pageSize ?? 5);
      setSortOrder(restored.sortOrder ?? 'asc');
      setSelectedCategory(restored.selectedCategory ?? '');
    }
  }, [location]);

  // Fetch books whenever page/filter/sort changes
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const data = await fetchBooks(pageSize, pageNum, selectedCategory, sortOrder);
        setBooks(data.books);
        setTotalPages(Math.ceil(data.totalBooks / pageSize));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [pageNum, pageSize, sortOrder, selectedCategory]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPageNum(1);
  }, [pageSize, sortOrder, selectedCategory]);

  const handleViewCart = () => {
    navigate('/cart', {
      state: {
        returnState: { pageNum, pageSize, sortOrder, selectedCategory },
      },
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">Error: {error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Bookstore</h1>

      {/* Bootstrap Grid: two-column layout — filters/controls left, cart summary right */}
      <div className="row g-3 mb-3">
        {/* Left column: Sort + Category filters */}
        <div className="col-md-8">
          {/* Sort Control */}
          <div className="mb-3">
            <label className="me-2 fw-bold">Sort by Title:</label>
            <button
              className={`btn btn-sm me-2 ${sortOrder === 'asc' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSortOrder('asc')}
            >
              A → Z
            </button>
            <button
              className={`btn btn-sm ${sortOrder === 'desc' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSortOrder('desc')}
            >
              Z → A
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-3">
            <label className="me-2 fw-bold">Filter by Category:</label>
            <button
              className={`btn btn-sm me-2 mb-1 ${selectedCategory === '' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setSelectedCategory('')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm me-2 mb-1 ${selectedCategory === cat ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Right column: Cart Summary Card (Bootstrap Card) */}
        <div className="col-md-4">
          <div className="card border-primary">
            <div className="card-header bg-primary text-white fw-bold">
              Cart Summary
            </div>
            <div className="card-body">
              <p className="card-text">
                Items in cart:{' '}
                {/* Bootstrap Badge */}
                <span className="badge bg-primary">{cartCount}</span>
              </p>
              <p className="card-text">
                Total: <strong>${cartTotal.toFixed(2)}</strong>
              </p>
              <button
                className="btn btn-primary w-100"
                onClick={handleViewCart}
                disabled={cartCount === 0}
              >
                View Cart
                {cartCount > 0 && (
                  <span className="badge bg-light text-primary ms-2">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Publisher</th>
            <th>ISBN</th>
            <th>Classification</th>
            <th>Category</th>
            <th>Pages</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.bookId}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.publisher}</td>
              <td>{book.isbn}</td>
              <td>{book.classification}</td>
              <td>{book.category}</td>
              <td>{book.pageCount}</td>
              <td>${book.price.toFixed(2)}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => addToCart(book)}
                >
                  Add to Cart
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={pageNum}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPageNum}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPageNum(1);
        }}
      />
    </div>
  );
}

export default BookList;
