
import { useState, useEffect } from 'react';

export const useSmartLoading = (isLoading: boolean, delay = 500) => {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isLoading) {
      timeout = setTimeout(() => {
        setShouldShowLoading(true);
      }, delay);
    } else {
      setShouldShowLoading(false);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isLoading, delay]);

  return shouldShowLoading;
};
