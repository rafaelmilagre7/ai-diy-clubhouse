
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CommunityHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Comunidade Viver de IA
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Conecte-se, aprenda e cresça com outros profissionais de IA
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="lg" asChild>
            <Link to="/comunidade/membros">
              <Users className="h-4 w-4 mr-2" />
              Explorar Membros
            </Link>
          </Button>
          
          <Button size="lg" asChild>
            <Link to="/comunidade/novo-topico">
              <Plus className="h-4 w-4 mr-2" />
              Novo Tópico
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-sm text-muted-foreground">Discussões</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">5,678</p>
              <p className="text-sm text-muted-foreground">Membros Ativos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">892</p>
              <p className="text-sm text-muted-foreground">Soluções</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
