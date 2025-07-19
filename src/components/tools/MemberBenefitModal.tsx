
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBenefitClick } from '@/hooks/useBenefitClick';
import { Tool } from '@/types/toolTypes';
import { Gift, Copy, ExternalLink, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BenefitAccessDenied } from './BenefitAccessDenied';
import { cn } from '@/lib/utils';

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
  const hasAccessRestriction = tool.is_access_restricted === true;
  const hasAccess = tool.has_access !== false;

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
          className={cn(
            "w-full group relative overflow-hidden",
            variant === 'default' 
              ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl' 
              : 'bg-card/50 text-primary border border-primary/30 hover:bg-primary/10 backdrop-blur'
          )}
          size={size}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Gift className="mr-2 h-4 w-4 relative z-10" />
          <span className="relative z-10">Benefício Membro</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-card via-card to-muted/50 border border-border/50 backdrop-blur text-foreground">
        {hasAccessRestriction && !hasAccess ? (
          <BenefitAccessDenied 
            tool={tool} 
            onClose={() => setOpen(false)} 
          />
        ) : (
          <>
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
                  <Badge className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 px-4 py-1">
                    Benefício Exclusivo
                  </Badge>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <DialogTitle className="text-2xl font-heading font-bold text-foreground">
                  {tool.benefit_title || `Benefício ${tool.name}`}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Oferta exclusiva para membros do VIVER DE IA Club
                </DialogDescription>
              </div>
            </DialogHeader>
            
            <div className="flex flex-col items-center py-6 space-y-6">
              {/* Badge ou ícone do benefício */}
              <div className="relative">
                {tool.benefit_badge_url ? (
                  <>
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                    <img 
                      src={tool.benefit_badge_url} 
                      alt="Badge do benefício" 
                      className="relative w-24 h-24 object-contain" 
                    />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
                      <Gift className="h-10 w-10 text-primary" />
                    </div>
                  </>
                )}
              </div>
              
              {/* Descrição do benefício */}
              <div className="w-full space-y-4">
                <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4">
                  <p className="text-center whitespace-pre-line text-foreground leading-relaxed">
                    {tool.benefit_description || "Acesse este benefício exclusivo para membros."}
                  </p>
                </div>
                
                {/* Código promocional */}
                {promoCode && (
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Código promocional:</p>
                        <code className="font-mono font-bold text-lg text-primary">{promoCode}</code>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCopyCode}
                        className="ml-4 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="sm:w-auto flex-1 border-border/50 hover:bg-accent"
              >
                Fechar
              </Button>
              
              {tool.benefit_link && (
                <Button 
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl sm:w-auto flex-1 group"
                  onClick={handleAccessBenefit}
                  disabled={isProcessing}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <ExternalLink className="mr-2 h-4 w-4 relative z-10" />
                  <span className="relative z-10">
                    {isProcessing ? 'Acessando...' : 'Acessar Benefício'}
                  </span>
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
