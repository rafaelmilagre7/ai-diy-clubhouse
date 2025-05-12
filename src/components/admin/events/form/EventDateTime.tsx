
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "./EventFormSchema";
import { RecurrenceToggle } from "./recurrence/RecurrenceToggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, Info } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

interface EventDateTimeProps {
  form: UseFormReturn<EventFormData>;
}

export const EventDateTime = ({ form }: EventDateTimeProps) => {
  const isRecurring = form.watch("is_recurring");
  
  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <h3 className="font-medium text-sm">Data e Horário</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <Info size={14} />
          <span>Para eventos recorrentes, o horário será aplicado a todas as ocorrências</span>
        </div>
      </div>

      <RecurrenceToggle form={form} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Início</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field}
                  className="pointer-events-auto" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Término</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field}
                  className="pointer-events-auto"
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
