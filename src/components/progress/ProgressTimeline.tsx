
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: Date;
  estimatedTime?: string;
}

interface ProgressTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const ProgressTimeline = ({ items, className }: ProgressTimelineProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className="flex items-start space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-1">
            {item.status === "completed" && (
              <CheckCircle className="w-6 h-6 text-green-500" />
            )}
            {item.status === "current" && (
              <PlayCircle className="w-6 h-6 text-viverblue animate-pulse" />
            )}
            {item.status === "upcoming" && (
              <Clock className="w-6 h-6 text-gray-400" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "text-sm font-medium",
                item.status === "completed" ? "text-green-700 dark:text-green-400" : 
                item.status === "current" ? "text-viverblue" : 
                "text-gray-500"
              )}>
                {item.title}
              </h3>
              
              {item.estimatedTime && (
                <span className="text-xs text-gray-400">
                  {item.estimatedTime}
                </span>
              )}
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {item.description}
              </p>
            )}
            
            {item.timestamp && (
              <p className="text-xs text-gray-400 mt-1">
                {item.timestamp.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
          
          {/* Connection Line */}
          {index < items.length - 1 && (
            <div className="absolute left-3 mt-8 w-px h-8 bg-gray-200 dark:bg-gray-700" />
          )}
        </motion.div>
      ))}
    </div>
  );
};
