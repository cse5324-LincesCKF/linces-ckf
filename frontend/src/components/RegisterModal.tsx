import { useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

interface User {
  id?: string;
  name?: string;
  email?: string;
  role: string;
}

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSpanish: boolean;
  onRegisterSuccess: (token: string, user: User) => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({
  isOpen,
  onClose,
  isSpanish,
  onRegisterSuccess,
  onSwitchToLogin,
}: RegisterModalProps) => {
  const [role, setRole] = useState<'CUSTOMER' | 'BRAND_RETAILER'>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const content = {
    en: {
      title: 'Create Account',
      sub: 'Register to access the showroom and services.',
      customerTab: 'Customer',
      retailerTab: 'Brand / Retailer',
      nameLabel: 'Full Name',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      passwordHint: 'Password must include at least one letter and one number.',
      submit: 'Register',
      loading: 'Creating account...',
      success: 'Account created successfully',
      error: 'Registration failed',
      loginText: 'Already have an account?',
      loginBtn: 'Login',
    },
    es: {
      title: 'Crear cuenta',
      sub: 'Regístrese para acceder al showroom y los servicios.',
      customerTab: 'Cliente',
      retailerTab: 'Marca / Minorista',
      nameLabel: 'Nombre completo',
      emailLabel: 'Correo electrónico',
      passwordLabel: 'Contraseña',
      passwordHint: 'La contraseña debe incluir al menos una letra y un número.',
      submit: 'Registrarse',
      loading: 'Creando cuenta...',
      success: 'Cuenta creada con éxito',
      error: 'Error de registro',
      loginText: '¿Ya tienes una cuenta?',
      loginBtn: 'Iniciar sesión',
    },
  };

  const active = isSpanish ? content.es : content.en;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        languagePreference: isSpanish ? 'ES' : 'EN',
      });

      const payload = response.data?.data ?? response.data;
      const { accessToken, user } = payload;

      if (!accessToken || !user) {
        throw new Error('Invalid register response');
      }

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      onRegisterSuccess(accessToken, user);

      toast.success(active.success);
      onClose();
    } catch (error) {
      console.error('Register error:', error);
      toast.error(active.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <h2>{active.title}</h2>
        <p>{active.sub}</p>

        <div className="role-switcher">
          <button
            type="button"
            className={role === 'CUSTOMER' ? 'active' : ''}
            onClick={() => setRole('CUSTOMER')}
          >
            {active.customerTab}
          </button>

          <button
            type="button"
            className={role === 'BRAND_RETAILER' ? 'active' : ''}
            onClick={() => setRole('BRAND_RETAILER')}
          >
            {active.retailerTab}
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{active.nameLabel}</label>
            <input
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
            />
          </div>

          <div className="input-group">
            <label>{active.emailLabel}</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>{active.passwordLabel}</label>
            <input
              type="password"
              placeholder="Password1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <small>{active.passwordHint}</small>
          </div>

          <button
            type="submit"
            className="primary-btn submit-btn"
            disabled={isLoading}
          >
            {isLoading ? active.loading : active.submit}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '14px' }}>{active.loginText} </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4af37',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px',
            }}
          >
            {active.loginBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;