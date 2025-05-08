
import { useState, useMemo } from 'react';

// Hook para gerenciar a data de início baseada no intervalo de tempo selecionado
export const useTimeRange = (timeRange: string) => {
  const [startDate, setStartDate] = useState<string | null>(null);
  
  // Definir a data de início com base no timeRange
  useMemo(() => {
    if (timeRange === 'all') {
      setStartDate(null);
      return;
    }
    
    const days = parseInt(timeRange);
    const now = new Date();
    const date = new Date(now);
    date.setDate(now.getDate() - days);
    setStartDate(date.toISOString());
  }, [timeRange]);

  return startDate;
};
