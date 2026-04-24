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
      title: 'Admin Control Center',
      back: 'Return to Showroom',
      loading: 'Authorizing access...',
      loadFail: 'Failed to retrieve administrative data',
      accessDenied: 'Unauthorized: Administrative privileges required',
      totalUsers: 'User Base',
      totalProducts: 'Inventory Items',
      totalOrders: 'Completed Sales',
      openQuotes: 'Pending B2B Quotes',
      manageUsers: 'User Management',
      auditLogs: 'Security Audit',
    },
    es: {
      title: 'Centro de Control Administrativo',
      back: 'Volver al Showroom',
      loading: 'Autorizando acceso...',
      loadFail: 'No se pudieron recuperar los datos administrativos',
      accessDenied: 'No autorizado: se requieren privilegios administrativos',
      totalUsers: 'Base de Usuarios',
      totalProducts: 'Artículos de Inventario',
      totalOrders: 'Ventas Completadas',
      openQuotes: 'Cotizaciones B2B Pendientes',
      manageUsers: 'Gestión de Usuarios',
      auditLogs: 'Auditoría de Seguridad',
    },
  };

  const active = isSpanish ? content.es : content.en;

  useEffect(() => {
    const fetchDashboard = async () => {
      // Logic gate: If no user or not an admin, kick them out
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
        console.error('Admin Fetch Error:', error);
        toast.error(active.loadFail);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, navigate, active.accessDenied, active.loadFail]);

  if (loading) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center' }}>
        <div className="loader">{active.loading}</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center' }}>
        <p className="error-text">{active.loadFail}</p>
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
        maxWidth: '1400px',
        margin: '0 auto'
      }}
    >
      <div
        className="dashboard-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 className="text-reveal" style={{ margin: 0, fontSize: '2.5rem' }}>
            {active.title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
            {isSpanish ? 'Resumen del sistema en tiempo real' : 'Real-time system overview'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="secondary-btn" onClick={() => navigate('/admin/users')}>
            {active.manageUsers}
          </button>

          <button className="secondary-btn" onClick={() => navigate('/admin/audit')}>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {active.totalUsers}
          </h3>
          <p style={{ fontSize: '3rem', fontWeight: 700, margin: 0 }}>{summary.totalUsers}</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {active.totalProducts}
          </h3>
          <p style={{ fontSize: '3rem', fontWeight: 700, margin: 0 }}>{summary.totalProducts}</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {active.totalOrders}
          </h3>
          <p style={{ fontSize: '3rem', fontWeight: 700, margin: 0 }}>{summary.totalOrders}</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {active.openQuotes}
          </h3>
          <p style={{ fontSize: '3rem', fontWeight: 700, margin: 0 }}>{summary.openQuotes}</p>
        </div>
      </div>
      
      <div className="ambient-glow" style={{ top: '10%', right: '5%', opacity: 0.1 }}></div>
    </div>
  );
};

export default AdminDashboardPage;