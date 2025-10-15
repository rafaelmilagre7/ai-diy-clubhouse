import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Opportunity } from '@/hooks/networking/useOpportunities';
import { formatRelativeDate } from '@/lib/utils';
import { Mail, Building2, User, Calendar, Eye, Tag, MessageSquare, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

const opportunityTypeLabels: Record<string, { label: string; emoji: string }> = {
  parceria: { label: 'Parceria', emoji: '🤝' },
  fornecedor: { label: 'Fornecedor', emoji: '📦' },
  cliente: { label: 'Cliente', emoji: '💼' },
  investimento: { label: 'Investimento', emoji: '💰' },
  outro: { label: 'Outro', emoji: '🎯' },
};

const contactPreferenceLabels: Record<string, string> = {
  platform: 'Chat da plataforma',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  email: 'Email',
};

export const OpportunityDetailModal = ({
  opportunity,
  open,
  onOpenChange,
  onToggle,
  onDelete,
}: OpportunityDetailModalProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!opportunity) return null;

  const profile = opportunity.profiles;
  const typeData = opportunityTypeLabels[opportunity.opportunity_type] || opportunityTypeLabels.outro;

  const handleDelete = () => {
    onDelete(opportunity.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  const handleToggle = () => {
    onToggle(opportunity.id, !opportunity.is_active);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">{opportunity.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <span>{typeData.emoji}</span>
                    {typeData.label}
                  </Badge>
                  <Badge variant={opportunity.is_active ? 'success' : 'secondary'}>
                    {opportunity.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Author Info */}
            <div className="liquid-glass-card p-4 rounded-xl">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Informações do Autor
              </h3>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.name?.substring(0, 2).toUpperCase() || 'UN'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{profile?.name || 'Nome não informado'}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {profile?.company_name || 'Empresa não informada'}
                  </p>
                  {profile?.email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {profile.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {opportunity.description}
              </p>
            </div>

            {/* Tags */}
            {opportunity.tags && opportunity.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Preference */}
            <div className="liquid-glass-card p-4 rounded-xl">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Preferência de Contato
              </h3>
              <p className="text-sm text-muted-foreground">
                {contactPreferenceLabels[opportunity.contact_preference]}
              </p>
            </div>

            <Separator className="bg-white/10" />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Criado {formatRelativeDate(opportunity.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{opportunity.views_count || 0} visualizações</span>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleToggle}
                className="flex-1"
              >
                {opportunity.is_active ? (
                  <>
                    <ToggleLeft className="w-4 h-4 mr-2" />
                    Desativar
                  </>
                ) : (
                  <>
                    <ToggleRight className="w-4 h-4 mr-2" />
                    Ativar
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta oportunidade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
