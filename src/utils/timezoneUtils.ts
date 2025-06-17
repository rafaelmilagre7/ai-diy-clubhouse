
// Função para extrair apenas o horário (HH:MM) de um datetime string sem conversão de timezone
export const extractTimeFromDateString = (datetimeString: string): string => {
  if (!datetimeString || !datetimeString.includes('T')) {
    return '';
  }
  
  const timePart = datetimeString.split('T')[1];
  if (!timePart) return '';
  
  // Retornar apenas HH:MM (primeiros 5 caracteres da parte de tempo)
  return timePart.substring(0, 5);
};

// Função para extrair a data no formato brasileiro sem conversão de timezone
export const extractDateFromDateString = (datetimeString: string): string => {
  if (!datetimeString || !datetimeString.includes('T')) {
    return '';
  }
  
  const datePart = datetimeString.split('T')[0];
  if (!datePart) return '';
  
  // Converter de YYYY-MM-DD para DD/MM/YYYY
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

// Função para extrair apenas o horário (HH:MM) de um datetime string
export const extractLocalTime = (datetimeString: string): string => {
  return extractTimeFromDateString(datetimeString);
};

// Função para converter datetime para formato datetime-local (para inputs)
export const convertToDatetimeLocal = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Erro ao converter para datetime-local:', error);
    return '';
  }
};

// Função para formatar data e hora no padrão brasileiro sem conversão de timezone
export const formatBrazilianDateTime = (datetimeString: string): string => {
  const date = extractDateFromDateString(datetimeString);
  const time = extractTimeFromDateString(datetimeString);
  
  if (!date || !time) return datetimeString;
  
  return `${date} às ${time}`;
};
