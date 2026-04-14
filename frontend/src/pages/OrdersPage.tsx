import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/useApp';
import { getOrdersForUser, type Order } from '../services/orderService';

const OrdersPage = () => {
  const { isSpanish, user } = useApp();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const content = {
    en: {
      title: 'My Orders',
      loading: 'Loading orders...',
      empty: 'No orders found',
      back: 'Back to Shop',
      loadFail: 'Failed to load orders',
      total: 'Total',
      status: 'Status',
      createdAt: 'Created At',
      viewDetails: 'View Details',
      customerOnly: 'Orders are only available for customer accounts',
    },
    es: {
      title: 'Mis Pedidos',
      loading: 'Cargando pedidos...',
      empty: 'No se encontraron pedidos',
      back: 'Volver a comprar',
      loadFail: 'No se pudieron cargar los pedidos',
      total: 'Total',
      status: 'Estado',
      createdAt: 'Creado',
      viewDetails: 'Ver detalles',
      customerOnly: 'Los pedidos solo están disponibles para cuentas de cliente',
    },
  };

  const active = isSpanish ? content.es : content.en;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      if (user.role !== 'CUSTOMER') {
        toast.error(active.customerOnly);
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const data = await getOrdersForUser(user.id || '');
        setOrders(data);
      } catch (error) {
        console.error('Failed to load orders:', error);
        toast.error(active.loadFail);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

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

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <p>{active.empty}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <p><strong>ID:</strong> {order.id}</p>
                  <p><strong>{active.status}:</strong> {order.status}</p>
                  <p><strong>{active.total}:</strong> ${order.total.toLocaleString()}</p>
                  <p><strong>{active.createdAt}:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <button
                  className="btn-dark"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  {active.viewDetails}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;