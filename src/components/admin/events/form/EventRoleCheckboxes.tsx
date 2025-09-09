
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

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

  // Função para atualizar seleção de papéis quando um checkbox é alterado
  const handleCheckedChange = (checked: boolean, roleId: string) => {
    let updatedSelection: string[];

    if (checked) {
      // Adicionar à seleção
      updatedSelection = [...selectedRoles, roleId];
    } else {
      // Remover da seleção
      updatedSelection = selectedRoles.filter(id => id !== roleId);
    }

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

  const selectedCount = selectedRoles.length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {selectedCount > 0 ? (
          <Badge className="bg-viverblue hover:bg-viverblue/90 text-white">
            <Users className="w-3 h-3 mr-1" />
            {selectedCount} {selectedCount === 1 ? 'papel selecionado' : 'papéis selecionados'}
          </Badge>
        ) : (
          <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
            <Users className="w-3 h-3 mr-1" />
            Nenhum papel selecionado
          </Badge>
        )}
      </div>
      <ScrollArea className="h-[220px] rounded-md border border-border/50 p-4 bg-card">
        <div className="space-y-2">
          {roles.map((role) => {
            const isChecked = selectedRoles.includes(role.id);
            return (
              <div 
                key={role.id}
                className={`flex items-start space-x-2 rounded-md p-2 transition-colors ${
                  isChecked 
                    ? "bg-viverblue/10 dark:bg-viverblue/20 border border-viverblue/30 dark:border-viverblue/40" 
                    : "hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent"
                }`}
              >
                <Checkbox
                  id={`role-${role.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCheckedChange(checked === true, role.id)}
                  className={isChecked ? "data-[state=checked]:bg-viverblue data-[state=checked]:border-viverblue" : ""}
                />
                <div className="grid gap-1.5 leading-none flex-1">
                  <label
                    htmlFor={`role-${role.id}`}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${
                      isChecked ? "text-viverblue dark:text-viverblue" : "text-foreground"
                    }`}
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
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
