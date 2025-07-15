
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Inicializar sistemas de monitoramento em desenvolvimento
if (import.meta.env.DEV) {
  import('./utils/resourceErrorHandler');
}

// Interceptar console em produção ANTES de tudo
import './utils/productionSafeConsole';
import './utils/buildSafeLogger';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
