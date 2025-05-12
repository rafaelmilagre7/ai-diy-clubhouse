
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { EventFormData, weekDays } from "../EventFormSchema";

interface RecurrenceWeekDayProps {
  form: UseFormReturn<EventFormData>;
}

export const RecurrenceWeekDay = ({ form }: RecurrenceWeekDayProps) => {
  return (
    <FormField
      control={form.control}
      name="recurrence_day"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dia da Semana</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(Number(value))}
            defaultValue={field.value?.toString()}
            value={field.value?.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia da semana" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {weekDays.map((day) => (
                <SelectItem key={day.value} value={day.value.toString()}>
                  {day.label}
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
