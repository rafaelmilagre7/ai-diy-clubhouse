
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 main.tsx: Inicializando aplicação');

// Importar limpeza automática dos dados de onboarding (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 main.tsx: Modo desenvolvimento detectado, carregando auto-limpeza');
  import('./utils/autoCleanOnboarding');
}

console.log('✅ main.tsx: Montando aplicação React');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log('🎯 main.tsx: Aplicação montada com sucesso');
