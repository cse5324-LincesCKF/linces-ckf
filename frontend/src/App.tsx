import { Routes, Route, useNavigate } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import { useEffect, useState } from 'react'

import { useApp } from './context/useApp'
import { getProducts, type Product } from './services/productService'

import Header from './components/Header'
import LoginModal from './components/LoginModal'
import RegisterModal from './components/RegisterModal'
import ProductCard from './components/ProductCard'
import ProtectedRoute from './components/ProtectedRoute'

import B2BDashboard from './pages/B2Bdashboard'
import ProductDetail from './pages/ProductDetail'
import ProfilePage from './pages/ProfilePage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import QuotesPage from './pages/QuotesPage'
import QuoteDetailPage from './pages/QuoteDetailPage'
import QuoteRequestPage from './pages/QuoteRequestPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminAuditLogsPage from './pages/AdminAuditLogsPage'

import './App.css'

function App() {
  const { isSpanish, user, logout, login } = useApp()
  const navigate = useNavigate()

  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setProducts([])
      }
    }

    fetchProducts()
  }, [])

  const content = {
    en: {
      heroTitle: user ? 'Premium Showroom' : 'Elegance in Every Thread',
      heroSub: 'High-end silk garments for discerning clients and retailers.',
      ctaRetail: 'Shop Collection',
      ctaB2B: 'B2B Quote',
      galleryTitle: 'Featured Collection',
      retailerOnlyQuote: 'Only business retailers can request quotes.',
    },
    es: {
      heroTitle: user ? 'Showroom Premium' : 'Elegancia en cada hilo',
      heroSub: 'Prendas de seda de alta gama para clientes y minoristas exigentes.',
      ctaRetail: 'Comprar Colección',
      ctaB2B: 'Cotización B2B',
      galleryTitle: 'Colección Destacada',
      retailerOnlyQuote: 'Only business retailers can request quotes.',
    },
  }

  const active = isSpanish ? content.es : content.en

  return (
    <div className="app-container">
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#d4af37',
              secondary: '#000',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4d4f',
              secondary: '#fff',
            },
          },
        }}
      />

      <Header
        isSpanish={isSpanish}
        onToggleLanguage={() => {}}
        onLoginClick={user ? logout : () => setIsLoginOpen(true)}
        isLoggedIn={!!user}
      />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <main className="hero-section">
                <div className="hero-content">
                  <h1>{active.heroTitle}</h1>
                  <p>{active.heroSub}</p>

                  <div className="button-group">
                    <button className="primary-btn">
                      {active.ctaRetail}
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() => {
                        if (!user) {
                          setIsLoginOpen(true)
                          return
                        }

                        if (user.role !== 'BRAND_RETAILER') {
                          toast.error(active.retailerOnlyQuote)
                          return
                        }

                        navigate('/quotes/new')
                      }}
                    >
                      {active.ctaB2B}
                    </button>
                  </div>
                </div>
              </main>

              <section id="collection" className="gallery-section">
                <h2 className="section-title">{active.galleryTitle}</h2>
                <div className="product-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSpanish={isSpanish}
                    />
                  ))}
                </div>
              </section>
            </>
          }
        />

        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
        <Route path="/quotes/new" element={<QuoteRequestPage />} />
        <Route path="/quotes/:id" element={<QuoteDetailPage />} />

        <Route
          element={
            <ProtectedRoute
              allowedRoles={['BRAND_RETAILER', 'ADMINISTRATOR']}
            />
          }
        >
          <Route path="/dashboard" element={<B2BDashboard />} />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRATOR']} />
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/audit" element={<AdminAuditLogsPage />} />
        </Route>
      </Routes>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        isSpanish={isSpanish}
        onLoginSuccess={login}
        onSwitchToRegister={() => {
          setIsLoginOpen(false)
          setIsRegisterOpen(true)
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        isSpanish={isSpanish}
        onRegisterSuccess={login}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false)
          setIsLoginOpen(true)
        }}
      />

      <div className="ambient-glow"></div>
    </div>
  )
}

export default App