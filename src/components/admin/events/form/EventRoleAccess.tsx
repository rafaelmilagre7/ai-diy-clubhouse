
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EventRoleCheckboxes } from "./EventRoleCheckboxes";
import { EventAccessPreview } from "../debug/EventAccessPreview";
import { Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventRoleAccessProps {
  selectedRoles: string[];
  onChange: (selectedIds: string[]) => void;
  eventId?: string;
}

export const EventRoleAccess = ({ selectedRoles, onChange, eventId }: EventRoleAccessProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm flex items-center gap-2">
        <Users className="w-4 h-4" />
        Controle de Acesso
      </h3>
      <FormItem>
        <FormLabel>Acesso ao Evento</FormLabel>
        <EventRoleCheckboxes 
          selectedRoles={selectedRoles}
          onChange={onChange}
        />
        <FormMessage />
        <Alert variant="default" className={`mt-2 ${
          selectedRoles.length > 0 
            ? 'bg-permission-partial/10 border-permission-partial/20' 
            : 'bg-permission-granted/10 border-permission-granted/20'
        }`}>
          <AlertDescription className={`text-sm ${
            selectedRoles.length > 0 
              ? 'text-permission-partial' 
              : 'text-permission-granted'
          }`}>
            {selectedRoles.length === 0 
              ? "Evento público: Todos os usuários terão acesso a este evento."
              : `Evento restrito: Apenas usuários com os papéis selecionados (${selectedRoles.length}) terão acesso.`
            }
          </AlertDescription>
        </Alert>
        
        {/* Preview de usuários com acesso */}
        <EventAccessPreview 
          selectedRoles={selectedRoles}
          eventId={eventId}
        />
      </FormItem>
    </div>
  );
};
