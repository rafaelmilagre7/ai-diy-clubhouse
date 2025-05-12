
import { theme } from "./theme";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Função para combinar classes tailwind de forma segura
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hook personalizado para acessar o tema
export function useTheme() {
  return theme;
}

// Função para mapear cores do tema para classes tailwind
export function applyThemeColor(color: keyof typeof theme.colors, type: "bg" | "text" | "border" = "bg") {
  const colorValue = theme.colors[color];
  if (!colorValue) return "";
  
  // Se o valor já for uma classe tailwind (ex: "bg-red-500"), retorna diretamente
  if (colorValue.startsWith("bg-") || colorValue.startsWith("text-") || colorValue.startsWith("border-")) {
    return colorValue;
  }
  
  // Caso contrário, aplica o prefixo apropriado
  return `${type}-[${colorValue}]`;
}

// Utilitários específicos para tratamento de estados de formulário
export const formStateClasses = {
  // Estados padrão para campos de entrada
  input: {
    default: "bg-[#151823] border-white/10 text-textPrimary",
    readOnly: "bg-[#2A2D3A] text-textSecondary border-white/5",
    disabled: "bg-[#151823] opacity-50 cursor-not-allowed", 
    error: "border-error focus-visible:ring-error",
  },
  // Classes para outros estados de UI que podem ser adicionadas no futuro
};
