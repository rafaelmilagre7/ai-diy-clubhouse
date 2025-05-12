
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { type EventFormData, recurrencePatterns, weekDays } from "./EventFormSchema";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { format } from "date-fns";

interface EventRecurrenceProps {
  form: UseFormReturn<EventFormData>;
}

export const EventRecurrence = ({ form }: EventRecurrenceProps) => {
  const isRecurring = form.watch("is_recurring");
  const pattern = form.watch("recurrence_pattern");
  const startDate = form.watch("start_time");
  
  // Reseta campos de recorrência quando desativada
  useEffect(() => {
    if (!isRecurring) {
      form.setValue("recurrence_pattern", undefined);
      form.setValue("recurrence_interval", undefined);
      form.setValue("recurrence_day", undefined);
      form.setValue("recurrence_count", undefined);
      form.setValue("recurrence_end_date", undefined);
    } else if (!pattern) {
      // Define um padrão padrão quando recorrência é ativada
      form.setValue("recurrence_pattern", "weekly");
      form.setValue("recurrence_interval", 1);
    }
  }, [isRecurring, pattern, form]);

  // Define o dia da semana baseado na data de início quando o padrão é semanal
  useEffect(() => {
    if (isRecurring && pattern === "weekly" && startDate) {
      const date = new Date(startDate);
      const day = date.getDay(); // 0 = domingo, 1 = segunda, etc.
      form.setValue("recurrence_day", day);
    }
  }, [isRecurring, pattern, startDate, form]);

  return (
    <div className="space-y-6 border p-4 rounded-md">
      <FormField
        control={form.control}
        name="is_recurring"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Evento Recorrente</FormLabel>
              <p className="text-sm text-muted-foreground">
                Ative para criar um evento que se repete periodicamente.
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {isRecurring && (
        <div className="space-y-4">
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

          <FormField
            control={form.control}
            name="recurrence_interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intervalo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground mt-1">
                  {pattern === "daily" && "A cada quantos dias"}
                  {pattern === "weekly" && "A cada quantas semanas"}
                  {pattern === "monthly" && "A cada quantos meses"}
                </p>
              </FormItem>
            )}
          />

          {pattern === "weekly" && (
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
          )}

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
                  <p className="text-sm text-muted-foreground mt-1">
                    Deixe em branco para não limitar
                  </p>
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
                  <p className="text-sm text-muted-foreground mt-1">
                    Deixe em branco para não limitar por data
                  </p>
                </FormItem>
              )}
            />
          </div>
          
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm font-medium">Resumo da Recorrência</p>
            <p className="text-sm text-muted-foreground">
              {isRecurring && pattern && (
                <>
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
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
