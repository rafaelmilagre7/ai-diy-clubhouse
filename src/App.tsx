
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import Layout from './components/layout/Layout';
import { ProtectedRoutes } from './auth/ProtectedRoutes';
import { AdminProtectedRoutes } from './auth/AdminProtectedRoutes';
import { FormacaoProtectedRoutes } from './auth/FormacaoProtectedRoutes';
import { AppRoutes } from './routes';

// Páginas do fórum
import { ForumHomePage } from './pages/forum/ForumHomePage';
import { CategoryPage } from './pages/forum/CategoryPage';
import { TopicPage } from './pages/forum/TopicPage';
import { NewTopicPage } from './pages/forum/NewTopicPage';
import { AdminForumPage } from './pages/forum/AdminForumPage';

// Dashboard e outras páginas
import Dashboard from './pages/member/Dashboard';

// Componentes de layout protegido
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoutes>
    <Layout>
      {children || <Outlet />}
    </Layout>
  </ProtectedRoutes>
);

const AdminProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <AdminProtectedRoutes>
    <Layout>
      {children || <Outlet />}
    </Layout>
  </AdminProtectedRoutes>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota padrão - Redireciona para o dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rotas protegidas - Membros */}
        <Route element={<ProtectedLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Rotas do fórum */}
          <Route path="/forum" element={<ForumHomePage />} />
          <Route path="/forum/categoria/:slug" element={<CategoryPage />} />
          <Route path="/forum/topico/:id" element={<TopicPage />} />
          <Route path="/forum/novo" element={<NewTopicPage />} />
          <Route path="/forum/categoria/:slug/novo" element={<NewTopicPage />} />
        </Route>
        
        {/* Rotas protegidas - Admin */}
        <Route element={<AdminProtectedLayout />}>
          {/* Rotas admin do fórum */}
          <Route path="/admin/forum" element={<AdminForumPage />} />
        </Route>
        
        {/* Outras rotas do sistema - Use AppRoutes para rotas adicionais */}
        <Route path="*" element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
