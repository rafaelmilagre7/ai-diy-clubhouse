
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// OTIMIZAÇÃO: Validação de segurança apenas em DEV
import { optimizedSecurityValidator } from './utils/OptimizedSecurityValidator';

// OTIMIZAÇÃO: Executar validações apenas se necessário
if (import.meta.env.DEV) {
  optimizedSecurityValidator.generateSecurityReport();
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
