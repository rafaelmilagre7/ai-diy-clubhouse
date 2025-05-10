
// Helper function to format minutes to time
export const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
};

/**
 * Formata segundos em uma string legível (ex: "1h 30min" ou "45 min")
 */
export const formatSeconds = (seconds: number | null | undefined): string => {
  // Se não houver valor ou for zero, retornar string vazia
  if (!seconds) return '';
  
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}min`;
  } else {
    return `${minutes} min`;
  }
};

/**
 * Formata segundos para exibição em player de vídeo (ex: "1:30:45" ou "5:20")
 */
export const formatVideoTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

