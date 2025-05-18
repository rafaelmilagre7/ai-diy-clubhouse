
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/layout/Layout';
import { ProtectedRoutes } from './auth/ProtectedRoutes';
import { AdminProtectedRoutes } from './auth/AdminProtectedRoutes';
import { FormacaoProtectedRoutes } from './auth/FormacaoProtectedRoutes';
import { AuthProvider } from './contexts/auth/AuthProvider';

// Páginas do fórum
import { ForumHomePage } from './pages/forum/ForumHomePage';
import { CategoryPage } from './pages/forum/CategoryPage';
import { TopicPage } from './pages/forum/TopicPage';
import { NewTopicPage } from './pages/forum/NewTopicPage';
import { AdminForumPage } from './pages/forum/AdminForumPage';

// Importar componentes para as rotas principais
import Dashboard from './pages/member/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import FormacaoDashboard from './pages/formacao/FormacaoDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas protegidas - Membros */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Layout />}>
              {/* Dashboard como página inicial */}
              <Route index element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Rotas do fórum */}
              <Route path="/forum" element={<ForumHomePage />} />
              <Route path="/forum/categoria/:slug" element={<CategoryPage />} />
              <Route path="/forum/topico/:id" element={<TopicPage />} />
              <Route path="/forum/novo" element={<NewTopicPage />} />
              <Route path="/forum/categoria/:slug/novo" element={<NewTopicPage />} />
              
              {/* Outras rotas existentes... */}
            </Route>
          </Route>
          
          {/* Rotas protegidas - Admin */}
          <Route element={<AdminProtectedRoutes />}>
            <Route path="/admin" element={<Layout />}>
              {/* Dashboard admin como página inicial */}
              <Route index element={<AdminDashboard />} />
              
              {/* Rotas admin do fórum */}
              <Route path="/admin/forum" element={<AdminForumPage />} />
              
              {/* Outras rotas admin existentes... */}
            </Route>
          </Route>
          
          {/* Rotas protegidas - Formação */}
          <Route element={<FormacaoProtectedRoutes />}>
            <Route path="/formacao" element={<Layout />}>
              {/* Dashboard formação como página inicial */}
              <Route index element={<FormacaoDashboard />} />
              
              {/* Outras rotas formação existentes... */}
            </Route>
          </Route>
          
          {/* Outras rotas existentes... */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
