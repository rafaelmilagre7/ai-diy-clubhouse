
// Hook para converter string de período em data ISO
export const useTimeRange = (timeRange: string): string | null => {
  if (timeRange === 'all') {
    return null;
  }
  
  const now = new Date();
  let pastDate = new Date();
  
  // Definir data limite com base no intervalo de tempo
  switch (timeRange) {
    case '7d':
      pastDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      pastDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      pastDate.setDate(now.getDate() - 90);
      break;
    case '6m':
      pastDate.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      pastDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return null;
  }
  
  return pastDate.toISOString();
};

export default useTimeRange;
