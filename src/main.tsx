
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Inicialização com validação de segurança
import { securityValidator } from './utils/securityValidator';

// Validar segurança antes de inicializar a aplicação
if (import.meta.env.DEV) {
  securityValidator.generateSecurityReport();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
