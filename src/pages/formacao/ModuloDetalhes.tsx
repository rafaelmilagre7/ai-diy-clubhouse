import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { Module } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getUserRoleName } from '@/lib/supabase/types';

const ModuloDetalhes = () => {
  const { id, moduleId } = useParams<{ id: string; moduleId: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isFormacao = getUserRoleName(profile) === 'formacao';
  const isAdmin = getUserRoleName(profile) === 'admin';

  useEffect(() => {
    const fetchModule = async () => {
      if (!moduleId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', moduleId)
          .single();

        if (error) {
          console.error('Erro ao buscar módulo:', error);
          toast({
            title: 'Erro ao carregar módulo',
            description: 'Ocorreu um erro ao carregar os detalhes do módulo.',
            variant: 'destructive',
          });
        }

        setModule(data as Module);
      } catch (error) {
        console.error('Erro ao buscar módulo:', error);
        toast({
          title: 'Erro ao carregar módulo',
          description: 'Ocorreu um erro inesperado ao carregar os detalhes do módulo.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Módulo não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{module.title}</h1>
          <p className="text-muted-foreground">Detalhes do módulo</p>
        </div>
        <div>
          <Button variant="outline" onClick={() => navigate(`/formacao/cursos/${id}`)}>
            Voltar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Título</p>
              <p className="text-muted-foreground">{module.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium">ID</p>
              <p className="text-muted-foreground">{module.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Ordem</p>
              <p className="text-muted-foreground">{module.module_order}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Tipo</p>
              <p className="text-muted-foreground">{module.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Conteúdo</p>
              <pre className="text-muted-foreground">{JSON.stringify(module.content, null, 2)}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuloDetalhes;
