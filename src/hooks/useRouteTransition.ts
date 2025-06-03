
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useRouteTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // Tempo da transição

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return { isTransitioning };
};
