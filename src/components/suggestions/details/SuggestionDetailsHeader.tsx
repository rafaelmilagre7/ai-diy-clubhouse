
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home } from 'lucide-react';
import { AdminActions } from './AdminActions';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage 
} from '@/components/ui/breadcrumb';

interface SuggestionDetailsHeaderProps {
  isAdmin: boolean;
  adminActionLoading: boolean;
  suggestionStatus: string;
  suggestionTitle?: string;
  onUpdateStatus: (status: string) => void;
  onOpenDeleteDialog: () => void;
}

export const SuggestionDetailsHeader = ({
  isAdmin,
  adminActionLoading,
  suggestionStatus,
  suggestionTitle,
  onUpdateStatus,
  onOpenDeleteDialog
}: SuggestionDetailsHeaderProps) => {
  const navigate = useNavigate();

  // Determinar a rota de retorno baseado no contexto admin
  const getBackRoute = () => {
    return isAdmin ? '/admin/suggestions' : '/suggestions';
  };

  const getDashboardRoute = () => {
    return isAdmin ? '/admin' : '/dashboard';
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={() => navigate(getDashboardRoute())}
              className="flex items-center gap-1 hover:text-primary cursor-pointer text-left"
            >
              <Home className="h-4 w-4" />
              {isAdmin ? 'Admin' : 'Dashboard'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={() => navigate(getBackRoute())}
              className="hover:text-primary cursor-pointer text-left"
            >
              Sugestões
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground max-w-[200px] truncate text-left">
              {suggestionTitle || 'Detalhes da Sugestão'}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-accent/50 text-left"
            onClick={() => navigate(getBackRoute())}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar para Sugestões</span>
          </Button>
        </div>
        
        {isAdmin && (
          <div className="flex-shrink-0">
            <AdminActions
              adminActionLoading={adminActionLoading}
              suggestionStatus={suggestionStatus}
              onUpdateStatus={onUpdateStatus}
              onOpenDeleteDialog={onOpenDeleteDialog}
            />
          </div>
        )}
      </div>
    </div>
  );
};
