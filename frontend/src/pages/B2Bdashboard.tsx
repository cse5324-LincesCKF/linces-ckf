import { useApp } from '../context/AppContext';

const B2BDashboard = () => {
  const { isSpanish } = useApp();

  const content = {
    en: {
      title: "Manufacturing Dashboard",
      stats: "Production Queue",
      activeOrders: "Active Bulk Orders",
      tracking: "Logistics Status"
    },
    es: {
      title: "Panel de Fabricación",
      stats: "Cola de Producción",
      activeOrders: "Pedidos al por Mayor Activos",
      tracking: "Estado de Logística"
    }
  };

  const active = isSpanish ? content.es : content.en;

  return (
    <div className="hero-section dashboard-container">
      <div className="glass-panel" style={{ width: '80%', padding: '3rem', textAlign: 'left' }}>
        <h2 className="text-reveal" style={{ fontSize: '2.5rem' }}>{active.title}</h2>
        
        <div className="feature-grid" style={{ padding: '2rem 0', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="glass-panel feature-card">
            <span className="status-indicator">{active.stats}</span>
            <h4 style={{ fontSize: '2rem', marginTop: '1rem' }}>12</h4>
          </div>
          <div className="glass-panel feature-card">
            <span className="status-indicator">{active.activeOrders}</span>
            <h4 style={{ fontSize: '2rem', marginTop: '1rem' }}>4</h4>
          </div>
          <div className="glass-panel feature-card">
            <span className="status-indicator">{active.tracking}</span>
            <h4 style={{ fontSize: '2rem', marginTop: '1rem', color: '#4CAF50' }}>On Time</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BDashboard;