
import { useState, useEffect, useCallback } from "react";
import { useLogging } from "@/hooks/useLogging";

interface SectionActivity {
  sectionId: string;
  startTime: number;
  interactions: number;
  timeSpent: number;
  specificActions: Record<string, number>;
}

export const useSectionTracking = (sectionId: string) => {
  const [activity, setActivity] = useState<SectionActivity>({
    sectionId,
    startTime: Date.now(),
    interactions: 0,
    timeSpent: 0,
    specificActions: {}
  });
  
  const { log } = useLogging();

  // Atualizar tempo gasto a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setActivity(prev => ({
        ...prev,
        timeSpent: Date.now() - prev.startTime
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const trackInteraction = useCallback((actionType: string = 'general') => {
    setActivity(prev => ({
      ...prev,
      interactions: prev.interactions + 1,
      specificActions: {
        ...prev.specificActions,
        [actionType]: (prev.specificActions[actionType] || 0) + 1
      }
    }));
    
    log("Section interaction tracked", { sectionId, actionType });
  }, [sectionId, log]);

  const getTimeSpentInSeconds = useCallback(() => {
    return Math.floor((Date.now() - activity.startTime) / 1000);
  }, [activity.startTime]);

  const getActionCount = useCallback((actionType: string) => {
    return activity.specificActions[actionType] || 0;
  }, [activity.specificActions]);

  const resetTracking = useCallback(() => {
    setActivity({
      sectionId,
      startTime: Date.now(),
      interactions: 0,
      timeSpent: 0,
      specificActions: {}
    });
  }, [sectionId]);

  return {
    activity,
    trackInteraction,
    getTimeSpentInSeconds,
    getActionCount,
    resetTracking
  };
};
