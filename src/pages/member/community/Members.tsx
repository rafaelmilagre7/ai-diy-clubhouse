
import { useState } from 'react';
import { ForumHeader } from '@/components/community/ForumHeader';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';

const MembersPage = () => {
  return (
    <div className="container mx-auto max-w-7xl py-6">
      <ForumBreadcrumbs section="membros" sectionTitle="Membros" />
      
      <ForumHeader 
        title="Membros da Comunidade" 
        description="Conecte-se com outros membros da comunidade VIVER DE IA"
      />
      
      <CommunityNavigation />
      
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Diretório de membros estará disponível em breve.
        </p>
      </div>
    </div>
  );
};

export default MembersPage;
