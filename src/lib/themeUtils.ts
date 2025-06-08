
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

// Utilitários para migração de cores legadas
export const legacyColorMap = {
  // Cores viverblue
  viverblue: "hsl(var(--primary))",
  "viverblue-dark": "hsl(var(--primary-hover))",
  "viverblue-light": "hsl(var(--primary) / 0.1)",
  
  // Cores de fundo
  "#1A1E2E": "hsl(var(--surface))",
  "#151823": "hsl(var(--surface-elevated))",
  "#0F111A": "hsl(var(--background))",
  
  // Cores de texto
  "#F8FAFC": "hsl(var(--text-primary))",
  "#CDD5E0": "hsl(var(--text-secondary))",
  "#657084": "hsl(var(--text-muted))",
  
  // Cores primárias
  "#00EAD9": "hsl(var(--primary))",
  "#00D6C7": "hsl(var(--primary-hover))",
  "#00A69D": "hsl(var(--primary-active))",
};

// Função para converter cores legadas
export function convertLegacyColor(legacyColor: string): string {
  return legacyColorMap[legacyColor as keyof typeof legacyColorMap] || legacyColor;
}

// Utilitários específicos para tratamento de estados de formulário
export const formStateClasses = {
  // Estados padrão para campos de entrada
  input: {
    default: "bg-surface border-border text-foreground",
    readOnly: "bg-surface-hover text-text-secondary border-border-subtle",
    disabled: "bg-surface opacity-50 cursor-not-allowed", 
    error: "border-error focus-visible:ring-error/20",
    success: "border-success focus-visible:ring-success/20",
  },
  // Estados para outros elementos de UI
  card: {
    default: "bg-surface-elevated border-border",
    elevated: "bg-surface-elevated border-border shadow-medium",
    interactive: "bg-surface-elevated border-border hover:border-border-strong hover:shadow-glow-primary",
    selected: "bg-surface-elevated border-primary shadow-glow-primary",
  },
  text: {
    primary: "text-text-primary",
    secondary: "text-text-secondary", 
    tertiary: "text-text-tertiary",
    muted: "text-text-muted",
    accent: "text-primary",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
  }
};

// Função utilitária para aplicar classes de estado
export function applyStateClasses(
  element: keyof typeof formStateClasses,
  state: string,
  additionalClasses?: string
): string {
  const baseClasses = formStateClasses[element]?.[state as keyof typeof formStateClasses[typeof element]] || "";
  return cn(baseClasses, additionalClasses);
}
