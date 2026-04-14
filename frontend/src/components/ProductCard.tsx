
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  price: number;
  imageUrls: string[];
  category: string;
}

interface ProductCardProps {
  product: Product;
  isSpanish: boolean;
}

const ProductCard = ({ product, isSpanish }: ProductCardProps) => {
  const navigate = useNavigate();
  const goToDetail = () => {
    navigate(`/product/${product.id}`);
  };
  const displayImage = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls[0] 
    : "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400";
  return (
    <div className="glass-panel product-card fade-in"
      onClick={goToDetail}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-image-wrapper">
        <img src={displayImage} alt={isSpanish ? product.name_es : product.name_en} className="product-image" />
        <div className="product-overlay">
          <button 
          className="view-btn">
            {isSpanish ? "Ver Detalle" : "Quick View"}
          </button>
        </div>
      </div>
      
      <div className="product-info">
        <span className="category-tag">{product.category}</span>
        <h3>{isSpanish ? product.name_es : product.name_en}</h3>
        <p className="price">${product.price.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ProductCard;