import { useEffect, useState } from 'react';
import type { Book } from '../types/Book';
import { fetchBooks, deleteBook } from '../API/booksApi';
import NewBookForm from './NewBookForm';
import EditBookForm from './EditBookForm';
import Pagination from './Pagination';

function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await fetchBooks(pageSize, pageNum, '');
      setBooks(data.books);
      setTotalPages(Math.ceil(data.totalBooks / pageSize));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [pageNum, pageSize]);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this book?');
    if (!confirmed) return;

    try {
      await deleteBook(id);
      setBooks(books.filter((b) => b.bookId !== id));
    } catch {
      alert('Failed to delete. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">Error: {error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Admin — Manage Books</h1>

      {showAddForm ? (
        <NewBookForm
          onSuccess={() => {
            setShowAddForm(false);
            loadBooks();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <button
          className="btn btn-success mb-3"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Book
        </button>
      )}

      {editingBook && (
        <EditBookForm
          book={editingBook}
          onSuccess={() => {
            setEditingBook(null);
            loadBooks();
          }}
          onCancel={() => setEditingBook(null)}
        />
      )}

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
            <th>Actions</th>
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
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setEditingBook(book)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(book.bookId)}
                  >
                    Delete
                  </button>
                </div>
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

export default AdminBooks;
