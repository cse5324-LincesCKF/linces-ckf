import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
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
      back: 'Back',
      loading: 'Loading users...',
      loadFail: 'Failed to load users',
      accessDenied: 'Only administrators can access this page',
      deactivate: 'Deactivate',
      deactivateSuccess: 'User deactivated successfully',
      deactivateFail: 'Failed to deactivate user',
      active: 'Active',
      inactive: 'Inactive',
      status: 'Status',
      role: 'Role',
      email: 'Email',
      name: 'Name',
    },
    es: {
      title: 'Gestión de Usuarios',
      back: 'Volver',
      loading: 'Cargando usuarios...',
      loadFail: 'No se pudieron cargar los usuarios',
      accessDenied: 'Solo los administradores pueden acceder a esta página',
      deactivate: 'Desactivar',
      deactivateSuccess: 'Usuario desactivado con éxito',
      deactivateFail: 'No se pudo desactivar el usuario',
      active: 'Activo',
      inactive: 'Inactivo',
      status: 'Estado',
      role: 'Rol',
      email: 'Correo',
      name: 'Nombre',
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
        console.error('Failed to load users:', error);
        toast.error(activeText.loadFail);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate]);

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateAdminUser(id);
      setUsers((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: false } : item
        )
      );
      toast.success(activeText.deactivateSuccess);
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      toast.error(activeText.deactivateFail);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '120px', paddingLeft: '2rem', paddingRight: '2rem' }}>
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
          {activeText.title}
        </h2>

        <button className="btn-dark" onClick={() => navigate('/admin')}>
          {activeText.back}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {users.map((item) => (
          <div key={item.id} className="glass-panel" style={{ padding: '1.5rem' }}>
            <p><strong>{activeText.name}:</strong> {item.name || '-'}</p>
            <p><strong>{activeText.email}:</strong> {item.email}</p>
            <p><strong>{activeText.role}:</strong> {item.role}</p>
            <p>
              <strong>{activeText.status}:</strong>{' '}
              {item.isActive ? activeText.active : activeText.inactive}
            </p>

            {item.isActive && (
              <button
                className="btn-dark"
                style={{ marginTop: '1rem' }}
                onClick={() => handleDeactivate(item.id)}
              >
                {activeText.deactivate}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersPage;