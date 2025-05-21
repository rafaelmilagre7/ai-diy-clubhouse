
import React from 'react';
import { useParams } from 'react-router-dom';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';

const TopicDetail = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        section="forum"
        sectionTitle="Tópico"
      />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Detalhes do Tópico</h1>
        <p className="text-muted-foreground">
          ID do Tópico: {id}
        </p>
      </div>
      
      <CommunityNavigation />
      
      <div className="py-10 text-center">
        <p className="text-lg mb-2">Esta funcionalidade está sendo implementada</p>
        <p className="text-muted-foreground">
          Em breve você poderá visualizar o conteúdo completo deste tópico
        </p>
      </div>
    </div>
  );
};

export default TopicDetail;
