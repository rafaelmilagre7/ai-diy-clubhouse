
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ForumHeader } from '@/components/forum/ForumHeader';
import { TopicForm } from '@/components/forum/TopicForm';
import { useForumCategories } from '@/hooks/forum/useForumCategories';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';

export const NewTopicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories = [] } = useForumCategories();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Encontrar a categoria pelo slug, se fornecido
  const category = slug ? categories.find(c => c.slug === slug) : undefined;
  const categoryId = category?.id;

  // Redirecionar se o usuário não estiver autenticado
  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa estar logado para criar um novo tópico.
            </CardDescription>
          </CardHeader>
          <div className="p-6 flex justify-center">
            <Button onClick={() => navigate('/login')}>
              Fazer Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <ForumHeader 
        title="Novo Tópico" 
        description="Crie um novo tópico de discussão"
        breadcrumbs={[
          { name: 'Categorias', href: '/forum' },
          ...(category ? [{ name: category.name, href: `/forum/categoria/${category.slug}` }] : []),
          { name: 'Novo Tópico', href: `/forum/novo` }
        ]}
      />
      
      <TopicForm categoryId={categoryId} />
    </div>
  );
};
