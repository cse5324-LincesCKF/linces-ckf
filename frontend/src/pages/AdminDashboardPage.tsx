import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/useApp';
import {
  getAdminDashboard,
  type AdminDashboardSummary,
} from '../services/adminService';

const AdminDashboardPage = () => {
  const { isSpanish, user } = useApp();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const content = {
    en: {
      title: 'Admin Dashboard',
      back: 'Back',
      loading: 'Loading dashboard...',
      loadFail: 'Failed to load dashboard',
      accessDenied: 'Only administrators can access this page',
      totalUsers: 'Total Users',
      totalProducts: 'Total Products',
      totalOrders: 'Total Orders',
      openQuotes: 'Open Quotes',
      manageUsers: 'Manage Users',
      auditLogs: 'Audit Logs',
    },
    es: {
      title: 'Panel de Administración',
      back: 'Volver',
      loading: 'Cargando panel...',
      loadFail: 'No se pudo cargar el panel',
      accessDenied: 'Solo los administradores pueden acceder a esta página',
      totalUsers: 'Usuarios Totales',
      totalProducts: 'Productos Totales',
      totalOrders: 'Pedidos Totales',
      openQuotes: 'Cotizaciones Abiertas',
      manageUsers: 'Gestionar Usuarios',
      auditLogs: 'Registros de Auditoría',
    },
  };

  const active = isSpanish ? content.es : content.en;

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      if (user.role !== 'ADMINISTRATOR') {
        toast.error(active.accessDenied);
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const data = await getAdminDashboard();
        setSummary(data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        toast.error(active.loadFail);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, navigate]);

  if (loading) {
    return (
      <div style={{ paddingTop: '120px', paddingLeft: '2rem', paddingRight: '2rem' }}>
        <div className="loader">{active.loading}</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={{ paddingTop: '120px', paddingLeft: '2rem', paddingRight: '2rem' }}>
        <div className="loader">{active.loadFail}</div>
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
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <h2 className="text-reveal" style={{ margin: 0 }}>
          {active.title}
        </h2>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-dark" onClick={() => navigate('/admin/users')}>
            {active.manageUsers}
          </button>

          <button className="btn-dark" onClick={() => navigate('/admin/audit')}>
            {active.auditLogs}
          </button>

          <button className="btn-dark" onClick={() => navigate('/')}>
            {active.back}
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>{active.totalUsers}</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{summary.totalUsers}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>{active.totalProducts}</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{summary.totalProducts}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>{active.totalOrders}</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{summary.totalOrders}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>{active.openQuotes}</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{summary.openQuotes}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;