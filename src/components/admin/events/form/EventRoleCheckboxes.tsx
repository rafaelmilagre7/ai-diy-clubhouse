
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface EventRoleCheckboxesProps {
  selectedRoles: string[];
  onChange: (selectedIds: string[]) => void;
}

export const EventRoleCheckboxes = ({ selectedRoles, onChange }: EventRoleCheckboxesProps) => {
  const [selected, setSelected] = useState<string[]>(selectedRoles || []);

  // Sincronizar estado interno com props quando selectedRoles mudar
  useEffect(() => {
    setSelected(selectedRoles || []);
  }, [selectedRoles]);

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, name, description');
      
      if (error) throw error;
      return data as Role[];
    }
  });

  // Atualizar seleção de papéis quando um checkbox é alterado
  const handleCheckedChange = (checked: boolean, roleId: string) => {
    let updatedSelection: string[];

    if (checked) {
      // Adicionar à seleção
      updatedSelection = [...selected, roleId];
    } else {
      // Remover da seleção
      updatedSelection = selected.filter(id => id !== roleId);
    }

    setSelected(updatedSelection);
    onChange(updatedSelection);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (!roles?.length) {
    return <p className="text-sm text-muted-foreground">Nenhum papel de usuário encontrado</p>;
  }

  return (
    <ScrollArea className="h-[220px] rounded-md border p-4">
      <div className="space-y-4">
        {roles.map((role) => (
          <div 
            key={role.id}
            className="flex items-start space-x-2 rounded-md hover:bg-muted/50 p-2 transition-colors"
          >
            <Checkbox
              id={`role-${role.id}`}
              checked={selected.includes(role.id)}
              onCheckedChange={(checked) => handleCheckedChange(checked === true, role.id)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor={`role-${role.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {role.name}
              </label>
              {role.description && (
                <p className="text-xs text-muted-foreground">
                  {role.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
