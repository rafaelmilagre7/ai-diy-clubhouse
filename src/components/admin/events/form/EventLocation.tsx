
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "./EventFormSchema";

interface EventLocationProps {
  form: UseFormReturn<EventFormData>;
}

export const EventLocation = ({ form }: EventLocationProps) => {
  return (
    <div className="space-y-6 p-6 surface-elevated rounded-xl border border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-2 h-6 bg-strategy rounded-full" />
        <h3 className="text-heading-3">Localização</h3>
      </div>
      
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="location_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-label">Link da Reunião Online</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://meet.google.com/..." 
                  {...field} 
                  className="bg-surface-base border-border/50 focus:border-viverblue/50 transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="physical_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-label">Localização Presencial (opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Endereço ou local do evento presencial..." 
                  {...field} 
                  className="bg-surface-base border-border/50 focus:border-viverblue/50 transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
