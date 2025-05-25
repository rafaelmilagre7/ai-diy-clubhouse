
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Zap, Brain, Code, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 'discussoes-gerais',
    name: 'Discussões Gerais',
    description: 'Conversas sobre IA, tendências e novidades',
    icon: MessageSquare,
    color: 'bg-blue-500/10 text-blue-500',
    topicsCount: 234,
    membersCount: 1567
  },
  {
    id: 'ferramentas-ia',
    name: 'Ferramentas de IA',
    description: 'Compartilhe e descubra novas ferramentas',
    icon: Zap,
    color: 'bg-yellow-500/10 text-yellow-500',
    topicsCount: 189,
    membersCount: 892
  },
  {
    id: 'implementacao',
    name: 'Implementação',
    description: 'Casos práticos e implementações reais',
    icon: Brain,
    color: 'bg-purple-500/10 text-purple-500',
    topicsCount: 156,
    membersCount: 743
  },
  {
    id: 'desenvolvimento',
    name: 'Desenvolvimento',
    description: 'Programação, APIs e desenvolvimento técnico',
    icon: Code,
    color: 'bg-green-500/10 text-green-500',
    topicsCount: 298,
    membersCount: 634
  },
  {
    id: 'negocios',
    name: 'Negócios e IA',
    description: 'Estratégias de negócio e monetização',
    icon: Briefcase,
    color: 'bg-orange-500/10 text-orange-500',
    topicsCount: 167,
    membersCount: 892
  },
  {
    id: 'networking',
    name: 'Networking',
    description: 'Conecte-se com outros profissionais',
    icon: Users,
    color: 'bg-pink-500/10 text-pink-500',
    topicsCount: 89,
    membersCount: 456
  }
];

export const ForumCategories = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Categorias do Fórum</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Link key={category.id} to={`/comunidade/categoria/${category.id}`}>
            <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/20 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary">{category.topicsCount}</Badge>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{category.topicsCount} tópicos</span>
                  <span>{category.membersCount} membros</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
