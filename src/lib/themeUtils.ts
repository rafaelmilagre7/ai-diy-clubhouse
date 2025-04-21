
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
