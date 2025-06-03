
export const useLogging = () => {
  const log = (message: string, data?: any) => {
    console.log(`[LOG] ${message}`, data || '');
  };

  const error = (message: string, errorData?: any) => {
    console.error(`[ERROR] ${message}`, errorData || '');
  };

  const warn = (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  };

  return {
    log,
    error,
    warn
  };
};
