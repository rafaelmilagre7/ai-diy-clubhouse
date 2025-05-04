
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
}

export const NovaAulaButton: React.FC<NovaAulaButtonProps> = ({
  moduleId,
  buttonText = "Nova Aula",
  variant = "default",
  size = "default",
  className = ""
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
