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

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSpanish: boolean;
  onLoginSuccess: (token: string, user: User) => void;
  onSwitchToRegister: () => void;
}

const LoginModal = ({
  isOpen,
  onClose,
  isSpanish,
  onLoginSuccess,
  onSwitchToRegister,
}: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const content = {
    en: {
      title: 'Welcome Back',
      sub: 'Enter your credentials to access the showroom.',
      emailLabel: 'Email Address',
      passLabel: 'Password',
      btn: 'Sign In',
      loading: 'Authenticating...',
      success: 'Successfully signed in',
      error: 'Authentication failed',
      registerText: "Don't have an account?",
      registerBtn: 'Register',
    },
    es: {
      title: 'Bienvenido de nuevo',
      sub: 'Ingrese sus credenciales para acceder al showroom.',
      emailLabel: 'Correo electrónico',
      passLabel: 'Contraseña',
      btn: 'Iniciar sesión',
      loading: 'Autenticando...',
      success: 'Sesión iniciada con éxito',
      error: 'Error de autenticación',
      registerText: '¿No tienes una cuenta?',
      registerBtn: 'Registrarse',
    },
  };

  const active = isSpanish ? content.es : content.en;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const payload = response.data?.data ?? response.data;
      const { accessToken, user } = payload;

      if (!accessToken || !user) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      onLoginSuccess(accessToken, user);
      toast.success(active.success);
      onClose();
    } catch (err) {
      console.error('Login error:', err);
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

        <form className="login-form" onSubmit={handleSubmit}>
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
            <label>{active.passLabel}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-btn submit-btn"
            disabled={isLoading}
          >
            {isLoading ? active.loading : active.btn}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '14px' }}>{active.registerText} </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToRegister();
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
            {active.registerBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;