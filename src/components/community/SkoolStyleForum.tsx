
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, TrendingUp, Clock, MessageSquare, Pin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForumTopics } from '@/hooks/community/useForumTopics';
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/utils/user';

export const SkoolStyleForum = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'recentes' | 'populares'>('recentes');

  const { categories } = useForumCategories();
  
  const { data: topics = [], isLoading } = useForumTopics({
    activeTab: 'todos',
    selectedFilter: activeFilter,
    searchQuery,
    categories
  });

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simples */}
      <div className="bg-white border-b shadow-sm">
        <div className="container max-w-4xl mx-auto py-6 px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Comunidade</h1>
              <p className="text-gray-600 mt-1">Compartilhe conhecimento e conecte-se com outros membros</p>
            </div>
            
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 px-6">
              <Link to="/comunidade/novo-topico">
                <Plus className="h-5 w-5 mr-2" />
                Criar Tópico
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto py-6 px-4">
        {/* Barra de busca e filtros */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar discussões..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg border-gray-200 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant={activeFilter === 'recentes' ? "default" : "outline"}
              onClick={() => setActiveFilter('recentes')}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Recentes
            </Button>
            <Button
              variant={activeFilter === 'populares' ? "default" : "outline"}
              onClick={() => setActiveFilter('populares')}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Em Alta
            </Button>
          </div>
        </div>

        {/* Lista de tópicos */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : topics.length > 0 ? (
          <div className="space-y-3">
            {topics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow border-gray-200">
                <CardContent className="p-6">
                  <Link to={`/comunidade/topico/${topic.id}`} className="block">
                    <div className="flex gap-4">
                      {/* Avatar do autor */}
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={topic.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                          {getInitials(topic.profiles?.name || 'Usuário')}
                        </AvatarFallback>
                      </Avatar>

                      {/* Conteúdo do tópico */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-2">
                              {topic.is_pinned && (
                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                  <Pin className="h-3 w-3 mr-1" />
                                  Fixado
                                </Badge>
                              )}
                              {topic.is_solved && (
                                <Badge className="text-xs bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolvido
                                </Badge>
                              )}
                              {topic.category && (
                                <Badge variant="outline" className="text-xs">
                                  {topic.category.name}
                                </Badge>
                              )}
                            </div>

                            {/* Título */}
                            <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                              {topic.title}
                            </h3>

                            {/* Preview do conteúdo */}
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {topic.content}
                            </p>

                            {/* Meta informações */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="font-medium text-gray-700">
                                {topic.profiles?.name || 'Usuário'}
                              </span>
                              <span>{formatTimeAgo(topic.last_activity_at)}</span>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{topic.reply_count}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>{topic.view_count} visualizações</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="py-16 text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Nenhuma discussão encontrada' : 'Inicie uma nova discussão!'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Tente ajustar sua busca ou crie um novo tópico sobre o assunto.'
                  : 'Seja o primeiro a compartilhar suas ideias e iniciar uma conversa com a comunidade.'
                }
              </p>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/comunidade/novo-topico">
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeiro Tópico
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
