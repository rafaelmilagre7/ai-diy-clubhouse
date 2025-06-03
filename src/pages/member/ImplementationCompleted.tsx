
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import { PageTransition } from "@/components/transitions/PageTransition";

const ImplementationCompleted = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="container max-w-3xl mx-auto py-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-6">
              <CheckCircle className="h-20 w-20 text-green-600" />
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-green-800">
                  Parabéns! 🎉
                </h1>
                <h2 className="text-xl text-green-700">
                  Implementação Concluída com Sucesso
                </h2>
              </div>
              
              <p className="text-green-600 max-w-md">
                Você completou todos os passos da implementação. Agora é hora de 
                colocar em prática e acompanhar os resultados!
              </p>
              
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Dashboard
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/solutions")}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Ver Outras Soluções
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ImplementationCompleted;
