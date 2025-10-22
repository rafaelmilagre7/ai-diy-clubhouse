import { useEffect, useState } from 'react';
import mermaid from 'mermaid';

/**
 * Hook para inicializar Mermaid UMA ÚNICA VEZ globalmente
 * Evita conflitos de múltiplas inicializações
 */
export const useMermaidInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      themeVariables: {
        darkMode: true,
        primaryColor: 'hsl(var(--primary))',
        primaryTextColor: 'hsl(var(--primary-foreground))',
        primaryBorderColor: 'hsl(var(--primary))',
        lineColor: 'hsl(var(--border))',
        secondaryColor: 'hsl(var(--secondary))',
        tertiaryColor: 'hsl(var(--accent))',
        background: 'hsl(var(--background))',
        mainBkg: 'hsl(var(--card))',
        secondBkg: 'hsl(var(--muted))',
        textColor: 'hsl(var(--foreground))',
        borderColor: 'hsl(var(--border))',
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
