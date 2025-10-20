
import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle } from "lucide-react";

interface FormMessageProps {
  type?: "error" | "success" | "warning" | "info";
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export const FormMessage: React.FC<FormMessageProps> = ({
  type = "info",
  message,
  className,
  children,
}) => {
  const content = message || children;
  
  if (!content) {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-status-error" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-viverblue" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-status-warning" />;
      case "info":
      default:
        return null;
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case "error":
        return "text-status-error";
      case "success":
        return "text-viverblue";
      case "warning":
        return "text-status-warning";
      case "info":
      default:
        return "text-textSecondary";
    }
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm mt-1", getTextColor(), className)}>
      {getIcon()}
      <span>{content}</span>
    </div>
  );
};
