import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';

interface HeaderProps {
  isSpanish: boolean;
  onToggleLanguage: () => void;
  onLoginClick: () => void | Promise<void>;
  isLoggedIn: boolean;
}

const Header = ({ onLoginClick, isLoggedIn }: HeaderProps) => {
  const { isSpanish, setIsSpanish, user } = useApp();
  const navigate = useNavigate();

  return (
    <nav className="glass-nav">
      <div className="logo-container">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span className="logo">LINCES’CKF</span>
        </Link>
      </div>

      <div className="nav-links">
        <button
          className="lang-toggle"
          onClick={() => setIsSpanish(!isSpanish)}
        >
          {isSpanish ? 'EN' : 'ES'}
        </button>

        {(user?.role === 'ADMINISTRATOR' || user?.role === 'BRAND_RETAILER') && (
          <Link to="/dashboard" className="nav-item">
            {isSpanish ? 'Panel B2B' : 'Dashboard'}
          </Link>
        )}

        <a href="/#collection" className="nav-item">
          {isSpanish ? 'Colección' : 'Collection'}
        </a>
        
        {user?.role === 'CUSTOMER' && (
          <Link to="/cart" className="nav-item">
              {isSpanish ? 'Carrito' : 'Cart'}
          </Link>
        )}

        {user?.role === 'CUSTOMER' && (
          <Link to="/orders" className="nav-item">
              {isSpanish ? 'Pedidos' : 'Orders'}
          </Link>
        )}

        {isLoggedIn && user?.name && (
          <Link to="/profile" className="nav-item">
            {isSpanish ? 'Hola' : 'Hi'}, {user.name}
          </Link>
        )}

        {(user?.role === 'BRAND_RETAILER' || user?.role === 'ADMINISTRATOR') && (
          <Link to="/quotes" className="nav-item">
             {isSpanish ? 'Cotizaciones' : 'Quotes'}
          </Link>
        )}
        
        {user?.role === 'ADMINISTRATOR' && (
          <Link to="/admin" className="nav-item">
             {isSpanish ? 'Admin' : 'Admin'}
           </Link>
        )}


        <button
          className="connect-btn"
          onClick={async () => {
            if (isLoggedIn) {
              await onLoginClick();
              navigate('/');
            } else {
              await onLoginClick();
            }
          }}
        >
          {isLoggedIn
            ? (isSpanish ? 'Salir' : 'Logout')
            : (isSpanish ? 'Acceso' : 'Login')}
        </button>
      </div>
    </nav>
  );
};

export default Header;