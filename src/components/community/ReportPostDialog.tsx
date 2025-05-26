
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ReportPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postType: 'topic' | 'post';
}

export const ReportPostDialog: React.FC<ReportPostDialogProps> = ({
  isOpen,
  onClose,
  postId,
  postType
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    { value: 'spam', label: 'Spam ou conteúdo promocional não solicitado' },
    { value: 'inappropriate', label: 'Conteúdo inapropriado ou ofensivo' },
    { value: 'harassment', label: 'Assédio ou comportamento abusivo' },
    { value: 'misinformation', label: 'Desinformação ou conteúdo falso' },
    { value: 'copyright', label: 'Violação de direitos autorais' },
    { value: 'other', label: 'Outro motivo' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Selecione um motivo para o reporte');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular envio do reporte
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Reporte enviado com sucesso. Nossa equipe irá analisar.');
      onClose();
      setReason('');
      setDescription('');
    } catch (error) {
      toast.error('Erro ao enviar reporte. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-yellow-600" />
            Reportar {postType === 'topic' ? 'Tópico' : 'Resposta'}
          </DialogTitle>
          <DialogDescription>
            Nos ajude a manter nossa comunidade segura reportando conteúdo inadequado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Motivo do reporte</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((reportReason) => (
                <div key={reportReason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reportReason.value} id={reportReason.value} />
                  <Label htmlFor={reportReason.value} className="text-sm leading-relaxed">
                    {reportReason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição adicional (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Forneça mais detalhes sobre o problema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Reportes falsos ou abusivos podem resultar em ações disciplinares.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !reason}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
