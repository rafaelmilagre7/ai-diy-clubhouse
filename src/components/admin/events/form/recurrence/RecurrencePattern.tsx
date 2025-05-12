
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { EventFormData, recurrencePatterns } from "../EventFormSchema";

interface RecurrencePatternProps {
  form: UseFormReturn<EventFormData>;
}

export const RecurrencePattern = ({ form }: RecurrencePatternProps) => {
  return (
    <FormField
      control={form.control}
      name="recurrence_pattern"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Frequência</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {recurrencePatterns.map((pattern) => (
                <SelectItem key={pattern.value} value={pattern.value}>
                  {pattern.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
