
import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  status: "check" | "warning" | "pending";
}

const StatusCard: React.FC<StatusCardProps> = ({ icon, title, status }) => {
  let statusIcon;
  let statusColor;
  
  switch (status) {
    case "check":
      statusIcon = <CheckCircle2 className="h-5 w-5 text-system-healthy" />;
      statusColor = "border-l-system-healthy";
      break;
    case "warning":
      statusIcon = <AlertTriangle className="h-5 w-5 text-status-warning" />;
      statusColor = "border-l-status-warning";
      break;
    case "pending":
      statusIcon = <AlertCircle className="h-5 w-5 text-muted-foreground" />;
      statusColor = "border-l-border";
      break;
  }
  
  return (
    <Card className={`p-4 border-l-4 ${statusColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {React.cloneElement(icon as React.ReactElement, { 
            className: `h-5 w-5 ${status === "check" ? "text-system-healthy" : status === "warning" ? "text-status-warning" : "text-muted-foreground"}` 
          })}
          <span className="font-medium">{title}</span>
        </div>
        {statusIcon}
      </div>
    </Card>
  );
};

export default StatusCard;
