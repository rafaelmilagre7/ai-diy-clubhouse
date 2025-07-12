
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AulaStepWizard from "./wizard/AulaStepWizard";

interface NovaAulaButtonProps {
  moduleId: string;
  buttonText?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  allowModuleSelection?: boolean;
  onSuccess?: () => void;
}

export const NovaAulaButton: React.FC<NovaAulaButtonProps> = ({
  moduleId,
  buttonText = "Nova Aula",
  variant = "default",
  size = "default",
  className = "",
  allowModuleSelection = false,
  onSuccess
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onSuccess) onSuccess();
  };

  return (
    <>
      <Button 
        onClick={handleOpenModal}
        variant={variant}
        size={size}
        className={className}
      >
        <Plus className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>

      {isModalOpen && (
        <AulaStepWizard 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen}
          moduleId={moduleId}
          allowModuleSelection={allowModuleSelection}
          onClose={handleCloseModal}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};
