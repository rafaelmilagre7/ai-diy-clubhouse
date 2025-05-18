
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/layout/Layout';
import { ProtectedRoutes } from './auth/ProtectedRoutes';
import { AdminProtectedRoutes } from './auth/AdminProtectedRoutes';
import { FormacaoProtectedRoutes } from './auth/FormacaoProtectedRoutes';

// Páginas do fórum
import { ForumHomePage } from './pages/forum/ForumHomePage';
import { CategoryPage } from './pages/forum/CategoryPage';
import { TopicPage } from './pages/forum/TopicPage';
import { NewTopicPage } from './pages/forum/NewTopicPage';
import { AdminForumPage } from './pages/forum/AdminForumPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas protegidas - Membros */}
        <Route element={
          <ProtectedRoutes>
            <Layout />
          </ProtectedRoutes>
        }>
          {/* Rotas existentes... */}
          
          {/* Rotas do fórum */}
          <Route path="/forum" element={<ForumHomePage />} />
          <Route path="/forum/categoria/:slug" element={<CategoryPage />} />
          <Route path="/forum/topico/:id" element={<TopicPage />} />
          <Route path="/forum/novo" element={<NewTopicPage />} />
          <Route path="/forum/categoria/:slug/novo" element={<NewTopicPage />} />
          
          {/* Outras rotas existentes... */}
        </Route>
        
        {/* Rotas protegidas - Admin */}
        <Route element={
          <AdminProtectedRoutes>
            <Layout />
          </AdminProtectedRoutes>
        }>
          {/* Rotas admin do fórum */}
          <Route path="/admin/forum" element={<AdminForumPage />} />
          
          {/* Outras rotas admin existentes... */}
        </Route>
        
        {/* Outras rotas existentes... */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
