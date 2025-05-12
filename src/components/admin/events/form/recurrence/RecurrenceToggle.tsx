
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { EventFormData } from "../EventFormSchema";

interface RecurrenceToggleProps {
  form: UseFormReturn<EventFormData>;
}

export const RecurrenceToggle = ({ form }: RecurrenceToggleProps) => {
  return (
    <FormField
      control={form.control}
      name="is_recurring"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Evento Recorrente</FormLabel>
            <p className="text-sm text-muted-foreground">
              Ative para configurar um evento que se repete regularmente
            </p>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
