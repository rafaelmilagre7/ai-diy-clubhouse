
import React from 'react';
import { useParams } from 'react-router-dom';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { Button } from '@/components/ui/button';

const CategoryView = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        section="forum"
        sectionTitle="Fórum - Categoria"
      />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold">Categoria</h1>
          <p className="text-muted-foreground">
            Tópicos relacionados a esta categoria
          </p>
        </div>
        
        <Button>Novo Tópico</Button>
      </div>
      
      <CommunityNavigation />
      
      <div className="py-10 text-center">
        <p className="text-lg mb-2">Esta funcionalidade está sendo implementada</p>
        <p className="text-muted-foreground">
          Em breve você poderá visualizar todos os tópicos desta categoria
        </p>
      </div>
    </div>
  );
};

export default CategoryView;
