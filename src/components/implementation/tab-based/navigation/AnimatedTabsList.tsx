
import React from "react";
import { motion } from "framer-motion";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedTabsListProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
  completedSections: Set<string>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const AnimatedTabsList = ({ 
  tabs, 
  completedSections, 
  activeTab, 
  onTabChange 
}: AnimatedTabsListProps) => {
  return (
    <TabsList className="grid w-full grid-cols-5 bg-backgroundLight border border-white/10 relative overflow-hidden">
      {/* Background indicator for active tab */}
      <motion.div
        className="absolute inset-y-1 bg-viverblue rounded-sm"
        initial={false}
        animate={{
          x: `${tabs.findIndex(tab => tab.id === activeTab) * 100}%`,
          width: `${100 / tabs.length}%`
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        style={{ left: 0 }}
      />
      
      {tabs.map((tab, index) => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative z-10 transition-all duration-200",
            activeTab === tab.id 
              ? "text-white font-medium" 
              : "text-gray-400 hover:text-gray-200"
          )}
        >
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            
            <AnimatedCheckmark 
              isCompleted={completedSections.has(tab.id) && tab.id !== "comments"}
              delay={index * 0.1}
            />
          </motion.div>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

interface AnimatedCheckmarkProps {
  isCompleted: boolean;
  delay?: number;
}

const AnimatedCheckmark = ({ isCompleted, delay = 0 }: AnimatedCheckmarkProps) => {
  if (!isCompleted) return null;
  
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        delay,
        type: "spring",
        stiffness: 500,
        damping: 25
      }}
    >
      <CheckCircle className="w-4 h-4 text-green-400" />
    </motion.div>
  );
};
