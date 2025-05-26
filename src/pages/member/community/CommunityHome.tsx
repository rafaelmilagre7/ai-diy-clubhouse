
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ForumHeader } from '@/components/community/ForumHeader';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { ForumSection } from '@/components/community/sections/ForumSection';

const CommunityHome = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <ForumBreadcrumbs />
      
      <ForumHeader
        title="Comunidade Viver de IA"
        description="Compartilhe conhecimento, faça perguntas e conecte-se com outros membros da comunidade."
        showNewTopicButton={true}
      />
      
      <ForumSection />
    </div>
  );
};

export default CommunityHome;
