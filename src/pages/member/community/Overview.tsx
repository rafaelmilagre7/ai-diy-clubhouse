
import React from 'react';
import { ForumHeader } from '@/components/community/ForumHeader';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';

const CommunityOverview = () => {
  return (
    <div className="container mx-auto max-w-7xl py-6">
      <ForumBreadcrumbs />
      
      <ForumHeader 
        title="Comunidade VIVER DE IA" 
        description="Bem-vindo à comunidade VIVER DE IA. Aqui você pode conectar-se com outros membros, compartilhar conhecimentos e discutir sobre IA e negócios."
      />
      
      <CommunityNavigation />
      
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold">Visão Geral da Comunidade</h2>
        <p className="text-muted-foreground">
          Explore os diferentes fóruns, conecte-se com outros membros e participe das discussões.
          Em breve teremos mais recursos disponíveis nessa página.
        </p>
      </div>
    </div>
  );
};

export default CommunityOverview;
