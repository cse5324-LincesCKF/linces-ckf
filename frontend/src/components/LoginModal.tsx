import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSpanish: boolean;
  onLoginSuccess: (token: string, role: string) => void;
}

const LoginModal = ({ isOpen, onClose, isSpanish, onLoginSuccess }: LoginModalProps) => {
  const [role, setRole] = useState<'consumer' | 'retailer'>('consumer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const content = {
    en: {
      title: "Welcome Back",
      sub: "Enter your credentials to access the showroom.",
      userTab: "Consumer",
      b2bTab: "B2B / Retailer",
      emailLabel: "Email Address",
      passLabel: "Password",
      btn: "Sign In",
      loading: "Authenticating...",
      success: "Successfully signed in",
      error: "Authentication failed"
    },
    es: {
      title: "Bienvenido de nuevo",
      sub: "Ingrese sus credenciales para acceder al showroom.",
      userTab: "Consumidor",
      b2bTab: "B2B / Minorista",
      emailLabel: "Correo electrónico",
      passLabel: "Contraseña",
      btn: "Iniciar sesión",
      loading: "Autenticando...",
      success: "Sesión iniciada con éxito",
      error: "Error de autenticación"
    }
  };

  const active = isSpanish ? content.es : content.en;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password, role });
      onLoginSuccess(data.access_token, role);
      toast.success(active.success);
      onClose();
    } catch (err) {
      toast.error(active.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <h2>{active.title}</h2>
        <p>{active.sub}</p>

        <div className="role-switcher">
          <button 
            type="button"
            className={role === 'consumer' ? 'active' : ''} 
            onClick={() => setRole('consumer')}
          >
            {active.userTab}
          </button>
          <button 
            type="button"
            className={role === 'retailer' ? 'active' : ''} 
            onClick={() => setRole('retailer')}
          >
            {active.b2bTab}
          </button>
        </div>

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

          <button type="submit" className="primary-btn submit-btn" disabled={isLoading}>
            {isLoading ? active.loading : active.btn}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;