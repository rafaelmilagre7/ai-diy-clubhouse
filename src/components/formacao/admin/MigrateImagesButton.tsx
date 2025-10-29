import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";
import {
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const MigrateImagesButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { showSuccess, showError } = useToastModern();

  const handleMigration = async () => {
    setIsLoading(true);
    setProgress(0);
    setResult(null);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke('migrate-lesson-images');
      
      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw error;
      }

      setResult(data);
      
      if (data.success) {
        showSuccess("Migração concluída!", data.message);
      } else {
        showError("Erro na migração", data.error || "Erro desconhecido");
      }
    } catch (error: any) {
      console.error("Erro na migração:", error);
      setProgress(0);
      showError("Erro na migração", error.message || "Erro ao executar migração");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrando imagens...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Migrar Imagens do ImgBB
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Migrar Imagens das Aulas</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Esta ação irá:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Baixar todas as imagens de capa das aulas do ImgBB</li>
                <li>Fazer upload para o Supabase Storage</li>
                <li>Atualizar as URLs no banco de dados</li>
              </ul>
              <p className="text-status-warning font-medium">
                ⚠️ Esta operação pode levar alguns minutos dependendo da quantidade de imagens.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMigration}>
              Iniciar Migração
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Migrando imagens... {progress}%
          </p>
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-lg border ${result.success ? 'bg-operational/10 border-operational/30' : 'bg-status-error/10 border-status-error/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-operational" />
            ) : (
              <AlertCircle className="h-5 w-5 text-status-error" />
            )}
            <h4 className="font-medium">Resultado da Migração</h4>
          </div>
          
          <p className="text-sm mb-2">{result.message}</p>
          
          {result.migrated !== undefined && (
            <p className="text-sm">
              <strong>Migradas:</strong> {result.migrated} de {result.total} imagens
            </p>
          )}
          
          {result.errors && result.errors.length > 0 && (
            <details className="mt-2">
              <summary className="text-sm font-medium cursor-pointer">
                Erros ({result.errors.length})
              </summary>
              <ul className="list-disc pl-5 text-xs space-y-1 mt-1">
                {result.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
};