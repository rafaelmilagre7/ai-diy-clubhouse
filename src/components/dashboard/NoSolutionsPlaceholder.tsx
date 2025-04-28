
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Settings, FileQuestion } from "lucide-react";

interface NoSolutionsPlaceholderProps {
  onRefresh?: () => void;
}

export const NoSolutionsPlaceholder: FC<NoSolutionsPlaceholderProps> = ({ onRefresh }) => {
  return (
    <Card className="border-dashed">
      <CardContent className="py-10 flex flex-col items-center text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Nenhuma solução encontrada</h3>
        
        <p className="text-muted-foreground mb-6 max-w-md">
          Não encontramos nenhuma solução disponível neste momento. 
          Isto pode ser devido a um problema temporário ou à sua conta estar aguardando ativação.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {onRefresh && (
            <Button 
              variant="default" 
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/profile'}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Verificar configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
