import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export const BuilderRoleLimits: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingLimits, setEditingLimits] = useState<Record<string, number>>({});

  // Fetch roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Update role limit mutation
  const updateLimitMutation = useMutation({
    mutationFn: async ({ roleId, limit }: { roleId: string; limit: number }) => {
      // Primeiro buscar as permissões atuais
      const { data: currentRole, error: fetchError } = await supabase
        .from('user_roles')
        .select('permissions')
        .eq('id', roleId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Atualizar as permissões com o novo limite
      const updatedPermissions = {
        ...(currentRole.permissions || {}),
        builder_limit: limit
      };
      
      const { error } = await supabase
        .from('user_roles')
        .update({ permissions: updatedPermissions })
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Limite atualizado com sucesso!');
      setEditingLimits({});
    },
    onError: (error) => {
      console.error('Erro ao atualizar limite:', error);
      toast.error('Erro ao atualizar limite');
    }
  });

  const handleSave = (roleId: string) => {
    const limit = editingLimits[roleId];
    if (limit !== undefined) {
      updateLimitMutation.mutate({ roleId, limit });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Limites por Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Gestão de Limites por Role
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure o limite mensal de gerações para cada role
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Banner */}
        <div className="p-4 rounded-lg bg-status-info/10 border border-status-info/20 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-status-info flex-shrink-0 mt-0.5" />
          <div className="text-sm text-status-info">
            <p className="font-medium mb-1">Como funciona:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Cada role pode ter um limite mensal customizado</li>
              <li>Admins sempre têm acesso ilimitado (999999)</li>
              <li>Limite padrão para novos roles: 3 gerações/mês</li>
              <li>As alterações afetam novos ciclos mensais</li>
            </ul>
          </div>
        </div>

        {/* Roles Table */}
        <div className="space-y-3">
          {roles?.map((role) => {
            const currentLimit = role.permissions?.builder_limit || 3;
            const isAdmin = role.name === 'admin';
            const isEditing = editingLimits[role.id] !== undefined;
            const newLimit = isEditing ? editingLimits[role.id] : currentLimit;

            return (
              <div 
                key={role.id}
                className="p-4 rounded-lg border border-border bg-muted/30 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{role.name}</h4>
                    {isAdmin && (
                      <Badge variant="default">Admin</Badge>
                    )}
                    {role.permissions?.builder && (
                      <Badge variant="success">Builder Ativo</Badge>
                    )}
                  </div>
                  {role.description && (
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isAdmin ? (
                    <div className="text-right">
                      <p className="text-lg font-bold text-success">Ilimitado</p>
                      <p className="text-xs text-muted-foreground">Acesso total</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="999999"
                          value={newLimit}
                          onChange={(e) => setEditingLimits(prev => ({
                            ...prev,
                            [role.id]: parseInt(e.target.value) || 0
                          }))}
                          className="w-24 text-center"
                          disabled={updateLimitMutation.isPending}
                        />
                        <span className="text-sm text-muted-foreground">/mês</span>
                      </div>
                      
                      {isEditing && newLimit !== currentLimit && (
                        <Button
                          size="sm"
                          onClick={() => handleSave(role.id)}
                          disabled={updateLimitMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Salvar
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
