
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CommunityHome from './CommunityHome';
import CommunityMembers from './CommunityMembers';
import ConnectionsPage from './ConnectionsPage';
import MessagesPage from './MessagesPage';
import NotificationsPage from './NotificationsPage';
import CategoryTopics from './CategoryTopics';
import NewTopicPage from './NewTopicPage';
import TopicDetailPage from './TopicDetailPage';

// Página temporária para sugestões
const SuggestionsPage = () => (
  <div className="container max-w-7xl mx-auto py-6">
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold mb-4">Sugestões da Comunidade</h1>
      <p className="text-muted-foreground">
        Compartilhe suas ideias para melhorar a plataforma e a comunidade.
      </p>
      <p className="text-muted-foreground mt-2">
        Em breve você poderá enviar sugestões e votar nas ideias de outros membros.
      </p>
    </div>
  </div>
);

const CommunityPages = () => {
  console.log('CommunityPages renderizando - rotas da comunidade disponíveis');
  
  return (
    <Routes>
      <Route index element={<CommunityHome />} />
      <Route path="membros" element={<CommunityMembers />} />
      <Route path="conexoes" element={<ConnectionsPage />} />
      <Route path="mensagens" element={<MessagesPage />} />
      <Route path="notificacoes" element={<NotificationsPage />} />
      <Route path="sugestoes" element={<SuggestionsPage />} />
      <Route path="categoria/:categorySlug" element={<CategoryTopics />} />
      <Route path="novo-topico" element={<NewTopicPage />} />
      <Route path="novo-topico/:categorySlug" element={<NewTopicPage />} />
      <Route path="topico/:topicId" element={<TopicDetailPage />} />
    </Routes>
  );
};

export default CommunityPages;
