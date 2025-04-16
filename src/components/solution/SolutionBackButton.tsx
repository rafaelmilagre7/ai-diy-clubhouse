
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SolutionBackButton = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      className="mb-6"
      onClick={() => navigate("/dashboard")}
    >
      <ChevronLeft className="mr-2 h-4 w-4" />
      Voltar para o Dashboard
    </Button>
  );
};
