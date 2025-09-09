
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/certificate.css';

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
import { setupEmailMaskingInterceptor } from './utils/emailMasking';

// Inicializar gerenciador de console
consoleManager.init();

// Configurar mascaramento de emails nos logs
setupEmailMaskingInterceptor();

// Testar sistema de mascaramento (apenas desenvolvimento)
import './utils/testEmailMasking';

// Console administrativo (apenas para admins)
import './utils/adminConsole';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
