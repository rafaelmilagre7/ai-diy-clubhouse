import { useEffect, useState } from 'react';
import mermaid from 'mermaid';

/**
 * Obtém o valor real de uma variável CSS do :root
 */
const getCSSVar = (varName: string): string => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  
  // Se o valor já está em formato HSL (ex: "222.2 84% 4.9%")
  // retornar no formato completo "hsl(222.2, 84%, 4.9%)"
  if (value && !value.startsWith('hsl') && !value.startsWith('#')) {
    return `hsl(${value})`;
  }
  
  // Se já está no formato correto ou é hex, retornar como está
  return value || '#1e293b'; // fallback para um cinza escuro
};

/**
 * Hook para inicializar Mermaid UMA ÚNICA VEZ globalmente
 * Evita conflitos de múltiplas inicializações
 */
export const useMermaidInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Obter valores reais das variáveis CSS
    const primaryColor = getCSSVar('--primary');
    const primaryForeground = getCSSVar('--primary-foreground');
    const borderColor = getCSSVar('--border');
    const backgroundColor = getCSSVar('--background');
    const cardColor = getCSSVar('--card');
    const mutedColor = getCSSVar('--muted');
    const foregroundColor = getCSSVar('--foreground');
    const secondaryColor = getCSSVar('--secondary');
    const accentColor = getCSSVar('--accent');

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      themeVariables: {
        darkMode: true,
        primaryColor: primaryColor,
        primaryTextColor: primaryForeground,
        primaryBorderColor: primaryColor,
        lineColor: borderColor,
        secondaryColor: secondaryColor,
        tertiaryColor: accentColor,
        background: backgroundColor,
        mainBkg: cardColor,
        secondBkg: mutedColor,
        textColor: foregroundColor,
        borderColor: borderColor,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
      },
      journey: {
        useMaxWidth: true,
      },
    });
    
    setIsInitialized(true);
  }, []);

  return isInitialized;
};
