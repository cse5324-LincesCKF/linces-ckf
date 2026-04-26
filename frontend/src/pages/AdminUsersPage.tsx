import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/useApp';
import {
  deactivateAdminUser,
  getAdminUsers,
  type AdminUser,
} from '../services/adminService';

const AdminUsersPage = () => {
  const { isSpanish, user } = useApp();
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const content = {
    en: {
      title: 'User Management',
      back: 'Back to Admin',
      loading: 'Fetching user registry...',
      loadFail: 'Failed to retrieve user data',
      accessDenied: 'Unauthorized: Admin access only',
      deactivate: 'Deactivate Account',
      deactivateSuccess: 'User successfully deactivated',
      deactivateFail: 'Critical: Failed to deactivate user',
      active: 'Active',
      inactive: 'Inactive',
      status: 'Current Status',
      role: 'Assigned Role',
      email: 'Email Address',
      name: 'Full Name',
    },
    es: {
      title: 'Gestión de Usuarios',
      back: 'Volver al Admin',
      loading: 'Buscando registro de usuarios...',
      loadFail: 'No se pudieron recuperar los datos de usuario',
      accessDenied: 'No autorizado: Solo acceso para administradores',
      deactivate: 'Desactivar Cuenta',
      deactivateSuccess: 'Usuario desactivado con éxito',
      deactivateFail: 'Crítico: No se pudo desactivar el usuario',
      active: 'Activo',
      inactive: 'Inactivo',
      status: 'Estado Actual',
      role: 'Rol Asignado',
      email: 'Correo Electrónico',
      name: 'Nombre Completo',
    },
  };

  const activeText = isSpanish ? content.es : content.en;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      if (user.role !== 'ADMINISTRATOR') {
        toast.error(activeText.accessDenied);
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const data = await getAdminUsers();
        setUsers(data);
      } catch (error) {
        console.error('User Fetch Error:', error);
        toast.error(activeText.loadFail);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate, activeText.accessDenied, activeText.loadFail]);

  const handleDeactivate = async (id: string) => {
    // Basic confirmation before taking destructive action
    if (!window.confirm(isSpanish ? '¿Confirmar desactivación?' : 'Confirm deactivation?')) return;

    try {
      await deactivateAdminUser(id);
      setUsers((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: false } : item
        )
      );
      toast.success(activeText.deactivateSuccess);
    } catch (error) {
      console.error('Deactivation Error:', error);
      toast.error(activeText.deactivateFail);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center' }}>
        <div className="loader">{activeText.loading}</div>
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
          {activeText.title}
        </h2>

        <button className="btn-dark" onClick={() => navigate('/admin')}>
          {activeText.back}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {users.map((item) => (
          <div key={item.id} className="glass-panel" style={{ padding: '2rem', position: 'relative' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span 
                className="role-badge" 
                style={{ 
                  fontSize: '0.7rem', 
                  background: 'rgba(212, 175, 55, 0.1)', 
                  padding: '4px 10px', 
                  borderRadius: '12px',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#d4af37'
                }}
              >
                {item.role}
              </span>
            </div>

            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{item.name || 'Anonymous User'}</h4>
            <p style={{ margin: '0 0 1rem 0', opacity: 0.7, fontSize: '0.9rem' }}>{item.email}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block' }}>{activeText.status}</span>
                <span style={{ color: item.isActive ? '#4caf50' : '#ff4d4f', fontWeight: 600 }}>
                  {item.isActive ? activeText.active : activeText.inactive}
                </span>
              </div>

              {item.isActive && item.id !== user?.id && (
                <button
                  className="secondary-btn"
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                  onClick={() => handleDeactivate(item.id)}
                >
                  {activeText.deactivate}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersPage;