
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
