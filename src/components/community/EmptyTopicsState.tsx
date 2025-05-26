
import React from "react";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface EmptyTopicsStateProps {
  searchQuery: string;
}

export const EmptyTopicsState = ({ searchQuery }: EmptyTopicsStateProps) => {
  return (
    <Card className="p-8 text-center">
      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-xl font-medium mb-2">
        {searchQuery ? "Nenhum tópico encontrado" : "Nenhuma discussão iniciada ainda"}
      </h2>
      <p className="text-muted-foreground mb-4">
        {searchQuery 
          ? "Tente usar termos diferentes na sua busca."
          : "Seja o primeiro a iniciar uma discussão nesta categoria."
        }
      </p>
    </Card>
  );
};
