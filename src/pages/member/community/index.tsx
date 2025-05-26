
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CommunityHome from './CommunityHome';
import CommunityMembers from './CommunityMembers';
import ConnectionsPage from './ConnectionsPage';
import MessagesPage from './MessagesPage';

// Páginas temporárias para sugestões e eventos
const SuggestionsPage = () => (
  <div className="container max-w-7xl mx-auto py-6">
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold mb-4">Sugestões da Comunidade</h1>
      <p className="text-muted-foreground">Em breve...</p>
    </div>
  </div>
);

const EventsPage = () => (
  <div className="container max-w-7xl mx-auto py-6">
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold mb-4">Eventos da Comunidade</h1>
      <p className="text-muted-foreground">Em breve...</p>
    </div>
  </div>
);

const CommunityPages = () => {
  return (
    <Routes>
      <Route index element={<CommunityHome />} />
      <Route path="membros" element={<CommunityMembers />} />
      <Route path="conexoes" element={<ConnectionsPage />} />
      <Route path="mensagens" element={<MessagesPage />} />
      <Route path="sugestoes" element={<SuggestionsPage />} />
      <Route path="eventos" element={<EventsPage />} />
    </Routes>
  );
};

export default CommunityPages;
