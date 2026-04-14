import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import {
  getQuoteById,
  updateQuoteStatus,
  convertQuote,
  type Quote,
} from '../services/quoteService';

const QuoteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isSpanish, user } = useApp();
  const navigate = useNavigate();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [converting, setConverting] = useState(false);

  const content = {
    en: {
      title: 'Quote Details',
      loading: 'Loading quote...',
      notFound: 'Quote not found',
      back: 'Back to Quotes',
      loadFail: 'Failed to load quote',
      quantity: 'Quantity',
      materialType: 'Material Type',
      desiredDeliveryDate: 'Desired Delivery Date',
      customizationDescription: 'Customization Description',
      supportingDocumentUrl: 'Supporting Document URL',
      status: 'Status',
      submittedBy: 'Submitted By',
      approve: 'Approve',
      reject: 'Reject',
      converting: 'Converting...',
      convert: 'Convert to Draft Order',
      convertSuccess: 'Quote converted successfully',
      convertFail: 'Failed to convert quote',
      statusSuccess: 'Quote status updated successfully',
      statusFail: 'Failed to update quote status',
      openDocument: 'Open Document',
    },
    es: {
      title: 'Detalles de Cotización',
      loading: 'Cargando cotización...',
      notFound: 'Cotización no encontrada',
      back: 'Volver a cotizaciones',
      loadFail: 'No se pudo cargar la cotización',
      quantity: 'Cantidad',
      materialType: 'Tipo de material',
      desiredDeliveryDate: 'Fecha de entrega deseada',
      customizationDescription: 'Descripción de personalización',
      supportingDocumentUrl: 'URL del documento de soporte',
      status: 'Estado',
      submittedBy: 'Enviado por',
      approve: 'Aprobar',
      reject: 'Rechazar',
      converting: 'Convirtiendo...',
      convert: 'Convertir a borrador de pedido',
      convertSuccess: 'Cotización convertida con éxito',
      convertFail: 'No se pudo convertir la cotización',
      statusSuccess: 'Estado de cotización actualizado con éxito',
      statusFail: 'No se pudo actualizar el estado de la cotización',
      openDocument: 'Abrir documento',
    },
  };

  const active = isSpanish ? content.es : content.en;

  useEffect(() => {
    const fetchQuote = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getQuoteById(id);
        setQuote(data);
      } catch (error) {
        console.error('Failed to load quote:', error);
        toast.error(active.loadFail);
        setQuote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    if (!quote) return;

    try {
      setUpdating(true);
      const updated = await updateQuoteStatus(quote.id, status);
      setQuote(updated);
      toast.success(active.statusSuccess);
    } catch (error) {
      console.error('Failed to update quote status:', error);
      toast.error(active.statusFail);
    } finally {
      setUpdating(false);
    }
  };

  const handleConvert = async () => {
    if (!quote) return;

    try {
      setConverting(true);
      const result = await convertQuote(quote.id);
      toast.success(active.convertSuccess);
      navigate(`/orders/${result.orderId}`);
    } catch (error) {
      console.error('Failed to convert quote:', error);
      toast.error(active.convertFail);
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '120px', paddingLeft: '2rem', paddingRight: '2rem' }}>
        <div className="loader">{active.loading}</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div style={{ paddingTop: '120px', paddingLeft: '2rem', paddingRight: '2rem' }}>
        <div className="loader">{active.notFound}</div>
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
        }}
      >
        <h2 className="text-reveal" style={{ margin: 0 }}>
          {active.title}
        </h2>

        <button className="btn-dark" onClick={() => navigate('/quotes')}>
          {active.back}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <p><strong>ID:</strong> {quote.id}</p>
        <p><strong>{active.submittedBy}:</strong> {quote.submittedBy.name} ({quote.submittedBy.email})</p>
        <p><strong>{active.quantity}:</strong> {quote.quantity}</p>
        <p><strong>{active.materialType}:</strong> {quote.materialType}</p>
        <p><strong>{active.desiredDeliveryDate}:</strong> {quote.desiredDeliveryDate}</p>
        <p><strong>{active.customizationDescription}:</strong> {quote.customizationDescription}</p>
        <p><strong>{active.status}:</strong> {quote.status}</p>

        {quote.supportingDocumentUrl && (
          <p>
            <strong>{active.supportingDocumentUrl}:</strong>{' '}
            <a href={quote.supportingDocumentUrl} target="_blank" rel="noreferrer">
              {active.openDocument}
            </a>
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          {user?.role === 'ADMINISTRATOR' && (
            <>
              <button
                className="btn-dark"
                disabled={updating}
                onClick={() => handleStatusUpdate('APPROVED')}
              >
                {active.approve}
              </button>

              <button
                className="btn-dark"
                disabled={updating}
                onClick={() => handleStatusUpdate('REJECTED')}
              >
                {active.reject}
              </button>
            </>
          )}

          {user?.role === 'BRAND_RETAILER' &&
            quote.status === 'APPROVED' &&
            !quote.convertedToOrderId && (
              <button
                className="btn-dark"
                disabled={converting}
                onClick={handleConvert}
              >
                {converting ? active.converting : active.convert}
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailPage;