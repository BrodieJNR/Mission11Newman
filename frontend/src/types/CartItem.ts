import type { Book } from './Book';

export interface CartItem {
  book: Book;
  quantity: number;
}
