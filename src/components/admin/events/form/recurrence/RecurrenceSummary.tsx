
import { format } from "date-fns";
import { EventFormData, weekDays } from "../EventFormSchema";
import { UseFormReturn } from "react-hook-form";

interface RecurrenceSummaryProps {
  form: UseFormReturn<EventFormData>;
  isRecurring: boolean;
  pattern?: string;
}

export const RecurrenceSummary = ({ form, isRecurring, pattern }: RecurrenceSummaryProps) => {
  if (!isRecurring || !pattern) {
    return null;
  }

  return (
    <div className="p-3 bg-muted/50 rounded-md">
      <p className="text-sm font-medium">Resumo da Recorrência</p>
      <p className="text-sm text-muted-foreground">
        {pattern === "daily" && `Ocorre diariamente`}
        {pattern === "weekly" && `Ocorre toda ${weekDays.find(d => d.value === form.watch("recurrence_day"))?.label || "semana"}`}
        {pattern === "monthly" && `Ocorre mensalmente`}
        
        {form.watch("recurrence_interval") > 1 && (
          pattern === "daily" ? 
            ` a cada ${form.watch("recurrence_interval")} dias` :
          pattern === "weekly" ?
            ` a cada ${form.watch("recurrence_interval")} semanas` :
            ` a cada ${form.watch("recurrence_interval")} meses`
        )}
        
        {form.watch("recurrence_count") && 
          `, por ${form.watch("recurrence_count")} ocorrências`}
        
        {form.watch("recurrence_end_date") && 
          `, até ${format(new Date(form.watch("recurrence_end_date")), 'dd/MM/yyyy')}`}
      </p>
    </div>
  );
};
