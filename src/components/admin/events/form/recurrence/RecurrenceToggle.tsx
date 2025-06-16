import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { EventFormData } from "../EventFormSchema";
import { CalendarClock } from "lucide-react";
interface RecurrenceToggleProps {
  form: UseFormReturn<EventFormData>;
}
export const RecurrenceToggle = ({
  form
}: RecurrenceToggleProps) => {
  const isRecurring = form.watch("is_recurring");
  return <FormField control={form.control} name="is_recurring" render={({
    field
  }) => <FormItem className="">
          <div className="flex items-center space-x-3">
            <CalendarClock className={`w-5 h-5 ${isRecurring ? 'text-viverblue' : 'text-muted-foreground'}`} />
            <div className="space-y-0.5">
              <FormLabel className="text-base">Evento Recorrente</FormLabel>
              <p className="text-sm text-muted-foreground">
                Ative para configurar um evento que se repete regularmente
              </p>
            </div>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={checked => {
        field.onChange(checked);
      }} className="data-[state=checked]:bg-viverblue" />
          </FormControl>
        </FormItem>} />;
};