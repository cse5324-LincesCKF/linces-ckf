/* --- Linces'CKF Global & Layout Styles --- */

:root {
  --bg-deep: #050505;
  --bg-surface: #0a0a0a;
  --text-main: #a1a1a1;
  --text-bright: #ffffff;
  --silk-gold: #d4af37;
  --silk-gold-muted: rgba(212, 175, 55, 0.1);
  --glass-border: rgba(255, 255, 255, 0.08);
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at top right, #1a1a1a, #050505);
  color: white;
  font-family: 'Inter', sans-serif;
}

/* --- Glass Navigation --- */
.glass-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 4rem;
  background: rgba(5, 5, 5, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-bottom: 1px solid var(--glass-border);
  z-index: 1000;
  box-sizing: border-box;
}

.logo {
  font-weight: 800;
  letter-spacing: 0.4em;
  font-size: 1.1rem;
  color: var(--silk-gold);
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  gap: 2.5rem;
  align-items: center;
}

.nav-item {
  text-decoration: none;
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  transition: color 0.3s ease;
}

.nav-item:hover {
  color: var(--text-bright);
}

.lang-toggle {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--silk-gold);
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}

.connect-btn {
  background: var(--text-bright);
  color: var(--bg-deep);
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  cursor: pointer;
}

/* --- Hero Section --- */
.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 4rem;
  text-align: center;
}

.text-reveal {
  font-size: clamp(2.5rem, 7vw, 4.5rem);
  line-height: 1.1;
  background: linear-gradient(to bottom, #fff 40%, var(--silk-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem;
  font-weight: 900;
}

.button-group {
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  margin-top: 2rem;
}

.primary-btn, .secondary-btn {
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn { background: var(--silk-gold); color: #000; border: none; }
.secondary-btn { background: transparent; border: 1px solid var(--glass-border); color: var(--text-bright); }

/* --- Gallery & Product Cards --- */
.gallery-section {
  padding: 4rem;
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.5rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--silk-gold);
  margin-bottom: 3rem;
  text-align: center;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
}

.product-card {
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.product-image-wrapper {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.product-info {
  padding: 1.5rem;
}

.category-tag {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--silk-gold);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  display: block;
}

.price {
  font-weight: 600;
  color: var(--text-bright);
}

/* --- Modal & Form Elements --- */
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 4px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  width: 90%;
  max-width: 450px;
  padding: 3rem;
  position: relative;
}

.quote-modal {
  max-width: 550px;
}

.input-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.input-group label {
  display: block;
  font-size: 0.75rem;
  color: var(--silk-gold);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.input-group input, .custom-select, .custom-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  padding: 0.8rem;
  border-radius: 4px;
  color: white;
  box-sizing: border-box;
}

.custom-select {
  appearance: none;
  cursor: pointer;
}

.custom-textarea {
  resize: none;
}

.submit-btn {
  width: 100%;
  margin-top: 1rem;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 2rem;
  cursor: pointer;
}

.role-switcher {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.3rem;
  margin: 2rem 0;
}

.role-switcher button {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.8rem;
  color: var(--text-main);
  cursor: pointer;
}

.role-switcher button.active {
  background: var(--silk-gold);
  color: #000;
  border-radius: 6px;
}

/* --- Utilities --- */
.ambient-glow {
  position: fixed;
  top: 20%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.03) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in { animation: fadeIn 0.8s ease forwards; }

@media (max-width: 768px) {
  .glass-nav { padding: 1rem 1.5rem; }
  .gallery-section { padding: 2rem; }
}