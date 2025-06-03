
export const useLogging = () => {
  const log = (message: string, data?: any) => {
    console.log(`[LOG] ${message}`, data);
  };

  const logError = (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  };

  const logWarn = (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  };

  return {
    log,
    logError,
    logWarn
  };
};
