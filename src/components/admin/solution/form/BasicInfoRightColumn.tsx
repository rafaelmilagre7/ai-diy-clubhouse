
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
      case "easy": return "bg-green-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "advanced": return "bg-orange-500 text-white";
      default: return "bg-gray-500 text-white";
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
                <SelectItem value="revenue">Aumento de Receita</SelectItem>
                <SelectItem value="operational">Otimização Operacional</SelectItem>
                <SelectItem value="strategy">Gestão Estratégica</SelectItem>
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
                <SelectItem value="easy" className="bg-green-100 hover:bg-green-200">
                  Fácil
                </SelectItem>
                <SelectItem value="medium" className="bg-yellow-100 hover:bg-yellow-200">
                  Normal
                </SelectItem>
                <SelectItem value="advanced" className="bg-orange-100 hover:bg-orange-200">
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
