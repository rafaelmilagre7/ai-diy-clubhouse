
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';

interface TrailPanelActionsProps {
  onRegenerate?: () => void;
  onClose?: () => void;
}

export const TrailPanelActions: React.FC<TrailPanelActionsProps> = ({ onRegenerate, onClose }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 pt-6 border-t border-[#0ABAB5]/10">
      {onRegenerate && (
        <Button 
          onClick={onRegenerate} 
          variant="outline" 
          className="border-[#0ABAB5]/30 text-[#0ABAB5] hover:bg-[#0ABAB5]/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerar Trilha
        </Button>
      )}
      
      {onClose && (
        <Button 
          onClick={onClose} 
          className="bg-gradient-to-r from-[#0ABAB5] to-[#34D399] hover:from-[#0ABAB5]/90 hover:to-[#34D399]/90"
        >
          <Home className="h-4 w-4 mr-2" />
          Ir para Dashboard
        </Button>
      )}
    </div>
  );
};
