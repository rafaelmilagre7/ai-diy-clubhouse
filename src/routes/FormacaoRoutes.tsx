
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FormacaoProtectedRoutes } from '@/auth/FormacaoProtectedRoutes';
import FormacaoLayout from '@/components/layout/formacao/FormacaoLayout';

// Formação (Admin LMS)
import FormacaoDashboard from '@/pages/formacao/FormacaoDashboard';
import FormacaoCursos from '@/pages/formacao/FormacaoCursos';
import FormacaoCursoDetalhes from '@/pages/formacao/FormacaoCursoDetalhes';
import FormacaoModuloDetalhes from '@/pages/formacao/FormacaoModuloDetalhes';
import FormacaoAulas from '@/pages/formacao/FormacaoAulas';
import FormacaoAulaDetalhes from '@/pages/formacao/FormacaoAulaDetalhes';
import FormacaoAulaEditar from '@/pages/formacao/FormacaoAulaEditar';

export const FormacaoRoutes = () => {
  return (
    <Routes>
      <Route index element={
        <FormacaoProtectedRoutes>
          <FormacaoLayout>
            <FormacaoDashboard />
          </FormacaoLayout>
        </FormacaoProtectedRoutes>
      } />
      
      <Route path="cursos" element={
        <FormacaoProtectedRoutes>
          <FormacaoLayout>
            <FormacaoCursos />
          </FormacaoLayout>
        </FormacaoProtectedRoutes>
      } />
      
      <Route path="cursos/:id" element={
        <FormacaoProtectedRoutes>
          <FormacaoLayout>
            <FormacaoCursoDetalhes />
          </FormacaoLayout>
        </FormacaoProtectedRoutes>
      } />
      
      <Route path="modulos/:id" element={
        <FormacaoProtectedRoutes>
          <FormacaoLayout>
            <FormacaoModuloDetalhes />
          </FormacaoLayout>
        </FormacaoProtectedRoutes>
      } />
      
      <Route path="aulas" element={
        <FormacaoProtectedRoutes>
          <FormacaoLayout>
            <FormacaoAulas />
          </FormacaoLayout>
        </FormacaoProtectedRoutes>
      } />
      
      <Route path="aulas/:id" element={
        <FormacaoProtectedRoutes>
          <FormacaoLayout>
            <FormacaoAulaDetalhes />
          </FormacaoLayout>
        </FormacaoProtectedRoutes>
      } />
      
      <Route path="aulas/:id/editar" element={
        <FormacaoProtectedRoutes>
          <FormacaoLayout>
            <FormacaoAulaEditar />
          </FormacaoLayout>
        </FormacaoProtectedRoutes>
      } />
      
      <Route path="materiais" element={
        <FormacaoProtectedRoutes>
          <FormacaoLayout>
            <div>Página de Materiais</div>
          </FormacaoLayout>
        </FormacaoProtectedRoutes>
      } />
      
      <Route path="alunos" element={
        <FormacaoProtectedRoutes>
          <FormacaoLayout>
            <div>Página de Alunos</div>
          </FormacaoLayout>
        </FormacaoProtectedRoutes>
      } />
      
      <Route path="configuracoes" element={
        <FormacaoProtectedRoutes>
          <FormacaoLayout>
            <div>Configurações do LMS</div>
          </FormacaoLayout>
        </FormacaoProtectedRoutes>
      } />
    </Routes>
  );
};
