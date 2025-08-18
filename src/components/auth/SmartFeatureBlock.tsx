import React from 'react';
import { UnifiedContentBlock } from '@/components/ui/UnifiedContentBlock';
import { usePremiumUpgradeModal } from '@/hooks/usePremiumUpgradeModal';
import { APP_FEATURES } from '@/config/features';
import { Shield } from 'lucide-react';

interface SmartFeatureBlockProps {
  feature: string;
  blockReason: 'insufficient_role' | 'incomplete_setup' | 'feature_disabled' | 'none';
  hasRoleAccess: boolean;
  setupComplete: boolean;
  showPreview?: boolean;
}

// Mapeamento de features para nomes amigáveis
const FEATURE_NAMES = {
  learning: 'a formação',
  solutions: 'as soluções', 
  tools: 'as ferramentas',
  benefits: 'os benefícios',
  networking: 'o networking',
  events: 'os eventos',
  community: 'a comunidade',
  certificates: 'os certificados'
} as const;

export const SmartFeatureBlock: React.FC<SmartFeatureBlockProps> = ({
  feature,
  blockReason,
  hasRoleAccess,
  setupComplete,
  showPreview = true
}) => {
  const { showUpgradeModal } = usePremiumUpgradeModal();
  
  const handleUpgrade = () => {
    const featureName = FEATURE_NAMES[feature as keyof typeof FEATURE_NAMES] || feature;
    // Garantir que seja um tipo válido para o modal
    const validFeature = ['solutions', 'learning', 'tools', 'benefits', 'networking', 'events'].includes(feature) 
      ? feature as 'solutions' | 'learning' | 'tools' | 'benefits' | 'networking' | 'events'
      : 'solutions';
    
    showUpgradeModal(validFeature, `Acesso a ${featureName}`);
  };

  // Se a feature está desabilitada, mostrar uma mensagem simples
  if (blockReason === 'feature_disabled') {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Funcionalidade Indisponível</h3>
          <p className="text-muted-foreground">
            Esta funcionalidade está sendo aprimorada e será reativada em breve.
          </p>
        </div>
      </div>
    );
  }

  const featureName = FEATURE_NAMES[feature as keyof typeof FEATURE_NAMES] || feature;
  
  return (
    <div className="min-h-[400px] rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
      <UnifiedContentBlock 
        sectionName={featureName}
        onClick={handleUpgrade}
      >
        {/* Conteúdo de preview se necessário */}
        {showPreview && (
          <div className="p-8">
            <div className="space-y-4 opacity-30">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        )}
      </UnifiedContentBlock>
    </div>
  );
};