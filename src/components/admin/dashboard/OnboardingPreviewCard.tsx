
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, ArrowRight, Users, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OnboardingPreviewCard = () => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-500" />
            Preview do Onboarding
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            Protótipo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Teste e valide todo o fluxo do onboarding em um ambiente controlado antes da implementação final.
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            <span>6 Etapas</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-500" />
            <span>Debug Panel</span>
          </div>
        </div>
        
        <div className="pt-2">
          <Link to="/admin/onboarding-preview">
            <Button className="w-full group">
              Abrir Preview
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
