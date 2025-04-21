
import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isSubmitting: boolean;
  text?: string;
  submittingText?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  isSubmitting, 
  text = "Continuar", 
  submittingText = "Salvando..." 
}) => (
  <div className="flex justify-end pt-6">
    <Button type="submit" className="bg-[#0ABAB5] hover:bg-[#09a29d]" disabled={isSubmitting}>
      {isSubmitting ? submittingText : text}
    </Button>
  </div>
);
