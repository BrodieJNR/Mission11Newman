import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Book } from '../types/Book';
import { useCart } from '../context/CartContext';

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

  // Restore state if coming back from the cart via "Continue Shopping"
  const restored = location.state as RestoredState | null;

  const [books, setBooks] = useState<Book[]>([]);
  const [pageNum, setPageNum] = useState<number>(restored?.pageNum ?? 1);
  const [pageSize, setPageSize] = useState<number>(restored?.pageSize ?? 5);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<string>(restored?.sortOrder ?? 'asc');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    restored?.selectedCategory ?? ''
  );

  const totalPages = Math.ceil(totalBooks / pageSize);

  // Fetch available categories once on mount
  useEffect(() => {
    fetch('https://localhost:7294/api/books/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error('Error fetching categories:', error));
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
    const categoryParam = selectedCategory
      ? `&category=${encodeURIComponent(selectedCategory)}`
      : '';
    fetch(
      `https://localhost:7294/api/books?pageNum=${pageNum}&pageSize=${pageSize}&sortOrder=${sortOrder}${categoryParam}`
    )
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.books);
        setTotalBooks(data.totalBooks);
      })
      .catch((error) => console.error('Error fetching books:', error));
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

        {/* Right column: Cart Summary Card (Bootstrap Card — new Bootstrap feature #1) */}
        <div className="col-md-4">
          <div className="card border-primary">
            <div className="card-header bg-primary text-white fw-bold">
              Cart Summary
            </div>
            <div className="card-body">
              <p className="card-text">
                Items in cart:{' '}
                {/* Bootstrap Badge — new Bootstrap feature #2 */}
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

      {/* Results per Page */}
      <div className="mb-3">
        <label className="me-2 fw-bold">Results per page:</label>
        {[5, 10, 25].map((size) => (
          <button
            key={size}
            className={`btn btn-sm me-2 ${pageSize === size ? 'btn-secondary' : 'btn-outline-secondary'}`}
            onClick={() => setPageSize(size)}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Pagination Controls */}
      <nav>
        <ul className="pagination">
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => setPageNum(pageNum - 1)}
              disabled={pageNum === 1}
            >
              Previous
            </button>
          </li>
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${pageNum === i + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setPageNum(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => setPageNum(pageNum + 1)}
              disabled={pageNum === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default BookList;
