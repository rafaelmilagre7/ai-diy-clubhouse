
import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Forum from './Forum';
import TopicDetail from './TopicDetail';
import CreateTopic from './CreateTopic';
import MemberDetail from './MemberDetail';
import CategoryView from './CategoryView';
import { CommunityMembers } from './CommunityMembers';
import { ConnectionsPage } from './ConnectionsPage';

const CommunityPages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirecionar da rota raiz para o fórum
  useEffect(() => {
    if (location.pathname === '/comunidade') {
      navigate('/comunidade/forum');
    }
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route path="forum" element={<Forum />} />
      <Route path="forum/topico/:id" element={<TopicDetail />} />
      <Route path="forum/novo-topico" element={<CreateTopic />} />
      <Route path="forum/novo-topico/:categoryId" element={<CreateTopic />} />
      <Route path="forum/categoria/:categoryId" element={<CategoryView />} />
      <Route path="membro/:memberId" element={<MemberDetail />} />
      <Route path="membros" element={<CommunityMembers />} />
      <Route path="conexoes" element={<ConnectionsPage />} />
      {/* 
        Recursos será implementado no futuro
        <Route path="recursos" element={<ResourcesPage />} /> 
        
        Sistema de gamificação com pontos e loja serão implementados futuramente
        <Route path="conquistas" element={<AchievementsPage />} />
        <Route path="loja" element={<CommunityShopPage />} />
      */}
    </Routes>
  );
};

export default CommunityPages;
