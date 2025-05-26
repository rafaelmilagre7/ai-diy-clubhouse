
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { TopicsList } from '@/components/community/TopicsList';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';

const CommunityHome = () => {
  const { categories, isLoading: categoriesLoading } = useForumCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container max-w-7xl mx-auto py-8 px-4">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Comunidade Viver de IA
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conecte-se, aprenda e compartilhe conhecimento com outros membros da nossa comunidade
            </p>
            <div className="flex justify-center">
              <Button asChild size="lg">
                <Link to="/comunidade/novo-topico">
                  <Plus className="h-5 w-5 mr-2" />
                  Iniciar Discussão
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div className="bg-white border-b">
        <div className="container max-w-7xl mx-auto px-4">
          <CommunityNavigation />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Conteúdo principal */}
          <div className="xl:col-span-3">
            <TopicsList />
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Estatísticas rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atividade da Comunidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Discussões Ativas</span>
                  </div>
                  <Badge variant="secondary">142</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Membros Online</span>
                  </div>
                  <Badge variant="secondary">28</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Tópicos em Alta</span>
                  </div>
                  <Badge variant="secondary">7</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Categorias */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.slice(0, 6).map((category) => (
                      <Link
                        key={category.id}
                        to={`/comunidade/categoria/${category.slug}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {category.icon && <span className="text-lg">{category.icon}</span>}
                          <div>
                            <p className="font-medium text-sm">{category.name}</p>
                            {category.description && (
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {category.topic_count || 0}
                        </Badge>
                      </Link>
                    ))}
                    
                    {categories.length > 6 && (
                      <Link 
                        to="/comunidade/categorias"
                        className="block text-center text-sm text-blue-600 hover:text-blue-700 pt-2"
                      >
                        Ver todas as categorias
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Links úteis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Links Úteis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link 
                  to="/comunidade/membros"
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Explorar Membros</span>
                  </div>
                </Link>
                <Link 
                  to="/comunidade/conexoes"
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Minhas Conexões</span>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHome;
