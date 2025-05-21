
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { NewTopicForm } from '@/components/community/NewTopicForm';

const CreateTopic = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const handleCancel = () => {
    navigate(categoryId 
      ? `/comunidade/forum/categoria/${categoryId}`
      : '/comunidade/forum'
    );
  };
  
  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        section="novo-topico"
        sectionTitle="Novo Tópico"
      />
      
      <div className="mt-6">
        <h1 className="text-3xl font-bold">Criar Novo Tópico</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          Compartilhe suas dúvidas, insights ou discussões com a comunidade
        </p>
        
        <NewTopicForm 
          categoryId={categoryId} 
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CreateTopic;
