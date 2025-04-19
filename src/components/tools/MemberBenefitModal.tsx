import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBenefitClick } from '@/hooks/useBenefitClick';
import { Tool } from '@/types/toolTypes';
import { Gift, Copy, ExternalLink, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface MemberBenefitModalProps {
  tool: Tool;
  size?: 'sm' | 'lg' | 'default' | 'icon';
  variant?: 'default' | 'outline';
}

export const MemberBenefitModal = ({ 
  tool, 
  size = 'default', 
  variant = 'default' 
}: MemberBenefitModalProps) => {
  const [open, setOpen] = useState(false);
  const { registerBenefitClick, isProcessing } = useBenefitClick();
  const [copied, setCopied] = useState(false);

  const hasPromoCode = tool.benefit_description?.includes('CÓDIGO:') || 
                      tool.benefit_description?.includes('CUPOM:') ||
                      tool.benefit_description?.includes('PROMO:');

  const extractPromoCode = () => {
    if (!tool.benefit_description) return null;
    
    const codeMatch = tool.benefit_description.match(/(?:CÓDIGO|CUPOM|PROMO):?\s+([A-Z0-9-_]+)/i);
    return codeMatch ? codeMatch[1] : null;
  };

  const promoCode = extractPromoCode();

  const handleCopyCode = () => {
    if (promoCode) {
      navigator.clipboard.writeText(promoCode);
      setCopied(true);
      toast.success('Código copiado para a área de transferência!');
      
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };

  const handleAccessBenefit = () => {
    if (tool.id && tool.benefit_link) {
      registerBenefitClick(tool.id, tool.benefit_link);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`${variant === 'default' ? 'bg-[#10b981] hover:bg-[#10b981]/90' : 'bg-white text-[#10b981] border-[#10b981] hover:bg-[#10b981]/10'}`}
          size={size}
        >
          <Gift className="mr-2 h-4 w-4" />
          Benefício Membro
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#10b981]">Benefício Exclusivo</Badge>
          </div>
          <DialogTitle className="text-xl">
            {tool.benefit_title}
          </DialogTitle>
          <DialogDescription>
            Oferta exclusiva para membros do VIVER DE IA Club
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          {tool.benefit_badge_url ? (
            <img 
              src={tool.benefit_badge_url} 
              alt="Badge" 
              className="w-24 h-24 object-contain mb-4" 
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#10b981]/10 flex items-center justify-center mb-4">
              <Gift className="h-10 w-10 text-[#10b981]" />
            </div>
          )}
          
          <div className="prose max-w-full w-full">
            <p className="text-center whitespace-pre-line">
              {tool.benefit_description}
            </p>
          </div>
          
          {promoCode && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md flex items-center justify-between w-full">
              <code className="font-mono font-bold text-[#10b981]">{promoCode}</code>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleCopyCode}
                className="text-[#10b981]"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="sm:w-auto flex-1"
          >
            Fechar
          </Button>
          
          <Button 
            className="bg-[#10b981] hover:bg-[#10b981]/90 sm:w-auto flex-1"
            onClick={handleAccessBenefit}
            disabled={isProcessing}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Acessar Benefício
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
