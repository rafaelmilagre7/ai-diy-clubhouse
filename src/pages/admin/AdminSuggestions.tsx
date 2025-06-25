
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

const AdminSuggestions = () => {
  const suggestions = [
    { 
      id: '1', 
      title: 'IA para Análise de Sentimentos', 
      author: 'João Silva', 
      status: 'pendente',
      votes: 15,
      date: '2 dias atrás'
    },
    { 
      id: '2', 
      title: 'Automação de Relatórios', 
      author: 'Maria Santos', 
      status: 'aprovado',
      votes: 32,
      date: '1 semana atrás'
    },
    { 
      id: '3', 
      title: 'Chatbot Multilíngue', 
      author: 'Pedro Costa', 
      status: 'rejeitado',
      votes: 8,
      date: '3 dias atrás'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'default';
      case 'rejeitado': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Sugestões</h1>
          <p className="text-muted-foreground">
            Avalie e gerencie sugestões da comunidade
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>Sugestões</CardTitle>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar sugestões..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{suggestion.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Por {suggestion.author} • {suggestion.votes} votos • {suggestion.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(suggestion.status)}>
                    {suggestion.status}
                  </Badge>
                  {suggestion.status === 'pendente' && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-green-600">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSuggestions;
