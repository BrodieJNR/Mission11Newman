import type { Book } from '../types/Book';

const API_URL = 'https://localhost:7294';

interface FetchBooksResponse {
  books: Book[];
  totalBooks: number;
}

export const fetchBooks = async (
  pageSize: number,
  pageNum: number,
  category: string,
  sortOrder: string = 'asc'
): Promise<FetchBooksResponse> => {
  try {
    const categoryParam = category
      ? `&category=${encodeURIComponent(category)}`
      : '';
    const response = await fetch(
      `${API_URL}/api/books?pageNum=${pageNum}&pageSize=${pageSize}&sortOrder=${sortOrder}${categoryParam}`
    );
    if (!response.ok) throw new Error('Failed to fetch books');
    return await response.json();
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const fetchCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/api/books/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const addBook = async (newBook: Omit<Book, 'bookId'>): Promise<Book> => {
  try {
    const response = await fetch(`${API_URL}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook),
    });
    if (!response.ok) throw new Error('Failed to add book');
    return await response.json();
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

export const updateBook = async (
  id: number,
  updatedBook: Book
): Promise<Book> => {
  try {
    const response = await fetch(`${API_URL}/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBook),
    });
    if (!response.ok) throw new Error('Failed to update book');
    return await response.json();
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

export const deleteBook = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/books/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete book');
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};
