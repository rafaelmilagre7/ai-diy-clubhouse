
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EventFormData } from "../EventFormSchema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";

interface RecurrenceEndOptionsProps {
  form: UseFormReturn<EventFormData>;
}

export const RecurrenceEndOptions = ({ form }: RecurrenceEndOptionsProps) => {
  const [endType, setEndType] = useState<"unlimited" | "count" | "date">("unlimited");
  
  // Monitorar os valores para determinar o tipo selecionado
  useEffect(() => {
    if (form.watch("recurrence_count")) {
      setEndType("count");
    } else if (form.watch("recurrence_end_date")) {
      setEndType("date");
    } else {
      setEndType("unlimited");
    }
  }, [form.watch("recurrence_count"), form.watch("recurrence_end_date")]);

  // Atualizar os campos quando o tipo de fim mudar
  const handleEndTypeChange = (value: string) => {
    setEndType(value as "unlimited" | "count" | "date");
    
    // Limpar os outros campos
    if (value === "unlimited") {
      form.setValue("recurrence_count", undefined);
      form.setValue("recurrence_end_date", undefined);
    } else if (value === "count") {
      form.setValue("recurrence_end_date", undefined);
      if (!form.getValues("recurrence_count")) {
        form.setValue("recurrence_count", 10); // Valor padrão
      }
    } else if (value === "date") {
      form.setValue("recurrence_count", undefined);
    }
  };

  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Término da Recorrência</FormLabel>
        <RadioGroup 
          value={endType} 
          onValueChange={handleEndTypeChange}
          className="flex flex-col space-y-2 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unlimited" id="unlimited" />
            <label htmlFor="unlimited" className="text-sm cursor-pointer">
              Sem data de término (ilimitado)
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="count" id="count" />
            <label htmlFor="count" className="text-sm cursor-pointer">
              Após número específico de ocorrências
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="date" id="date" />
            <label htmlFor="date" className="text-sm cursor-pointer">
              Em uma data específica
            </label>
          </div>
        </RadioGroup>
      </FormItem>

      {endType === "count" && (
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
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {endType === "date" && (
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
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
