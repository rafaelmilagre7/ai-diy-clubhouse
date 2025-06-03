
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";

interface AccessDeniedProps {
  courseId?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ courseId }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">Acesso Restrito</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Este curso possui acesso restrito. Você não tem permissão para visualizar este conteúdo.
          </p>
          <p className="text-sm text-muted-foreground">
            Entre em contato com a administração se você acredita que deveria ter acesso a este curso.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/learning")}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Cursos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
