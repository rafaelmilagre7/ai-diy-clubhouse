
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "./EventFormSchema";

interface EventLocationProps {
  form: UseFormReturn<EventFormData>;
}

export const EventLocation = ({ form }: EventLocationProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Localização</h3>
      <FormField
        control={form.control}
        name="location_link"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link do Call</FormLabel>
            <FormControl>
              <Input placeholder="https://" {...field} />
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
            <FormLabel>Localização Presencial (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Endereço do evento" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
