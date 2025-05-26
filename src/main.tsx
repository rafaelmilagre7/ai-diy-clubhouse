
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Configurar o título do documento
document.title = 'Viver de IA Hub';

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <App />
  );
} else {
  console.error("Root element not found");
}
