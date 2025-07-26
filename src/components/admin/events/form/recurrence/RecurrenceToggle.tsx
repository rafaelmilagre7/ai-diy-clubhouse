
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { EventFormData } from "../EventFormSchema";
import { CalendarClock } from "lucide-react";

interface RecurrenceToggleProps {
  form: UseFormReturn<EventFormData>;
}

export const RecurrenceToggle = ({ form }: RecurrenceToggleProps) => {
  const isRecurring = form.watch("is_recurring");

  return (
    <FormField
      control={form.control}
      name="is_recurring"
      render={({ field }) => (
        <FormItem className={`flex flex-row items-center justify-between rounded-lg border p-4 transition-all ${
          isRecurring 
            ? 'surface-overlay border-viverblue/30 bg-viverblue/5' 
            : 'surface-elevated border-border/50'
        }`}>
          <div className="flex items-center space-x-3">
            <CalendarClock className={`w-5 h-5 ${isRecurring ? 'text-viverblue' : 'text-text-muted'}`} />
            <div className="space-y-1">
              <FormLabel className="text-label text-text-primary">Evento Recorrente</FormLabel>
              <p className="text-body-small text-text-muted">
                Ative para configurar um evento que se repete regularmente
              </p>
            </div>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
              }}
              className="data-[state=checked]:bg-viverblue data-[state=unchecked]:bg-surface-base"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
