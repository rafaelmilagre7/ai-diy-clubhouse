
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface ReportPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postType: 'topic' | 'reply';
}

const reportReasons = [
  { value: 'spam', label: 'Spam ou conteúdo promocional não solicitado' },
  { value: 'inappropriate', label: 'Conteúdo inapropriado ou ofensivo' },
  { value: 'harassment', label: 'Assédio ou intimidação' },
  { value: 'misinformation', label: 'Informação falsa ou enganosa' },
  { value: 'copyright', label: 'Violação de direitos autorais' },
  { value: 'other', label: 'Outro motivo' },
];

export const ReportPostDialog: React.FC<ReportPostDialogProps> = ({
  isOpen,
  onClose,
  postId,
  postType
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason) {
      setError('Por favor, selecione um motivo para o reporte');
      return;
    }

    if (!user) {
      setError('Você precisa estar logado para reportar conteúdo');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Inserir o reporte na tabela de reportes (assumindo que existe)
      const { error: insertError } = await supabase
        .from('content_reports')
        .insert({
          reporter_id: user.id,
          reported_content_id: postId,
          content_type: postType,
          reason: reason,
          details: details.trim() || null,
          status: 'pending'
        });

      if (insertError) {
        throw insertError;
      }

      toast.success('Reporte enviado com sucesso. Nossa equipe irá analisá-lo.');
      onClose();
      setReason('');
      setDetails('');
    } catch (error: any) {
      console.error('Erro ao enviar reporte:', error);
      setError('Não foi possível enviar o reporte. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reportar Conteúdo</DialogTitle>
          <DialogDescription>
            Ajude-nos a manter a comunidade segura reportando conteúdo inadequado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label className="text-sm font-medium">Motivo do reporte</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((reportReason) => (
                <div key={reportReason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reportReason.value} id={reportReason.value} />
                  <Label 
                    htmlFor={reportReason.value} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {reportReason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-medium">
              Detalhes adicionais (opcional)
            </Label>
            <Textarea
              id="details"
              placeholder="Forneça mais informações sobre o problema..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {details.length}/500 caracteres
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !reason}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
