import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  isSpanish: boolean;
  onToggleLanguage: () => void; // Kept for backward compat in App.tsx call
  onLoginClick: () => void;
  isLoggedIn: boolean;
}

const Header = ({ onLoginClick, isLoggedIn }: HeaderProps) => {
  const { isSpanish, setIsSpanish, user } = useApp();

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
          {isSpanish ? "EN" : "ES"}
        </button>
        
        {user?.role === 'retailer' && (
          <Link to="/dashboard" className="nav-item">
            {isSpanish ? "Panel B2B" : "Dashboard"}
          </Link>
        )}
        
        <a href="/#collection" className="nav-item">
          {isSpanish ? "Colección" : "Collection"}
        </a>
        
        <button className="connect-btn" onClick={onLoginClick}>
          {isLoggedIn 
            ? (isSpanish ? "Salir" : "Logout") 
            : (isSpanish ? "Acceso" : "Login")
          }
        </button>
      </div>
    </nav>
  );
};

export default Header;