
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';

interface CampaignEmptyStateProps {
  onCreateCampaign: () => void;
}

export const CampaignEmptyState = ({ onCreateCampaign }: CampaignEmptyStateProps) => {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Target className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma campanha criada</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Crie sua primeira campanha de convites para começar a organizar e gerenciar seus convites de forma estruturada.
        </p>
        <Button onClick={onCreateCampaign}>
          <Plus className="h-4 w-4 mr-2" />
          Criar primeira campanha
        </Button>
      </CardContent>
    </Card>
  );
};
