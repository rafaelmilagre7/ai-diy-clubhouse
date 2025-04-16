
import { Button } from "@/components/ui/button";
import { Solution } from "@/lib/supabase";
import { Award, PlayCircle, CheckCircle, Users, BarChart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SolutionSidebarProps {
  solution: Solution;
  progress: any | null;
  startImplementation: () => Promise<void>;
  continueImplementation: () => void;
}

export const SolutionSidebar = ({ 
  solution, 
  progress, 
  startImplementation, 
  continueImplementation 
}: SolutionSidebarProps) => {
  const navigate = useNavigate();
  const progressPercentage = progress ? Math.round((progress.current_module / 7) * 100) : 0;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-2 border-viverblue/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Sua jornada</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-5">
            {progress ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Seu progresso</span>
                  <span className="text-sm font-medium">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            ) : (
              <div className="bg-amber-50 p-3 rounded-md text-sm text-amber-800">
                <Zap className="h-4 w-4 inline mr-1 text-amber-500" />
                Você ainda não iniciou esta solução
              </div>
            )}
            
            <div className="pt-2">
              {progress ? (
                progress.is_completed ? (
                  <div className="space-y-3">
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate(`/implement/${solution.id}/7`)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Implementação Concluída
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => navigate(`/implement/${solution.id}/0`)}>
                      Revisitar Solução
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full bg-viverblue hover:bg-viverblue/90" onClick={continueImplementation}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Continuar Implementação
                  </Button>
                )
              ) : (
                <Button className="w-full bg-viverblue hover:bg-viverblue/90" onClick={startImplementation}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Iniciar Implementação
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center">
            <Award className="h-5 w-5 mr-2 text-viverblue" />
            Conquistas
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                <Award className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium">Badge de Especialista</h3>
                <p className="text-xs text-muted-foreground">
                  {progress?.is_completed ? "Conquistado!" : "Concluir implementação"}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Quem já implementou:</span>
              </div>
              
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                    {i}
                  </div>
                ))}
                <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium">
                  +120
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Impacto médio reportado:</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-2 rounded text-center">
                  <div className="text-lg font-bold text-blue-600">+35%</div>
                  <div className="text-xs text-blue-700">Produtividade</div>
                </div>
                <div className="bg-green-50 p-2 rounded text-center">
                  <div className="text-lg font-bold text-green-600">-28%</div>
                  <div className="text-xs text-green-700">Tempo gasto</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
