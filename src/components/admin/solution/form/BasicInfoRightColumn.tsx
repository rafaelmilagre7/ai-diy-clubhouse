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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicInfoRightColumnProps {
  form: UseFormReturn<SolutionFormValues>;
  difficulty: string;
}

const BasicInfoRightColumn: React.FC<BasicInfoRightColumnProps> = ({ 
  form,
  difficulty
}) => {
  // Função para obter a cor correspondente à dificuldade
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-difficulty-beginner text-primary-foreground";
      case "medium": return "bg-difficulty-intermediate text-primary-foreground";
      case "advanced": return "bg-difficulty-advanced text-primary-foreground";
      default: return "bg-muted text-foreground";
    }
  };

  // Função para obter texto traduzido de dificuldade
  const getDifficultyText = (diff: string) => {
    switch (diff) {
      case "easy": return "Fácil";
      case "medium": return "Normal";
      case "advanced": return "Avançado";
      default: return diff;
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Receita">Aumento de Receita</SelectItem>
                <SelectItem value="Operacional">Otimização Operacional</SelectItem>
                <SelectItem value="Estratégia">Gestão Estratégica</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              A trilha em que esta solução será categorizada.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="difficulty"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dificuldade</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger 
                  className={field.value ? `${getDifficultyColor(field.value)} border-0` : ""}
                >
                  <SelectValue placeholder="Selecione uma dificuldade">
                    {field.value ? getDifficultyText(field.value) : ""}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="easy" className="bg-difficulty-beginner/10 hover:bg-difficulty-beginner/20">
                  Fácil
                </SelectItem>
                <SelectItem value="medium" className="bg-difficulty-intermediate/10 hover:bg-difficulty-intermediate/20">
                  Normal
                </SelectItem>
                <SelectItem value="advanced" className="bg-difficulty-advanced/10 hover:bg-difficulty-advanced/20">
                  Avançado
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              O nível de dificuldade de implementação da solução.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoRightColumn;
