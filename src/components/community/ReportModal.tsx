
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    report_type: string;
    reason: string;
    description?: string;
  }) => Promise<void>;
  targetType: 'topic' | 'post';
}

export const ReportModal = ({ open, onOpenChange, onSubmit, targetType }: ReportModalProps) => {
  const [reportType, setReportType] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportTypes = [
    { value: 'spam', label: 'Spam ou publicidade não solicitada' },
    { value: 'inappropriate', label: 'Conteúdo inadequado ou ofensivo' },
    { value: 'harassment', label: 'Assédio ou bullying' },
    { value: 'misinformation', label: 'Informação falsa ou enganosa' },
    { value: 'other', label: 'Outro motivo' }
  ];

  const handleSubmit = async () => {
    if (!reportType || !reason.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        report_type: reportType,
        reason: reason.trim(),
        description: description.trim() || undefined
      });
      
      // Reset form
      setReportType('');
      setReason('');
      setDescription('');
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Reportar {targetType === 'topic' ? 'Tópico' : 'Post'}
          </DialogTitle>
          <DialogDescription>
            Sua denúncia será analisada pela equipe de moderação. Relatórios falsos podem resultar em penalidades.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="report-type">Tipo de Problema</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de problema" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Motivo (obrigatório)</Label>
            <Textarea
              id="reason"
              placeholder="Explique brevemente o problema..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reason.length}/500 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="description">Detalhes Adicionais (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Adicione mais detalhes se necessário..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/1000 caracteres
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reportType || !reason.trim() || isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Relatório'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
