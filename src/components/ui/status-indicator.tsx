
import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, XCircle, Clock, Zap, Target } from "lucide-react";

interface StatusIndicatorProps {
  status: "success" | "warning" | "error" | "pending" | "active" | "neutral";
  size?: "sm" | "md" | "lg";
  variant?: "dot" | "icon" | "badge" | "ring";
  label?: string;
  className?: string;
  animate?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = "md",
  variant = "dot",
  label,
  className,
  animate = false
}) => {
  const sizeClasses = {
    sm: variant === "dot" ? "w-2 h-2" : "w-4 h-4",
    md: variant === "dot" ? "w-3 h-3" : "w-5 h-5", 
    lg: variant === "dot" ? "w-4 h-4" : "w-6 h-6"
  };

  const statusConfig = {
    success: {
      color: "bg-success text-success border-success",
      icon: CheckCircle,
      label: "Sucesso"
    },
    warning: {
      color: "bg-warning text-warning border-warning",
      icon: AlertCircle,
      label: "Atenção"
    },
    error: {
      color: "bg-error text-error border-error",
      icon: XCircle,
      label: "Erro"
    },
    pending: {
      color: "bg-info text-info border-info",
      icon: Clock,
      label: "Pendente"
    },
    active: {
      color: "bg-accent text-accent border-accent",
      icon: Zap,
      label: "Ativo"
    },
    neutral: {
      color: "bg-text-muted text-text-muted border-text-muted",
      icon: Target,
      label: "Neutro"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (variant === "dot") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div 
          className={cn(
            "rounded-full",
            config.color.split(' ')[0],
            sizeClasses[size],
            animate && "animate-pulse"
          )}
        />
        {label && (
          <span className="text-sm font-medium text-text-secondary">
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Icon 
          className={cn(
            config.color.split(' ')[1],
            sizeClasses[size],
            animate && "animate-pulse"
          )}
        />
        {label && (
          <span className="text-sm font-medium text-text-secondary">
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div 
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
          config.color.split(' ')[0],
          "text-white",
          className
        )}
      >
        <Icon className="w-3 h-3" />
        {label || config.label}
      </div>
    );
  }

  // ring variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div 
        className={cn(
          "rounded-full border-2 p-1",
          config.color.split(' ')[2],
          animate && "animate-pulse"
        )}
      >
        <div 
          className={cn(
            "rounded-full",
            config.color.split(' ')[0],
            sizeClasses[size]
          )}
        />
      </div>
      {label && (
        <span className="text-sm font-medium text-text-secondary">
          {label}
        </span>
      )}
    </div>
  );
};

export { StatusIndicator };
