
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Função para combinar classes tailwind de forma segura
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utilitários específicos para tratamento de estados de formulário usando variáveis CSS
export const formStateClasses = {
  // Estados padrão para campos de entrada
  input: {
    default: "bg-card border-border text-foreground",
    readOnly: "bg-muted text-muted-foreground border-border",
    disabled: "bg-muted opacity-50 cursor-not-allowed", 
    error: "border-destructive focus-visible:ring-destructive",
  },
};
