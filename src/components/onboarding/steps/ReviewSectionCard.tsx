
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { getSummary } from "./ReviewUtils";
import { OnboardingProgress } from "@/types/onboarding";

interface ReviewSectionCardProps {
  title: string;
  data: any;
  onEdit: () => void;
}

export const ReviewSectionCard: React.FC<ReviewSectionCardProps> = ({
  title,
  data,
  onEdit
}) => {
  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm">
      <CardHeader className="bg-gray-50 pb-3 pt-4 px-4 flex flex-row justify-between items-center">
        <CardTitle className="text-base font-medium text-gray-800">
          {title}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[#0ABAB5] border-[#0ABAB5] hover:bg-[#0ABAB5]/10"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4 mr-1" /> Editar
        </Button>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        {data ? (
          <div className="space-y-2 text-sm">
            {Object.entries(data).map(([key, value]) => {
              // Pular valores vazios ou undefined
              if (value === undefined || value === null || value === "" || 
                  (Array.isArray(value) && value.length === 0)) {
                return null;
              }
              
              // Formatar o nome da chave para exibição
              const formattedKey = key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase());
              
              return (
                <div key={key} className="grid grid-cols-3 gap-2">
                  <div className="font-medium text-gray-600">{formattedKey}:</div>
                  <div className="col-span-2 text-gray-800">
                    {Array.isArray(value) 
                      ? value.join(', ')
                      : typeof value === 'boolean'
                        ? value ? 'Sim' : 'Não'
                        : String(value)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 italic flex items-center space-x-2">
            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full"></span>
            <span>Nenhuma informação preenchida. Clique em Editar para adicionar.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
