import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { getOrderById, type Order } from '../services/orderService';

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isSpanish, user } = useApp();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const content = {
    en: {
      title: 'Order Details',
      loading: 'Loading order...',
      notFound: 'Order not found',
      back: 'Back to Orders',
      loadFail: 'Failed to load order',
      subtotal: 'Subtotal',
      tax: 'Tax',
      shippingFee: 'Shipping Fee',
      total: 'Total',
      status: 'Status',
      quantity: 'Quantity',
      priceAtPurchase: 'Price at Purchase',
      customerOnly: 'Orders are only available for customer accounts',
      noImage: 'https://via.placeholder.com/120x120?text=No+Image',
    },
    es: {
      title: 'Detalles del Pedido',
      loading: 'Cargando pedido...',
      notFound: 'Pedido no encontrado',
      back: 'Volver a pedidos',
      loadFail: 'No se pudo cargar el pedido',
      subtotal: 'Subtotal',
      tax: 'Impuesto',
      shippingFee: 'Envío',
      total: 'Total',
      status: 'Estado',
      quantity: 'Cantidad',
      priceAtPurchase: 'Precio al comprar',
      customerOnly: 'Los pedidos solo están disponibles para cuentas de cliente',
      noImage: 'https://via.placeholder.com/120x120?text=No+Image',
    },
  };

  const active = isSpanish ? content.es : content.en;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      if (user.role !== 'CUSTOMER') {
        toast.error(active.customerOnly);
        navigate('/');
        return;
      }

      if (!id) return;

      try {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error('Failed to load order:', error);
        toast.error(active.loadFail);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user, navigate]);

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

  if (!order) {
    return (
      <div
        style={{
          paddingTop: '120px',
          paddingLeft: '2rem',
          paddingRight: '2rem',
        }}
      >
        <div className="loader">{active.notFound}</div>
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

        <button className="btn-dark" onClick={() => navigate('/orders')}>
          {active.back}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <p><strong>ID:</strong> {order.id}</p>
        <p><strong>{active.status}:</strong> {order.status}</p>
        <p><strong>{active.subtotal}:</strong> ${order.subtotal.toLocaleString()}</p>
        <p><strong>{active.tax}:</strong> ${order.tax.toLocaleString()}</p>
        <p><strong>{active.shippingFee}:</strong> ${order.shippingFee.toLocaleString()}</p>
        <p><strong>{active.total}:</strong> ${order.total.toLocaleString()}</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {order.items.map((item) => {
          const image =
            item.product.imageUrls && item.product.imageUrls.length > 0
              ? item.product.imageUrls[0]
              : active.noImage;

          return (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: '1rem',
                alignItems: 'center',
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
                <p>
                  <strong>{active.quantity}:</strong> {item.quantity}
                </p>
                <p>
                  <strong>{active.priceAtPurchase}:</strong> ${item.priceAtPurchase.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderDetailPage;