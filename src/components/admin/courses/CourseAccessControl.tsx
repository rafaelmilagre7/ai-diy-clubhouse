
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, Save, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CourseAccessControlProps {
  courseId: string;
}

export const CourseAccessControl = ({ courseId }: CourseAccessControlProps) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch available roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role');
      
      if (error) throw error;
      
      // Extract unique roles
      const uniqueRoles = [...new Set((data || []).map((r: any) => r.role))];
      return uniqueRoles;
    }
  });

  // Fetch current course access
  const { data: currentAccess = [], isLoading: accessLoading } = useQuery({
    queryKey: ['course-access', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_access_control')
        .select(`
          role_id,
          user_roles!inner(role)
        `)
        .eq('course_id', courseId);
      
      if (error) throw error;
      return data?.map((item: any) => item.user_roles.role) || [];
    },
    enabled: !!courseId
  });

  // Update access mutation
  const updateAccessMutation = useMutation({
    mutationFn: async (roleIds: string[]) => {
      // First, remove existing access
      await supabase
        .from('course_access_control')
        .delete()
        .eq('course_id', courseId);

      // Then add new access
      if (roleIds.length > 0) {
        const accessData = roleIds.map(roleId => ({
          course_id: courseId,
          role_id: roleId
        }));

        const { error } = await supabase
          .from('course_access_control')
          .insert(accessData);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Controle de acesso atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['course-access', courseId] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar controle de acesso:', error);
      toast.error('Erro ao atualizar controle de acesso');
    }
  });

  // Initialize selected roles when current access loads
  React.useEffect(() => {
    if (currentAccess.length > 0) {
      setSelectedRoles(currentAccess);
    }
  }, [currentAccess]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSave = () => {
    updateAccessMutation.mutate(selectedRoles);
  };

  if (rolesLoading || accessLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Controle de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!roles.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Controle de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nenhum papel de usuário encontrado. Configure os papéis primeiro.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Controle de Acesso ao Curso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Papéis com Acesso
          </h4>
          
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={role}
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={() => handleRoleToggle(role)}
                  />
                  <label htmlFor={role} className="font-medium capitalize cursor-pointer">
                    {role}
                  </label>
                </div>
                
                {currentAccess.includes(role) && (
                  <Badge variant="secondary">Atual</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedRoles.length === 0 
              ? 'Nenhum papel selecionado - curso privado'
              : `${selectedRoles.length} papéis selecionados`
            }
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={updateAccessMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateAccessMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
