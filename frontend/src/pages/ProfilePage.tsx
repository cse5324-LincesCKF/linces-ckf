import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/useApp';
import {
  getProfile,
  updateUserProfile,
  updatePassword,
  deleteAccount,
  type UserProfile,
} from '../services/userService';

const ProfilePage = () => {
  const { isSpanish, login, logout } = useApp();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [languagePreference, setLanguagePreference] = useState<'EN' | 'ES'>('EN');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const content = {
    en: {
      title: 'My Profile',
      loading: 'Loading profile...',
      profileInfo: 'Profile Information',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      language: 'Language Preference',
      saveProfile: 'Save Profile',
      passwordSection: 'Change Password',
      oldPassword: 'Current Password',
      newPassword: 'New Password',
      updatePassword: 'Update Password',
      deleteSection: 'Danger Zone',
      deleteAccount: 'Delete Account',
      deleteConfirm: 'Are you sure you want to delete your account?',
      saveSuccess: 'Profile updated successfully',
      saveFail: 'Failed to update profile',
      passwordSuccess: 'Password updated successfully',
      passwordFail: 'Failed to update password',
      deleteSuccess: 'Account deleted successfully',
      deleteFail: 'Failed to delete account',
      passwordHint: 'Password must include at least one letter and one number.',
      backHome: 'Back to Home',
      customer: 'Customer',
      retailer: 'Brand / Retailer',
      admin: 'Administrator',
    },
    es: {
      title: 'Mi Perfil',
      loading: 'Cargando perfil...',
      profileInfo: 'Información del perfil',
      name: 'Nombre',
      email: 'Correo electrónico',
      role: 'Rol',
      language: 'Preferencia de idioma',
      saveProfile: 'Guardar perfil',
      passwordSection: 'Cambiar contraseña',
      oldPassword: 'Contraseña actual',
      newPassword: 'Nueva contraseña',
      updatePassword: 'Actualizar contraseña',
      deleteSection: 'Zona de peligro',
      deleteAccount: 'Eliminar cuenta',
      deleteConfirm: '¿Está seguro de que desea eliminar su cuenta?',
      saveSuccess: 'Perfil actualizado con éxito',
      saveFail: 'No se pudo actualizar el perfil',
      passwordSuccess: 'Contraseña actualizada con éxito',
      passwordFail: 'No se pudo actualizar la contraseña',
      deleteSuccess: 'Cuenta eliminada con éxito',
      deleteFail: 'No se pudo eliminar la cuenta',
      passwordHint: 'La contraseña debe incluir al menos una letra y un número.',
      backHome: 'Volver al inicio',
      customer: 'Cliente',
      retailer: 'Marca / Minorista',
      admin: 'Administrador',
    },
  };

  const active = isSpanish ? content.es : content.en;

  const formatRole = (role?: string) => {
    if (role === 'CUSTOMER') return active.customer;
    if (role === 'BRAND_RETAILER') return active.retailer;
    if (role === 'ADMINISTRATOR') return active.admin;
    return role ?? '';
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
        setName(data.name);
        setLanguagePreference(data.languagePreference);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error(active.saveFail);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profile) return;

    try {
      const updated = await updateUserProfile(profile.id, {
        name,
        languagePreference,
      });

      setProfile(updated);

      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        login(savedToken, {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
        });
      }

      toast.success(active.saveSuccess);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(active.saveFail);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profile) return;

    try {
      await updatePassword(profile.id, {
        oldPassword,
        newPassword,
      });

      setOldPassword('');
      setNewPassword('');
      toast.success(active.passwordSuccess);
    } catch (error) {
      console.error('Failed to update password:', error);
      toast.error(active.passwordFail);
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;

    const confirmed = window.confirm(active.deleteConfirm);
    if (!confirmed) return;

    try {
      await deleteAccount(profile.id);
      toast.success(active.deleteSuccess);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error(active.deleteFail);
    }
  };

  if (loading) {
    return <div className="loader">{active.loading}</div>;
  }

  if (!profile) {
    return <div className="loader">{active.saveFail}</div>;
  }

  return (
    <div className="dashboard-container fade-in" style={{ padding: '2rem' }}>
      <div
        className="dashboard-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h2 className="text-reveal">{active.title}</h2>
        <button className="secondary-btn" onClick={() => navigate('/')}>
          {active.backHome}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          maxWidth: '720px',
        }}
      >
        <form className="glass-panel" onSubmit={handleProfileSave} style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{active.profileInfo}</h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label>{active.name}</label>
              <input
                className="custom-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                required
              />
            </div>

            <div>
              <label>{active.email}</label>
              <input className="custom-input" value={profile.email} disabled />
            </div>

            <div>
              <label>{active.role}</label>
              <input className="custom-input" value={formatRole(profile.role)} disabled />
            </div>

            <div>
              <label>{active.language}</label>
              <select
                className="custom-input"
                value={languagePreference}
                onChange={(e) =>
                  setLanguagePreference(e.target.value as 'EN' | 'ES')
                }
              >
                <option value="EN">English</option>
                <option value="ES">Español</option>
              </select>
            </div>

            <button type="submit" className="secondary-btn">
              {active.saveProfile}
            </button>
          </div>
        </form>

        <form className="glass-panel" onSubmit={handlePasswordUpdate} style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{active.passwordSection}</h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label>{active.oldPassword}</label>
              <input
                className="custom-input"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label>{active.newPassword}</label>
              <input
                className="custom-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <small style={{ display: 'block', marginTop: '6px' }}>
                {active.passwordHint}
              </small>
            </div>

            <button type="submit" className="secondary-btn">
              {active.updatePassword}
            </button>
          </div>
        </form>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{active.deleteSection}</h3>
          <button
            type="button"
            className="secondary-btn delete-btn"
            style={{
              backgroundColor: '#ff4d4f',
              color: '#fff',
              border: 'none',
            }}
            onClick={handleDeleteAccount}
          >
            {active.deleteAccount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;