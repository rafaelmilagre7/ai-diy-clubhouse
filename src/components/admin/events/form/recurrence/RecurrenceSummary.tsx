
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

  // Formatar o horário para exibição
  const formatTime = (timeString?: string) => {
    if (!timeString || !timeString.includes('T')) return "";
    const timePart = timeString.split('T')[1];
    const [hours, minutes] = timePart.split(':');
    return `${hours}:${minutes}`;
  };

  const startTime = formatTime(form.watch("start_time"));
  const endTime = formatTime(form.watch("end_time"));
  
  // Determinar o texto do padrão de recorrência
  let patternText = "";
  const interval = form.watch("recurrence_interval") || 1;
  
  switch (pattern) {
    case "daily":
      patternText = interval === 1 ? 
        "Diariamente" : 
        `A cada ${interval} dias`;
      break;
    case "weekly":
      const weekDay = weekDays.find(d => d.value === form.watch("recurrence_day"))?.label || "";
      patternText = interval === 1 ? 
        `Todas as ${weekDay}s` : 
        `A cada ${interval} semanas, na ${weekDay}`;
      break;
    case "monthly":
      const dayOfMonth = ""; // Poderíamos adicionar uma seleção de dia do mês
      patternText = interval === 1 ? 
        `Mensalmente${dayOfMonth ? `, dia ${dayOfMonth}` : ""}` : 
        `A cada ${interval} meses${dayOfMonth ? `, dia ${dayOfMonth}` : ""}`;
      break;
  }

  // Determinar o texto de término
  let endText = "";
  if (form.watch("recurrence_count")) {
    endText = `, por ${form.watch("recurrence_count")} ocorrências`;
  } else if (form.watch("recurrence_end_date")) {
    endText = `, até ${format(new Date(form.watch("recurrence_end_date")), 'dd/MM/yyyy')}`;
  } else {
    endText = ", sem data de término";
  }

  // Texto do horário
  const timeText = startTime && endTime ? ` das ${startTime} às ${endTime}` : "";

  return (
    <div className="p-3 bg-muted/50 rounded-md">
      <p className="text-sm font-medium">Resumo da Recorrência</p>
      <p className="text-sm text-muted-foreground">
        {patternText}{timeText}{endText}
      </p>
    </div>
  );
};
