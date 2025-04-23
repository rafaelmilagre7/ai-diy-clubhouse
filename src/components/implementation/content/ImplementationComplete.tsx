
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Award, Download, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth';
import confetti from 'canvas-confetti';
import { Solution } from '@/types/solution';

interface ImplementationCompleteProps {
  solution: Solution;
  onComplete: () => Promise<void>;
  isCompleting: boolean;
  isCompleted: boolean;
}

export const ImplementationComplete: React.FC<ImplementationCompleteProps> = ({
  solution,
  onComplete,
  isCompleting,
  isCompleted
}) => {
  const { profile } = useAuth();
  
  // Função para disparar confetti quando a implementação for concluída
  const handleComplete = async () => {
    try {
      await onComplete();
      
      // Disparar confetti após confirmar a implementação
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error("Erro ao marcar como concluído:", error);
    }
  };
  
  return (
    <div className="max-w-md mx-auto py-4">
      <Card className="bg-white/70 border-2 border-green-100">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="h-7 w-7 text-green-600" />
            Concluir Implementação
          </CardTitle>
          <CardDescription>
            Parabéns por chegar até aqui! Você está prestes a concluir a implementação desta solução.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
              <AvatarFallback>{profile?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{profile?.name}</h3>
              <p className="text-sm text-muted-foreground">{profile?.company_name || "Membro VIVER DE IA Club"}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-center">
            <h4 className="font-medium">Solução implementada:</h4>
            <p className="font-semibold text-lg text-green-700">{solution.title}</p>
            
            <div className="py-2">
              <p className="text-sm text-muted-foreground">
                Ao confirmar a conclusão, você ganhará acesso ao seu certificado de implementação e desbloqueará conquistas no VIVER DE IA Club.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button 
            onClick={handleComplete} 
            className="w-full" 
            disabled={isCompleting || isCompleted}
          >
            {isCompleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Implementação Concluída
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmar Implementação
              </>
            )}
          </Button>
          
          {isCompleted && (
            <div className="flex justify-between w-full pt-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Award className="h-4 w-4" />
                <span>Ver Conquistas</span>
              </Button>
              
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                <span>Baixar Certificado</span>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
