import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { createQuote } from '../services/quoteService';

const QuoteRequestPage = () => {
  const { isSpanish, user } = useApp();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [materialType, setMaterialType] = useState('');
  const [desiredDeliveryDate, setDesiredDeliveryDate] = useState('');
  const [customizationDescription, setCustomizationDescription] = useState('');
  const [supportingDocumentUrl, setSupportingDocumentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const content = {
    en: {
      title: 'Request Quote',
      back: 'Back',
      quantity: 'Quantity',
      materialType: 'Material Type',
      desiredDeliveryDate: 'Desired Delivery Date',
      customizationDescription: 'Customization Description',
      supportingDocumentUrl: 'Supporting Document URL',
      submit: 'Submit Quote',
      submitting: 'Submitting...',
      success: 'Quote submitted successfully',
      fail: 'Failed to submit quote',
      retailerOnly: 'Only brand retailer accounts can submit quotes',
    },
    es: {
      title: 'Solicitar Cotización',
      back: 'Volver',
      quantity: 'Cantidad',
      materialType: 'Tipo de material',
      desiredDeliveryDate: 'Fecha de entrega deseada',
      customizationDescription: 'Descripción de personalización',
      supportingDocumentUrl: 'URL del documento de soporte',
      submit: 'Enviar cotización',
      submitting: 'Enviando...',
      success: 'Cotización enviada con éxito',
      fail: 'No se pudo enviar la cotización',
      retailerOnly: 'Solo las cuentas de marca/minorista pueden enviar cotizaciones',
    },
  };

  const active = isSpanish ? content.es : content.en;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || user.role !== 'BRAND_RETAILER') {
      toast.error(active.retailerOnly);
      navigate('/');
      return;
    }

    try {
      setSubmitting(true);

      await createQuote({
        quantity: Number(quantity),
        materialType,
        desiredDeliveryDate,
        customizationDescription,
        supportingDocumentUrl: supportingDocumentUrl || undefined,
      });

      toast.success(active.success);
      navigate('/quotes');
    } catch (error) {
      console.error('Failed to submit quote:', error);
      toast.error(active.fail);
    } finally {
      setSubmitting(false);
    }
  };

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

        <button className="btn-dark" onClick={() => navigate(-1)}>
          {active.back}
        </button>
      </div>

      <form
        className="glass-panel"
        onSubmit={handleSubmit}
        style={{
          padding: '2rem',
          maxWidth: '720px',
          display: 'grid',
          gap: '1rem',
        }}
      >
        <div>
          <label>{active.quantity}</label>
          <input
            className="custom-input"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>

        <div>
          <label>{active.materialType}</label>
          <input
            className="custom-input"
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            maxLength={120}
            required
          />
        </div>

        <div>
          <label>{active.desiredDeliveryDate}</label>
          <input
            className="custom-input"
            type="date"
            lang="en"
            placeholder="YYYY-MM-DD"
            value={desiredDeliveryDate}
            onChange={(e) => setDesiredDeliveryDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>{active.customizationDescription}</label>
          <textarea
            className="custom-input"
            value={customizationDescription}
            onChange={(e) => setCustomizationDescription(e.target.value)}
            required
            rows={5}
          />
        </div>

        <div>
          <label>{active.supportingDocumentUrl}</label>
          <input
            className="custom-input"
            type="url"
            value={supportingDocumentUrl}
            onChange={(e) => setSupportingDocumentUrl(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-dark" disabled={submitting}>
          {submitting ? active.submitting : active.submit}
        </button>
      </form>
    </div>
  );
};

export default QuoteRequestPage;