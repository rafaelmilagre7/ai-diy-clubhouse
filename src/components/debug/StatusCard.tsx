import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  title: string;
  success: boolean;
  value: string;
  icon?: React.ReactNode;
  warning?: boolean;
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  success, 
  value, 
  icon,
  warning = false,
  className = ""
}) => {
  const getStatusIcon = () => {
    if (warning) return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    return success ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
    ) : (
      <XCircle className="h-5 w-5 text-red-400" />
    );
  };
  
  const getStatusColor = () => {
    if (warning) return "border-amber-500/30 bg-amber-500/5";
    return success ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5";
  };
  
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02]",
      getStatusColor(),
      className
    )}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <span className="font-medium text-foreground text-base">{title}</span>
      </div>
      
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <Badge 
          variant={success ? "default" : "destructive"}
          className={cn(
            "text-sm font-medium px-3 py-1",
            warning && "bg-amber-600 text-amber-100 hover:bg-amber-700"
          )}
        >
          {value}
        </Badge>
      </div>
    </div>
  );
};