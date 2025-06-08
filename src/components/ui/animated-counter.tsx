
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  duration = 1000,
  className,
  prefix = "",
  suffix = "",
  formatter
}) => {
  const [current, setCurrent] = useState(from);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`counter-${Math.random()}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const difference = to - from;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(from + difference * easeOutQuart);
      
      setCurrent(currentValue);

      if (progress >= 1) {
        clearInterval(timer);
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [from, to, duration, isVisible]);

  const displayValue = formatter ? formatter(current) : current.toLocaleString();

  return (
    <span 
      id={`counter-${Math.random()}`}
      className={cn("font-mono transition-all duration-200", className)}
    >
      {prefix}{displayValue}{suffix}
    </span>
  );
};

export { AnimatedCounter };
