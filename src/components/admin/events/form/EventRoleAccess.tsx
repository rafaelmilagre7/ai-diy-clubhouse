
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { MultiSelect, type OptionType } from "@/components/ui/multi-select";
import { UseFormReturn } from "react-hook-form";
import { type EventFormData } from "./EventFormSchema";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface EventRoleAccessProps {
  form: UseFormReturn<EventFormData>;
}

export const EventRoleAccess = ({ form }: EventRoleAccessProps) => {
  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, name, description');
      
      if (error) throw error;
      return data;
    }
  });

  const roleOptions: OptionType[] = roles?.map(role => ({
    value: role.id,
    label: role.name
  })) || [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="role_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Acesso ao Evento</FormLabel>
            <FormControl>
              <MultiSelect
                options={roleOptions}
                selected={field.value || []}
                onChange={field.onChange}
                placeholder="Selecione os papéis que terão acesso (deixe vazio para acesso público)"
              />
            </FormControl>
            <FormMessage />
            <p className="text-sm text-muted-foreground mt-1">
              Selecione os papéis que terão acesso a este evento. Se nenhum papel for selecionado, o evento será público.
            </p>
          </FormItem>
        )}
      />
    </div>
  );
};
