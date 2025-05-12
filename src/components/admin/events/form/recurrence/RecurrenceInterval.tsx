
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EventFormData } from "../EventFormSchema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface RecurrenceIntervalProps {
  form: UseFormReturn<EventFormData>;
  pattern?: string;
}

export const RecurrenceInterval = ({ form, pattern }: RecurrenceIntervalProps) => {
  return (
    <FormField
      control={form.control}
      name="recurrence_interval"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Intervalo</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button" asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  {pattern === "daily" && "A cada quantos dias"}
                  {pattern === "weekly" && "A cada quantas semanas"}
                  {pattern === "monthly" && "A cada quantos meses"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <FormControl>
            <Input
              type="number"
              min={1}
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value) || 1)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
