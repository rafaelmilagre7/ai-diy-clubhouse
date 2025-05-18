
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Layout from './components/layout/Layout';
import { ProtectedRoutes } from './auth/ProtectedRoutes';
import { AdminProtectedRoutes } from './auth/AdminProtectedRoutes';
import { FormacaoProtectedRoutes } from './auth/FormacaoProtectedRoutes';
import { AuthProvider } from './contexts/auth/AuthProvider';
import NotFound from './pages/NotFound';
import InvitePage from './pages/InvitePage';

// Páginas do membro
import Dashboard from './pages/member/Dashboard';
import Profile from './pages/member/Profile';

// Páginas admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Páginas formação
import FormacaoDashboard from './pages/formacao/FormacaoDashboard';
import FormacaoCursos from './pages/formacao/FormacaoCursos';
import FormacaoCursoDetalhes from './pages/formacao/FormacaoCursoDetalhes';
import FormacaoModuloDetalhes from './pages/formacao/FormacaoModuloDetalhes';
import FormacaoAulas from './pages/formacao/FormacaoAulas';
import FormacaoAulaDetalhes from './pages/formacao/FormacaoAulaDetalhes';
import FormacaoAulaEditar from './pages/formacao/FormacaoAulaEditar';

// Páginas do fórum
import { ForumHomePage } from './pages/forum/ForumHomePage';
import { CategoryPage } from './pages/forum/CategoryPage';
import { TopicPage } from './pages/forum/TopicPage';
import { NewTopicPage } from './pages/forum/NewTopicPage';
import { AdminForumPage } from './pages/forum/AdminForumPage';

// Páginas de autenticação
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import SetNewPassword from './pages/auth/SetNewPassword';

function App() {
  console.log("App renderizando com rotas centralizadas");
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas de convite - Alta prioridade e fora do sistema de autenticação */}
          <Route path="/convite/:token" element={<InvitePage />} />
          <Route path="/convite" element={<InvitePage />} />
          
          {/* Rotas de autenticação */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-password" element={<SetNewPassword />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          
          {/* Rotas protegidas - Membros */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Rotas do fórum */}
              <Route path="/forum" element={<ForumHomePage />} />
              <Route path="/forum/categoria/:slug" element={<CategoryPage />} />
              <Route path="/forum/topico/:id" element={<TopicPage />} />
              <Route path="/forum/novo" element={<NewTopicPage />} />
              <Route path="/forum/categoria/:slug/novo" element={<NewTopicPage />} />
              
              {/* Outras rotas de membro podem ser adicionadas aqui */}
            </Route>
          </Route>
          
          {/* Rotas protegidas - Admin */}
          <Route element={<AdminProtectedRoutes />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/forum" element={<AdminForumPage />} />
              {/* Outras rotas admin podem ser adicionadas aqui */}
            </Route>
          </Route>
          
          {/* Rotas protegidas - Formação */}
          <Route element={<FormacaoProtectedRoutes />}>
            <Route element={<Layout />}>
              <Route path="/formacao" element={<FormacaoDashboard />} />
              <Route path="/formacao/cursos" element={<FormacaoCursos />} />
              <Route path="/formacao/cursos/:id" element={<FormacaoCursoDetalhes />} />
              <Route path="/formacao/modulos/:id" element={<FormacaoModuloDetalhes />} />
              <Route path="/formacao/aulas" element={<FormacaoAulas />} />
              <Route path="/formacao/aulas/:id" element={<FormacaoAulaDetalhes />} />
              <Route path="/formacao/aulas/:id/editar" element={<FormacaoAulaEditar />} />
            </Route>
          </Route>
          
          {/* Fallback para rotas não encontradas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
