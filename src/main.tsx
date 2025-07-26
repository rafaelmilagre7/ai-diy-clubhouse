
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suprimir erros não críticos em desenvolvimento
import './utils/errorSuppression';

// Inicializar sistemas de monitoramento em desenvolvimento
if (import.meta.env.DEV) {
  import('./utils/resourceErrorHandler');
}

// Interceptar console em produção ANTES de tudo
import './utils/productionSafeConsole';
import './utils/buildSafeLogger';
import { consoleManager } from './utils/consoleManager';

// Inicializar gerenciador de console
consoleManager.init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
