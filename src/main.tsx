
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Importar limpeza automática dos dados de onboarding (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  import('./utils/autoCleanOnboarding');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
