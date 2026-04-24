import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/useApp';
import {
  getAdminAuditLogs,
  type AuditLogResponse,
} from '../services/adminService';

const AdminAuditLogsPage = () => {
  const { isSpanish, user } = useApp();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<AuditLogResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const content = {
    en: {
      title: 'Security Audit Logs',
      back: 'Back to Admin',
      loading: 'Retrieving audit history...',
      loadFail: 'Failed to load security records',
      accessDenied: 'Unauthorized: Admin access required',
      action: 'Action',
      userId: 'Operator ID',
      entityType: 'Entity Type',
      entityId: 'Reference ID',
      createdAt: 'Timestamp',
      noLogs: 'No audit records found in the system',
    },
    es: {
      title: 'Registros de Auditoría',
      back: 'Volver al Admin',
      loading: 'Recuperando historial...',
      loadFail: 'Error al cargar los registros de seguridad',
      accessDenied: 'No autorizado: Acceso solo para administradores',
      action: 'Acción',
      userId: 'ID de Operador',
      entityType: 'Tipo de Entidad',
      entityId: 'ID de Referencia',
      createdAt: 'Fecha y Hora',
      noLogs: 'No se encontraron registros de auditoría',
    },
  };

  const active = isSpanish ? content.es : content.en;

  useEffect(() => {
    const fetchAuditLogs = async () => {
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
        // Fetching initial page with 20 items for high visibility
        const data = await getAdminAuditLogs(1, 20);
        setLogs(data);
      } catch (error) {
        console.error('Audit Log Retrieval Error:', error);
        toast.error(active.loadFail);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [user, navigate, active.accessDenied, active.loadFail]);

  if (loading) {
    return (
      <div style={{ paddingTop: '120px', paddingLeft: '2rem', paddingRight: '2rem' }}>
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
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div
        className="dashboard-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <h2 className="text-reveal" style={{ margin: 0, fontSize: '2rem' }}>
          {active.title}
        </h2>

        <button className="btn-dark" onClick={() => navigate('/admin')}>
          {active.back}
        </button>
      </div>

      {!logs || logs.items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ opacity: 0.6 }}>{active.noLogs}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {logs.items.map((log, index) => (
            <div 
              key={log.id || index} 
              className="glass-panel" 
              style={{ 
                padding: '1.5rem 2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                borderLeft: '4px solid #d4af37' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block', textTransform: 'uppercase' }}>
                    {active.action}
                  </span>
                  <strong style={{ fontSize: '1.1rem', color: '#d4af37', fontFamily: 'monospace' }}>
                    {log.action}
                  </strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block', textTransform: 'uppercase' }}>
                    {active.createdAt}
                  </span>
                  <span style={{ fontSize: '0.9rem' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block' }}>{active.userId}</span>
                  <code style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>{log.userId || 'SYSTEM'}</code>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block' }}>{active.entityType}</span>
                  <span style={{ fontSize: '0.9rem' }}>{log.entityType || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block' }}>{active.entityId}</span>
                  <code style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>{log.entityId || '-'}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;