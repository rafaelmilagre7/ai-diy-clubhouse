
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Eye, CheckCircle, Clock, Pin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ForumTopicsProps {
  searchQuery: string;
  filter: string;
}

// Mock data - será substituído por dados reais da API
const mockTopics = [
  {
    id: '1',
    title: 'Como implementar ChatGPT na sua empresa de forma eficiente?',
    content: 'Estou buscando as melhores práticas para implementar o ChatGPT...',
    category: 'Implementação',
    author: {
      name: 'Maria Silva',
      avatar: '/avatars/maria.jpg',
      role: 'Especialista IA'
    },
    stats: {
      replies: 24,
      views: 456,
      solved: true
    },
    isPinned: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Ferramentas de IA mais promissoras para 2024',
    content: 'Vamos discutir quais ferramentas de IA vocês acreditam...',
    category: 'Ferramentas de IA',
    author: {
      name: 'João Santos',
      avatar: '/avatars/joao.jpg',
      role: 'Desenvolvedor'
    },
    stats: {
      replies: 18,
      views: 298,
      solved: false
    },
    isPinned: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 15 * 60 * 1000)
  }
];

export const ForumTopics = ({ searchQuery, filter }: ForumTopicsProps) => {
  const filteredTopics = mockTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Discussões Recentes</h2>
        <Badge variant="outline">{filteredTopics.length} tópicos</Badge>
      </div>
      
      <div className="space-y-4">
        {filteredTopics.map((topic) => (
          <Link key={topic.id} to={`/comunidade/topico/${topic.id}`}>
            <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={topic.author.avatar} />
                    <AvatarFallback>{topic.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.isPinned && (
                            <Pin className="h-4 w-4 text-primary" />
                          )}
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                            {topic.title}
                          </h3>
                          {topic.stats.solved && (
                            <Badge className="bg-green-600 hover:bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolvido
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground line-clamp-2 mb-3">
                          {topic.content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-medium">{topic.author.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {topic.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(topic.createdAt, { addSuffix: true, locale: ptBR })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {topic.stats.replies}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {topic.stats.views}
                          </div>
                        </div>
                        
                        <div className="text-xs">
                          Última atividade: {formatDistanceToNow(topic.lastActivity, { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
