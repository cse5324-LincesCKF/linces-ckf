import { useState } from 'react';

interface Product {
  id: number;
  name_en: string;
  name_es: string;
  price: number;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  isSpanish: boolean;
}

const ProductCard = ({ product, isSpanish }: ProductCardProps) => {
  return (
    <div className="glass-panel product-card fade-in">
      <div className="product-image-wrapper">
        <img src={product.image} alt={product.name_en} className="product-image" />
        <div className="product-overlay">
          <button className="view-btn">
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