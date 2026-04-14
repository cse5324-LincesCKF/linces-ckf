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
      title: 'Audit Logs',
      back: 'Back',
      loading: 'Loading audit logs...',
      loadFail: 'Failed to load audit logs',
      accessDenied: 'Only administrators can access this page',
      action: 'Action',
      userId: 'User ID',
      entityType: 'Entity Type',
      entityId: 'Entity ID',
      createdAt: 'Created At',
      noLogs: 'No audit logs found',
    },
    es: {
      title: 'Registros de Auditoría',
      back: 'Volver',
      loading: 'Cargando registros...',
      loadFail: 'No se pudieron cargar los registros',
      accessDenied: 'Solo los administradores pueden acceder a esta página',
      action: 'Acción',
      userId: 'ID de Usuario',
      entityType: 'Tipo de Entidad',
      entityId: 'ID de Entidad',
      createdAt: 'Creado',
      noLogs: 'No se encontraron registros',
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
        const data = await getAdminAuditLogs(1, 20);
        setLogs(data);
      } catch (error) {
        console.error('Failed to load audit logs:', error);
        toast.error(active.loadFail);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [user, navigate]);

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

        <button className="btn-dark" onClick={() => navigate('/admin')}>
          {active.back}
        </button>
      </div>

      {!logs || logs.items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p>{active.noLogs}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {logs.items.map((log, index) => (
            <div key={log.id || index} className="glass-panel" style={{ padding: '1.5rem' }}>
              <p><strong>{active.action}:</strong> {log.action}</p>
              <p><strong>{active.userId}:</strong> {log.userId || '-'}</p>
              <p><strong>{active.entityType}:</strong> {log.entityType || '-'}</p>
              <p><strong>{active.entityId}:</strong> {log.entityId || '-'}</p>
              <p><strong>{active.createdAt}:</strong> {log.createdAt || '-'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;