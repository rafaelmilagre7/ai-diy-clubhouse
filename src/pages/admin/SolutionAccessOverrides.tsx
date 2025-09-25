import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SolutionAccessOverride {
  id: string;
  solution_id: string;
  role_id: string;
  created_at: string;
  created_by: string;
  solutions: {
    title: string;
    category: string;
  };
  user_roles: {
    name: string;
    description: string;
  };
}

const SolutionAccessOverrides = () => {
  const [selectedSolution, setSelectedSolution] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const queryClient = useQueryClient();

  // Buscar soluções
  const { data: solutions = [] } = useQuery({
    queryKey: ['admin-solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('id, title, category')
        .eq('published', true)
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar roles
  const { data: roles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, name, description')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar exceções existentes
  const { data: overrides = [], isLoading } = useQuery({
    queryKey: ['solution-access-overrides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_access_overrides')
        .select(`
          id,
          solution_id,
          role_id,
          created_at,
          created_by,
          solutions(title, category),
          user_roles(name, description)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(item => ({
        ...item,
        solutions: Array.isArray(item.solutions) ? item.solutions[0] : item.solutions,
        user_roles: Array.isArray(item.user_roles) ? item.user_roles[0] : item.user_roles,
      })) as SolutionAccessOverride[];
    }
  });

  // Criar exceção
  const createOverrideMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSolution || !selectedRole) {
        throw new Error('Solução e role devem ser selecionados');
      }

      const { error } = await supabase
        .from('solution_access_overrides')
        .insert({
          solution_id: selectedSolution,
          role_id: selectedRole,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-access-overrides'] });
      setSelectedSolution('');
      setSelectedRole('');
      toast.success('Acesso específico liberado com sucesso!');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Este acesso já foi liberado para este role.');
      } else {
        toast.error('Erro ao liberar acesso: ' + error.message);
      }
    }
  });

  // Remover exceção
  const removeOverrideMutation = useMutation({
    mutationFn: async (overrideId: string) => {
      const { error } = await supabase
        .from('solution_access_overrides')
        .delete()
        .eq('id', overrideId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-access-overrides'] });
      toast.success('Acesso específico removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover acesso: ' + error.message);
    }
  });

  const handleCreateOverride = () => {
    createOverrideMutation.mutate();
  };

  const handleRemoveOverride = (overrideId: string) => {
    removeOverrideMutation.mutate(overrideId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Acesso Específico às Soluções
          </h1>
          <p className="text-muted-foreground mt-2">
            Libere o acesso a soluções específicas para roles que normalmente não têm acesso geral.
          </p>
        </div>
      </div>

      {/* Formulário para criar nova exceção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Liberar Acesso Específico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="solution">Selecionar Solução</Label>
              <Select value={selectedSolution} onValueChange={setSelectedSolution}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma solução..." />
                </SelectTrigger>
                <SelectContent>
                  {solutions.map((solution) => (
                    <SelectItem key={solution.id} value={solution.id}>
                      {solution.title} ({solution.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="role">Selecionar Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um role..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} {role.description && `- ${role.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleCreateOverride}
            disabled={!selectedSolution || !selectedRole || createOverrideMutation.isPending}
            className="w-full md:w-auto"
          >
            {createOverrideMutation.isPending ? 'Liberando...' : 'Liberar Acesso'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Lista de exceções existentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Acessos Específicos Ativos ({overrides.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : overrides.length === 0 ? (
            <p className="text-muted-foreground">Nenhum acesso específico configurado ainda.</p>
          ) : (
            <div className="space-y-3">
              {overrides.map((override) => (
                <div key={override.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{override.solutions?.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Categoria: {override.solutions?.category}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        Role: {override.user_roles?.name}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Criado em: {new Date(override.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveOverride(override.id)}
                    disabled={removeOverrideMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SolutionAccessOverrides;