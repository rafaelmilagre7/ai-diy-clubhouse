
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { type EventFormData } from "./EventFormSchema";
import { EventRoleCheckboxes } from "./EventRoleCheckboxes";
import { Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventRoleAccessProps {
  form: UseFormReturn<EventFormData>;
}

export const EventRoleAccess = ({ form }: EventRoleAccessProps) => {
  const selectedRoles = form.watch("role_ids") || [];
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm flex items-center gap-2">
        <Users className="w-4 h-4" />
        Controle de Acesso
      </h3>
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
            <Alert variant="default" className={`mt-2 ${selectedRoles.length > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <AlertDescription className="text-sm text-muted-foreground">
                {selectedRoles.length === 0 
                  ? "Evento público: Todos os usuários terão acesso a este evento."
                  : `Evento restrito: Apenas usuários com os papéis selecionados (${selectedRoles.length}) terão acesso.`
                }
              </AlertDescription>
            </Alert>
          </FormItem>
        )}
      />
    </div>
  );
};
