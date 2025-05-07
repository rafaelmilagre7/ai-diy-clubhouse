
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NovaAulaButtonProps {
  moduleId: string;
  buttonText?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onSuccess?: () => void;
}

export const NovaAulaButton: React.FC<NovaAulaButtonProps> = ({
  moduleId,
  buttonText = "Nova Aula",
  variant = "default",
  size = "default",
  className = "",
  onSuccess
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/formacao/aulas/nova?moduleId=${moduleId}`);
  };

  return (
    <Button 
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
    >
      <Plus className="h-4 w-4 mr-2" />
      {buttonText}
    </Button>
  );
};

export default NovaAulaButton;
