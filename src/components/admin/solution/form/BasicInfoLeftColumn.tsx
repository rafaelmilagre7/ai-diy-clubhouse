
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { SolutionFormValues } from "./solutionFormSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BasicInfoLeftColumnProps {
  form: UseFormReturn<SolutionFormValues>;
}

const BasicInfoLeftColumn: React.FC<BasicInfoLeftColumnProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: Assistente de Vendas com IA" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Nome da solução que aparecerá no dashboard dos membros.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input placeholder="Ex: assistente-vendas-ia" {...field} />
            </FormControl>
            <FormDescription>
              Identificador único para URLs (gerado automaticamente do título).
            </FormDescription>
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
                placeholder="Descreva brevemente esta solução e seus benefícios..."
                rows={4}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Uma descrição curta que aparecerá no card da solução.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoLeftColumn;
