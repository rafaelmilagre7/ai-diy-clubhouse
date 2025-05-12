
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "./EventFormSchema";

interface EventBasicInfoProps {
  form: UseFormReturn<EventFormData>;
}

export const EventBasicInfo = ({ form }: EventBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Informações Básicas</h3>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nome do evento" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Descreva o evento..." 
                className="resize-none" 
                rows={4}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
