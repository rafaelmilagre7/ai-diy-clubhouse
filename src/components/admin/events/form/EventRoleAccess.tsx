
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { type EventFormData } from "./EventFormSchema";
import { EventRoleCheckboxes } from "./EventRoleCheckboxes";

interface EventRoleAccessProps {
  form: UseFormReturn<EventFormData>;
}

export const EventRoleAccess = ({ form }: EventRoleAccessProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Controle de Acesso</h3>
      <FormField
        control={form.control}
        name="role_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Acesso ao Evento</FormLabel>
            <FormControl>
              <EventRoleCheckboxes 
                selectedRoles={field.value || []}
                onChange={field.onChange}
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
