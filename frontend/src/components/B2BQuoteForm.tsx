import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';

interface B2BQuoteFormProps {
  isSpanish: boolean;
  onClose: () => void;
}

const B2BQuoteForm = ({ isSpanish, onClose }: B2BQuoteFormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const content = {
    en: {
      title: "Bulk Manufacturing Quote",
      sub: "Request a personalized quote for wholesale silk production.",
      company: "Company Name",
      fabric: "Silk Type",
      quantity: "Quantity (Meters/Units)",
      notes: "Specific Requirements",
      submit: "Request Quote",
      successMsg: "Quote request sent!",
      successTitle: "Request Sent Successfully",
      back: "Close"
    },
    es: {
      title: "Cotización de Fabricación",
      sub: "Solicite una cotización personalizada para producción de seda al por mayor.",
      company: "Nombre de la Empresa",
      fabric: "Tipo de Seda",
      quantity: "Cantidad (Metros/Unidades)",
      notes: "Requisitos Específicos",
      submit: "Solicitar Cotización",
      successMsg: "Solicitud de cotización enviada!",
      successTitle: "Solicitud Enviada con Éxito",
      back: "Cerrar"
    }
  };

  const active = isSpanish ? content.es : content.en;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success(active.successMsg);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="glass-panel modal-content">
          <div className="status-indicator" style={{ fontSize: '2rem', marginBottom: '1rem' }}>✓</div>
          <h2>{active.successTitle}</h2>
          <button className="primary-btn" style={{ marginTop: '2rem' }} onClick={onClose}>
            {active.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content quote-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{active.title}</h2>
        <p style={{ marginBottom: '2rem' }}>{active.sub}</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{active.company}</label>
            <input type="text" placeholder="Linces Corp" required />
          </div>
          <div className="input-group">
            <label>{active.fabric}</label>
            <select className="custom-select">
              <option>Mulberry Silk</option>
              <option>Eri Silk</option>
              <option>Tussar Silk</option>
            </select>
          </div>
          <div className="input-group">
            <label>{active.quantity}</label>
            <input type="number" placeholder="500" required />
          </div>
          <div className="input-group">
            <label>{active.notes}</label>
            <textarea className="custom-textarea" rows={3}></textarea>
          </div>
          <button type="submit" className="primary-btn submit-btn" disabled={loading}>
            {loading ? "..." : active.submit}
          </button>
        </form>
      </div>
    </div>
  );
};

export default B2BQuoteForm;