import { useEffect, useState } from 'react';
import { Book } from '../types/Book';

function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<string>('asc');

  const totalPages = Math.ceil(totalBooks / pageSize);

  useEffect(() => {
    fetch(
      `https://localhost:7294/api/books?pageNum=${pageNum}&pageSize=${pageSize}&sortOrder=${sortOrder}`
    )
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.books);
        setTotalBooks(data.totalBooks);
      });
  }, [pageNum, pageSize, sortOrder]);

  // Reset to page 1 when pageSize or sortOrder changes
  useEffect(() => {
    setPageNum(1);
  }, [pageSize, sortOrder]);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Bookstore</h1>

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
          <li>
            <button className="page-link" onClick={() => setPageNum(pageNum - 1)}>
              Previous
            </button>
          </li>
          {[...Array(totalPages)].map((_, i) => (
            
              className={`page-item ${pageNum === i + 1 ? 'active' : ''}`}
            <li>
              <button className="page-link" onClick={() => setPageNum(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}
          <li>
            <button className="page-link" onClick={() => setPageNum(pageNum + 1)}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default BookList;
