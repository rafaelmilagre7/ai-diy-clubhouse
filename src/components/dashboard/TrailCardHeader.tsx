
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";

interface TrailCardHeaderProps {
  onUpdate: () => void;
}

export function TrailCardHeader({ onUpdate }: TrailCardHeaderProps) {
  return (
    <CardHeader className="pb-4">
      <CardTitle className="text-xl flex justify-between items-center">
        <span>Sua Trilha de Implementação</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onUpdate}
          className="text-xs text-[#0ABAB5] hover:text-[#0ABAB5]/80"
        >
          Atualizar
        </Button>
      </CardTitle>
      <CardDescription>
        Soluções personalizadas com base no seu perfil
      </CardDescription>
    </CardHeader>
  );
}
