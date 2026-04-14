import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { getQuotes, type Quote } from '../services/quoteService';

const QuotesPage = () => {
  const { isSpanish, user } = useApp();
  const navigate = useNavigate();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const content = {
    en: {
      title: 'Quotes',
      loading: 'Loading quotes...',
      empty: 'No quotes found',
      back: 'Back',
      loadFail: 'Failed to load quotes',
      details: 'View Details',
      status: 'Status',
      quantity: 'Quantity',
      material: 'Material',
      date: 'Created At',
      accessDenied: 'You do not have access to quotes',
      requestQuote: 'Request Quote',
    },
    es: {
      title: 'Cotizaciones',
      loading: 'Cargando cotizaciones...',
      empty: 'No se encontraron cotizaciones',
      back: 'Volver',
      loadFail: 'No se pudieron cargar las cotizaciones',
      details: 'Ver detalles',
      status: 'Estado',
      quantity: 'Cantidad',
      material: 'Material',
      date: 'Creado',
      accessDenied: 'No tienes acceso a cotizaciones',
      requestQuote: 'Solicitar cotización',
    },
  };

  const active = isSpanish ? content.es : content.en;

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      if (
        user.role !== 'BRAND_RETAILER' &&
        user.role !== 'ADMINISTRATOR'
      ) {
        toast.error(active.accessDenied);
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const data = await getQuotes();
        setQuotes(data);
      } catch (error) {
        console.error('Failed to load quotes:', error);
        toast.error(active.loadFail);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [user, navigate]);

  if (loading) {
    return (
      <div style={{ paddingTop: '120px', paddingLeft: '2rem', paddingRight: '2rem' }}>
        <div className="loader">{active.loading}</div>
      </div>
    );
  }

  return (
    <div
      className="dashboard-container fade-in"
      style={{
        paddingTop: '120px',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        paddingBottom: '2rem',
      }}
    >
      <div
        className="dashboard-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <h2 className="text-reveal" style={{ margin: 0 }}>
          {active.title}
        </h2>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {user?.role === 'BRAND_RETAILER' && (
            <button className="btn-dark" onClick={() => navigate('/quotes/new')}>
              {active.requestQuote}
            </button>
          )}

          <button className="btn-dark" onClick={() => navigate('/')}>
            {active.back}
          </button>
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <p>{active.empty}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {quotes.map((quote) => (
            <div key={quote.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <p><strong>ID:</strong> {quote.id}</p>
                  <p><strong>{active.status}:</strong> {quote.status}</p>
                  <p><strong>{active.quantity}:</strong> {quote.quantity}</p>
                  <p><strong>{active.material}:</strong> {quote.materialType}</p>
                  <p><strong>{active.date}:</strong> {new Date(quote.createdAt).toLocaleString()}</p>
                </div>

                <button
                  className="btn-dark"
                  onClick={() => navigate(`/quotes/${quote.id}`)}
                >
                  {active.details}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuotesPage;