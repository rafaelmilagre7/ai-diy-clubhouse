
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EventFormData } from "../EventFormSchema";

interface RecurrenceEndOptionsProps {
  form: UseFormReturn<EventFormData>;
}

export const RecurrenceEndOptions = ({ form }: RecurrenceEndOptionsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="recurrence_count"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Ocorrências</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="Sem limite"
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : undefined;
                  field.onChange(value);
                  
                  // Limpar a data de término se um número for especificado
                  if (value) {
                    form.setValue("recurrence_end_date", undefined);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="recurrence_end_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Término</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                value={field.value ? field.value.split('T')[0] : ""}
                onChange={(e) => {
                  field.onChange(e.target.value ? `${e.target.value}T00:00:00` : undefined);
                  
                  // Limpar o número de ocorrências se uma data for especificada
                  if (e.target.value) {
                    form.setValue("recurrence_count", undefined);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
