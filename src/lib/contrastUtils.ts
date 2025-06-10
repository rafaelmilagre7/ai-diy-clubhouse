
// Utilitários para garantir contraste adequado em diferentes contextos

export const contrastClasses = {
  // Texto principal - alta legibilidade
  primary: "text-neutral-100 dark:text-neutral-100",
  
  // Texto secundário - boa legibilidade 
  secondary: "text-neutral-300 dark:text-neutral-300",
  
  // Texto terciário - legibilidade mínima adequada
  tertiary: "text-neutral-400 dark:text-neutral-400",
  
  // Texto de erro
  error: "text-red-400 dark:text-red-400",
  
  // Texto de sucesso
  success: "text-green-400 dark:text-green-400",
  
  // Texto de aviso
  warning: "text-amber-400 dark:text-amber-400",
  
  // Texto de informação
  info: "text-blue-400 dark:text-blue-400",
  
  // Links
  link: "text-viverblue hover:text-viverblue-light",
  
  // Placeholders
  placeholder: "placeholder:text-neutral-400 dark:placeholder:text-neutral-400",
  
  // Labels
  label: "text-neutral-100 dark:text-neutral-100",
  
  // Descrições
  description: "text-neutral-300 dark:text-neutral-300",
  
  // Metadados (timestamps, contadores, etc)
  metadata: "text-neutral-400 dark:text-neutral-400",
  
  // Cabeçalhos
  heading: "text-neutral-100 dark:text-neutral-100",
};

// Função para obter classe de contraste baseada no contexto
export const getContrastClass = (context: keyof typeof contrastClasses): string => {
  return contrastClasses[context];
};

// Função para verificar se uma cor atende aos padrões de contraste
export const hasGoodContrast = (colorClass: string): boolean => {
  // Lista de classes que sabemos ter bom contraste no dark mode
  const goodContrastClasses = [
    'text-neutral-100', 'text-neutral-200', 'text-neutral-300', 'text-neutral-400',
    'text-white', 'text-green-400', 'text-red-400', 'text-blue-400', 'text-amber-400',
    'text-viverblue'
  ];
  
  return goodContrastClasses.some(goodClass => colorClass.includes(goodClass));
};

// Função para sugerir uma alternativa com melhor contraste
export const suggestBetterContrast = (currentClass: string): string => {
  const contrastMap: Record<string, string> = {
    'text-neutral-500': 'text-neutral-300',
    'text-neutral-600': 'text-neutral-400', 
    'text-neutral-700': 'text-neutral-300',
    'text-gray-500': 'text-neutral-300',
    'text-gray-600': 'text-neutral-400',
    'text-gray-700': 'text-neutral-300',
    'text-muted-foreground': 'text-neutral-300',
  };
  
  return contrastMap[currentClass] || currentClass;
};
