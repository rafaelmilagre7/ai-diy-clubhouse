
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, Users, Target, CheckCircle } from 'lucide-react';
import { useBenefitClick } from '@/hooks/useBenefitClick';
import { toast } from 'sonner';

interface MemberBenefitModalProps {
  tool: any;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberBenefitModal: React.FC<MemberBenefitModalProps> = ({
  tool,
  isOpen,
  onClose
}) => {
  const { trackBenefitClick, isProcessing } = useBenefitClick();
  const [hasClickedBenefit, setHasClickedBenefit] = useState(false);

  const handleBenefitClick = async (benefitLink: string) => {
    try {
      await trackBenefitClick({
        toolId: tool.id,
        benefitLink
      });
      
      setHasClickedBenefit(true);
      toast.success('Clique registrado! Redirecionando...');
      
      // Abrir link em nova aba
      window.open(benefitLink, '_blank');
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
      toast.error('Erro ao registrar clique do benefício');
    }
  };

  if (!tool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img 
              src={tool.logo_url} 
              alt={tool.name}
              className="w-8 h-8 rounded"
            />
            {tool.name}
            <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5] border-[#0ABAB5]/20">
              Benefício Exclusivo
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Descrição da ferramenta */}
          <div>
            <h3 className="font-semibold mb-2">Sobre a Ferramenta</h3>
            <p className="text-muted-foreground">{tool.description}</p>
          </div>

          {/* Categoria e tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{tool.category}</Badge>
            {tool.tags?.map((tag: string, index: number) => (
              <Badge key={index} variant="outline">{tag}</Badge>
            ))}
          </div>

          {/* Informações do benefício */}
          <div className="bg-gradient-to-r from-[#0ABAB5]/5 to-blue-500/5 p-4 rounded-lg border border-[#0ABAB5]/20">
            <h3 className="font-semibold text-[#0ABAB5] mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Seu Benefício Exclusivo
            </h3>
            
            <div className="space-y-3">
              <p className="text-sm">{tool.member_benefit_description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0ABAB5]" />
                  <span className="text-muted-foreground">Tempo de ativação: Imediato</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0ABAB5]" />
                  <span className="text-muted-foreground">Exclusivo para membros</span>
                </div>
                
                {hasClickedBenefit && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 text-xs">Benefício acessado</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botão de ação */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleBenefitClick(tool.member_benefit_link)}
              disabled={isProcessing}
              className="flex-1 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            >
              {isProcessing ? (
                'Processando...'
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Acessar Benefício
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>

          {/* Observações */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <p>
              <strong>Importante:</strong> Alguns benefícios podem levar alguns minutos para serem ativados. 
              Caso tenha problemas, entre em contato com nosso suporte.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
