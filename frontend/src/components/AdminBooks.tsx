import { useEffect, useState } from 'react';
import type { Book } from '../types/Book';

const API = 'https://localhost:7294/api/books';

// Empty form state for adding a new book
const emptyForm: Omit<Book, 'bookId'> = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
};

function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [formData, setFormData] = useState<Omit<Book, 'bookId'>>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Load all books (no pagination needed for admin view)
  const loadBooks = () => {
    fetch(`${API}?pageNum=1&pageSize=1000`)
      .then((res) => res.json())
      .then((data) => setBooks(data.books))
      .catch((err) => console.error('Error loading books:', err));
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'pageCount' || name === 'price' ? Number(value) : value,
    }));
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (book: Book) => {
    setEditingId(book.bookId);
    setFormData({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      classification: book.classification,
      category: book.category,
      pageCount: book.pageCount,
      price: book.price,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    fetch(`${API}/${id}`, { method: 'DELETE' })
      .then(() => loadBooks())
      .catch((err) => console.error('Error deleting book:', err));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      // Update existing book
      fetch(`${API}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, bookId: editingId }),
      })
        .then(() => {
          loadBooks();
          setShowForm(false);
        })
        .catch((err) => console.error('Error updating book:', err));
    } else {
      // Add new book
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(() => {
          loadBooks();
          setShowForm(false);
        })
        .catch((err) => console.error('Error adding book:', err));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(emptyForm);
    setEditingId(null);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Admin — Manage Books</h1>

      <button className="btn btn-success mb-3" onClick={handleAdd}>
        + Add New Book
      </button>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header bg-success text-white fw-bold">
            {editingId !== null ? 'Edit Book' : 'Add New Book'}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Title & Author */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Title</label>
                  <input className="form-control" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Author</label>
                  <input className="form-control" name="author" value={formData.author} onChange={handleChange} required />
                </div>
                {/* Publisher & ISBN */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Publisher</label>
                  <input className="form-control" name="publisher" value={formData.publisher} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">ISBN</label>
                  <input className="form-control" name="isbn" value={formData.isbn} onChange={handleChange} required />
                </div>
                {/* Classification & Category */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Classification</label>
                  <input className="form-control" name="classification" value={formData.classification} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Category</label>
                  <input className="form-control" name="category" value={formData.category} onChange={handleChange} required />
                </div>
                {/* Page Count & Price */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Page Count</label>
                  <input className="form-control" type="number" name="pageCount" value={formData.pageCount} onChange={handleChange} required min={1} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Price ($)</label>
                  <input className="form-control" type="number" name="price" value={formData.price} onChange={handleChange} required min={0} step={0.01} />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary">
                  {editingId !== null ? 'Save Changes' : 'Add Book'}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEdit(book)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
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
    </div>
  );
}

export default AdminBooks;
