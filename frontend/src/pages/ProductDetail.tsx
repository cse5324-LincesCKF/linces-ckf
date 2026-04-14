import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { getProductById, type Product } from '../services/productService';
import { addCartItem } from '../services/cartService';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isSpanish, user } = useApp();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const content = {
    en: {
      loading: 'Loading...',
      notFound: 'Product not found',
      back: '← Back',
      description: 'Description',
      stock: 'Stock:',
      addToCart: 'Add to Cart',
      adding: 'Adding...',
      addedSuccess: 'Item added to cart',
      addFail: 'Failed to add item to cart',
      loginRequired: 'Please log in first',
      customerOnly: 'Only customer accounts can use the cart',
      noImage: 'https://via.placeholder.com/600x800?text=No+Image',
      goToCart: 'Go to Cart',
    },
    es: {
      loading: 'Cargando...',
      notFound: 'Producto no encontrado',
      back: '← Volver',
      description: 'Descripción',
      stock: 'Inventario:',
      addToCart: 'Añadir al carrito',
      adding: 'Añadiendo...',
      addedSuccess: 'Artículo añadido al carrito',
      addFail: 'No se pudo añadir el artículo al carrito',
      loginRequired: 'Por favor, inicia sesión primero',
      customerOnly: 'Solo las cuentas de cliente pueden usar el carrito',
      noImage: 'https://via.placeholder.com/600x800?text=No+Image',
      goToCart: 'Ir al carrito',
    },
  };

  const active = isSpanish ? content.es : content.en;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!user) {
      toast.error(active.loginRequired);
      return;
    }

    if (user.role !== 'CUSTOMER') {
      toast.error(active.customerOnly);
      return;
    }

    try {
      setAdding(true);

      await addCartItem({
        productId: product.id,
        quantity: 1,
      });

      toast.success(active.addedSuccess);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error(active.addFail);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="loading">{active.loading}</div>;
  }

  if (!product) {
    return <div className="error">{active.notFound}</div>;
  }

  const displayImage =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : active.noImage;

  return (
    <div
      className="product-detail-page fade-in"
      style={{
        paddingTop: '110px',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        paddingBottom: '2rem',
      }}
    >
      <button className="back-btn" onClick={() => navigate(-1)}>
        {active.back}
      </button>

      <div className="detail-grid">
        <div className="detail-image-wrapper">
          <img
            src={displayImage}
            alt={isSpanish ? product.name_es : product.name_en}
            className="main-image"
          />
        </div>

        <div className="detail-info">
          <span className="category-tag">{product.category}</span>

          <h1>{isSpanish ? product.name_es : product.name_en}</h1>

          <p className="price-large">${product.price.toLocaleString()}</p>

          <div className="description-section">
            <h3>{active.description}</h3>
            <p>
              {isSpanish ? product.description_es : product.description_en}
            </p>
          </div>

          <div className="stock-status">
            {active.stock}{' '}
            <span
              className={
                product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'
              }
            >
              {product.stockQuantity}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              className="btn-dark"
              disabled={product.stockQuantity === 0 || adding}
              onClick={handleAddToCart}
            >
              {adding ? active.adding : active.addToCart}
            </button>

            {user?.role === 'CUSTOMER' && (
              <button
                className="btn-dark"
                onClick={() => navigate('/cart')}
              >
                {active.goToCart}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;