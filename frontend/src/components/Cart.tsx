import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface CartLocationState {
  returnState?: {
    pageNum: number;
    pageSize: number;
    sortOrder: string;
    selectedCategory: string;
  };
}

function Cart() {
  const { cart, removeFromCart, clearCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // The book list passes its current page state here so we can return to it
  const returnState = (location.state as CartLocationState | null)?.returnState;

  const handleContinueShopping = () => {
    navigate('/', { state: returnState });
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="alert alert-info d-flex align-items-center gap-3">
          Your cart is empty.
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>
            Browse Books
          </button>
        </div>
      ) : (
        <>
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.book.bookId}>
                  <td>{item.book.title}</td>
                  <td>{item.book.author}</td>
                  <td>${item.book.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>${(item.book.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeFromCart(item.book.bookId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-secondary fw-bold">
              <tr>
                <td colSpan={4} className="text-end">
                  Total ({cartCount} {cartCount === 1 ? 'item' : 'items'}):
                </td>
                <td colSpan={2}>${cartTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={handleContinueShopping}>
              &larr; Continue Shopping
            </button>
            <button className="btn btn-outline-danger" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
