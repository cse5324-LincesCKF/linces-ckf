import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useApp } from './context/AppContext'
import Header from './components/Header'
import LoginModal from './components/LoginModal'
import ProductCard from './components/ProductCard'
import B2BQuoteForm from './components/B2BQuoteForm'
import ProtectedRoute from './components/ProtectedRoute'
import B2BDashboard from './pages/B2BDashboard'
import './App.css'

function App() {
  const { isSpanish, user, logout, login } = useApp()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)

  const mockProducts = [
    { id: 1, name_en: "Royal Gold Saree", name_es: "Saree Real Dorado", price: 1200, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400", category: "Traditional" },
    { id: 2, name_en: "Midnight Silk Scarf", name_es: "Bufanda de Seda Medianoche", price: 350, image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=400", category: "Accessories" },
    { id: 3, name_en: "Ethereal White Tunic", name_es: "Túnica Blanca Etérea", price: 850, image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=400", category: "D2C Luxury" }
  ];

  const content = {
    en: {
      heroTitle: user ? `Premium Showroom` : "Elegance in Every Thread",
      heroSub: "High-end silk garments for discerning clients and retailers.",
      ctaRetail: "Shop Collection",
      ctaB2B: user?.role === 'retailer' ? "Enter Dashboard" : "B2B Quote",
      galleryTitle: "Featured Collection"
    },
    es: {
      heroTitle: user ? `Showroom Premium` : "Elegancia en cada hilo",
      heroSub: "Prendas de seda de alta gama para clientes y minoristas exigentes.",
      ctaRetail: "Comprar Colección",
      ctaB2B: user?.role === 'retailer' ? "Ir al Panel" : "Cotización B2B",
      galleryTitle: "Colección Destacada"
    }
  }

  const active = isSpanish ? content.es : content.en

  return (
    <div className="app-container">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            backdropFilter: 'blur(10px)'
          }
        }}
      />
      
      <Header 
        isSpanish={isSpanish} 
        onToggleLanguage={() => {}} 
        onLoginClick={user ? logout : () => setIsLoginOpen(true)}
        isLoggedIn={!!user}
      />

      <Routes>
        <Route path="/" element={
          <>
            <main className="hero-section">
              <div className="hero-content">
                <h1 className="text-reveal">{active.heroTitle}</h1>
                <p className="fade-in">{active.heroSub}</p>
                <div className="button-group">
                  <button className="primary-btn">{active.ctaRetail}</button>
                  {user?.role === 'retailer' ? (
                    <button className="secondary-btn" onClick={() => window.location.href='/dashboard'}>
                      {active.ctaB2B}
                    </button>
                  ) : (
                    <button className="secondary-btn" onClick={() => setIsQuoteOpen(true)}>
                      {active.ctaB2B}
                    </button>
                  )}
                </div>
              </div>
            </main>

            <section id="collection" className="gallery-section">
              <h2 className="section-title">{active.galleryTitle}</h2>
              <div className="product-grid">
                {mockProducts.map(p => (
                  <ProductCard key={p.id} product={p} isSpanish={isSpanish} />
                ))}
              </div>
            </section>
          </>
        } />

        <Route element={<ProtectedRoute allowedRoles={['retailer', 'admin']} />}>
          <Route path="/dashboard" element={<B2BDashboard />} />
        </Route>
      </Routes>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        isSpanish={isSpanish}
        onLoginSuccess={login}
      />

      {isQuoteOpen && (
        <B2BQuoteForm 
          isSpanish={isSpanish} 
          onClose={() => setIsQuoteOpen(false)} 
        />
      )}

      <div className="ambient-glow"></div>
    </div>
  )
}

export default App