import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/useApp';
import { createOrder } from '../services/orderService';
import {
  getCart,
  updateCartItem,
  removeCartItem,
  type CartResponse,
} from '../services/cartService';

const CartPage = () => {
  const { isSpanish, user } = useApp();
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const content = {
    en: {
      title: 'Shopping Cart',
      loading: 'Loading cart...',
      empty: 'Your cart is empty',
      back: 'Back to Shop',
      quantity: 'Quantity',
      remove: 'Remove',
      subtotal: 'Subtotal',
      itemCount: 'Items',
      updateFail: 'Failed to update cart item',
      removeFail: 'Failed to remove cart item',
      cartLoadFail: 'Failed to load cart',
      cartOnlyCustomer: 'Cart is only available for customer accounts',
      noImage: 'https://via.placeholder.com/120x120?text=No+Image',
      checkout: 'Place Order',
      checkoutSuccess: 'Order created successfully',
      checkoutFail: 'Failed to create order',
    },
    es: {
      title: 'Carrito de Compras',
      loading: 'Cargando carrito...',
      empty: 'Tu carrito está vacío',
      back: 'Volver a comprar',
      quantity: 'Cantidad',
      remove: 'Eliminar',
      subtotal: 'Subtotal',
      itemCount: 'Artículos',
      updateFail: 'No se pudo actualizar el artículo del carrito',
      removeFail: 'No se pudo eliminar el artículo del carrito',
      cartLoadFail: 'No se pudo cargar el carrito',
      cartOnlyCustomer: 'El carrito solo está disponible para cuentas de cliente',
      noImage: 'https://via.placeholder.com/120x120?text=No+Image',
      checkout: 'Realizar pedido',
      checkoutSuccess: 'Pedido creado con éxito',
      checkoutFail: 'No se pudo crear el pedido',
    },
  };

  const active = isSpanish ? content.es : content.en;

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      if (user.role !== 'CUSTOMER') {
        toast.error(active.cartOnlyCustomer);
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const data = await getCart();
        setCart(data);
      } catch (error) {
        console.error('Failed to load cart:', error);
        toast.error(active.cartLoadFail);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, navigate]);

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const updatedCart = await updateCartItem(itemId, { quantity });
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to update cart item:', error);
      toast.error(active.updateFail);
    }
  };

    const handleCheckout = async () => {
     try {
      const order = await createOrder();
        toast.success(active.checkoutSuccess);
        navigate(`/orders/${order.id}`);
    } catch (error) {
     console.error('Failed to create order:', error);
        toast.error(active.checkoutFail);
    }
};

  const handleRemove = async (itemId: string) => {
    try {
      const updatedCart = await removeCartItem(itemId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      toast.error(active.removeFail);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          paddingTop: '120px',
          paddingLeft: '2rem',
          paddingRight: '2rem',
        }}
      >
        <div className="loader">{active.loading}</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div
        className="dashboard-container fade-in"
        style={{
          paddingTop: '120px',
          paddingLeft: '2rem',
          paddingRight: '2rem',
          paddingBottom: '2rem',
        }}
      >
        <h2 className="text-reveal" style={{ marginBottom: '1.5rem' }}>
          {active.title}
        </h2>

        <p style={{ marginBottom: '1.5rem' }}>{active.empty}</p>

        <button className="btn-dark" onClick={() => navigate('/')}>
          {active.back}
        </button>
      </div>
    );
  }

  return (
    <div
      className="dashboard-container fade-in"
      style={{
        paddingTop: '120px',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        paddingBottom: '2rem',
      }}
    >
      <div
        className="dashboard-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h2 className="text-reveal" style={{ margin: 0 }}>
          {active.title}
        </h2>

        <button className="btn-dark" onClick={() => navigate('/')}>
          {active.back}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {cart.items.map((item) => {
            const image =
              item.product.imageUrls && item.product.imageUrls.length > 0
                ? item.product.imageUrls[0]
                : active.noImage;

            return (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr auto auto',
                  gap: '1rem',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  paddingBottom: '1rem',
                }}
              >
                <img
                  src={image}
                  alt={isSpanish ? item.product.name_es : item.product.name_en}
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                />

                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    {isSpanish ? item.product.name_es : item.product.name_en}
                  </h3>

                  <p style={{ marginBottom: '0.5rem' }}>
                    ${item.product.price.toLocaleString()}
                  </p>

                  <p>
                    {active.quantity}:{' '}
                    <input
                      type="number"
                      min="1"
                      max={item.product.stockQuantity}
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, Number(e.target.value))
                      }
                      style={{
                        width: '80px',
                        marginLeft: '0.5rem',
                        padding: '6px 8px',
                        borderRadius: '8px',
                        border: '1px solid #333',
                        backgroundColor: '#111',
                        color: '#fff',
                      }}
                    />
                  </p>
                </div>

                <div>
                  <strong>${item.lineTotal.toLocaleString()}</strong>
                </div>

                <button
                  className="btn-dark"
                  onClick={() => handleRemove(item.id)}
                >
                  {active.remove}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <p>
                {active.itemCount}: <strong>{cart.totals.itemCount}</strong>
            </p>

            <p style={{ marginBottom: '1rem' }}>
                 {active.subtotal}: <strong>${cart.totals.subtotal.toLocaleString()}</strong>
            </p>

            <button className="btn-dark" onClick={handleCheckout}>
                {active.checkout}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;