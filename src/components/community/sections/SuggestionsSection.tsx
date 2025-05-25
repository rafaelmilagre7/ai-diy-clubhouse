
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, Plus, TrendingUp } from 'lucide-react';

export const SuggestionsSection = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Sugestões da Comunidade</h2>
          <p className="text-muted-foreground">Compartilhe ideias para melhorar nossa plataforma</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Sugestão
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Mais Votadas
        </Button>
        <Button variant="ghost" className="flex items-center gap-2">
          Recentes
        </Button>
        <Button variant="ghost" className="flex items-center gap-2">
          Em Análise
        </Button>
        <Button variant="ghost" className="flex items-center gap-2">
          Implementadas
        </Button>
      </div>
      
      <div className="space-y-4">
        {/* Mock suggestions */}
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 w-12">
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{15 + i * 3}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={i === 0 ? "default" : "secondary"}>
                      {i === 0 ? "Em Análise" : "Nova"}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">
                    Adicionar sistema de notificações em tempo real
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    Seria muito útil receber notificações quando alguém responde nossos tópicos ou quando há novidades importantes na comunidade...
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/avatars/user${i + 1}.jpg`} />
                        <AvatarFallback>U{i + 1}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">por Usuário {i + 1}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      {3 + i} comentários
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
