
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  courseId?: string;
}

export function AccessDenied({ 
  title = "Acesso Restrito", 
  message = "Você não tem permissão para acessar este conteúdo. Este curso é exclusivo para membros com papéis específicos.",
  courseId 
}: AccessDeniedProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center min-h-[60vh]">
      <div className="bg-status-error/20 p-6 rounded-full mb-6">
        <Lock className="h-16 w-16 text-status-error" />
      </div>
      
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      
      <p className="text-muted-foreground mb-8 max-w-md">
        {message}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => navigate("/learning")}
          variant="outline"
        >
          Voltar para Cursos
        </Button>
        
        <Button 
          onClick={() => navigate("/")}
        >
          Ir para Dashboard
        </Button>
      </div>
    </div>
  );
}
