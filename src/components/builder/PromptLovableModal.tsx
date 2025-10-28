import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Loader2, FileCode } from 'lucide-react';
import { toast } from 'sonner';

interface PromptLovableModalProps {
  open: boolean;
  onClose: () => void;
  prompt: string | null;
  loading: boolean;
  onGenerate?: () => void;
}

export const PromptLovableModal: React.FC<PromptLovableModalProps> = ({
  open,
  onClose,
  prompt,
  loading,
  onGenerate
}) => {
  const handleCopy = () => {
    if (!prompt) return;
    
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copiado para a área de transferência!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            Prompt Lovable - Pronto para Implementar
          </DialogTitle>
          <DialogDescription>
            Cole este prompt completo no Lovable para criar sua solução
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Gerando prompt completo... Isso pode levar até 1 minuto.
              </p>
            </div>
          ) : prompt ? (
            <div className="space-y-md">
              <div className="bg-muted/50 border border-border rounded-lg p-md">
                <pre className="text-sm whitespace-pre-wrap font-mono text-foreground">
                  {prompt}
                </pre>
              </div>

              <div className="flex gap-sm justify-end">
                <Button
                  onClick={handleCopy}
                  variant="default"
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar Prompt
                </Button>
                {onGenerate && (
                  <Button
                    onClick={() => {
                      onGenerate();
                      toast.info('Gerando novo prompt...');
                    }}
                    variant="outline"
                  >
                    Gerar Novamente
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <FileCode className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground text-center">
                Nenhum prompt gerado ainda.
                <br />
                Clique em "Gerar" para criar o prompt completo.
              </p>
              {onGenerate && (
                <Button onClick={onGenerate} variant="default" className="mt-4">
                  Gerar Prompt
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
