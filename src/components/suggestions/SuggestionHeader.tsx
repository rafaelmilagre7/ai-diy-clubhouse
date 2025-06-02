
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home } from 'lucide-react';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage 
} from '@/components/ui/breadcrumb';

const SuggestionHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 mb-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 hover:text-primary cursor-pointer"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={() => navigate('/suggestions')}
              className="hover:text-primary cursor-pointer"
            >
              Sugestões
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground">
              Detalhes da Sugestão
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-accent/50"
        onClick={() => navigate('/suggestions')}
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Voltar para Sugestões</span>
      </Button>
    </div>
  );
};

export default SuggestionHeader;
