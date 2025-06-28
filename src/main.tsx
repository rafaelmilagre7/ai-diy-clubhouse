
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SimpleAuthProvider } from '@/contexts/auth/SimpleAuthProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimpleAuthProvider>
      <App />
    </SimpleAuthProvider>
  </StrictMode>,
);
