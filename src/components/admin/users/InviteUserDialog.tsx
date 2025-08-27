import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, User, UserPlus, CheckCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useInviteCreate } from '@/hooks/admin/invites/useInviteCreate';
import { InviteProgressSteps, type InviteStep } from '@/components/admin/invites/InviteProgressSteps';
import { cn } from '@/lib/utils';

const inviteSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ser válido'),
  roleId: z
    .string()
    .min(1, 'Papel é obrigatório'),
  notes: z
    .string()
    .optional(),
  whatsappNumber: z
    .string()
    .optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [step, setStep] = useState<InviteStep>('form');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { createInvite, isCreating } = useInviteCreate();

  // Atualizar a lista de roles quando o dialog for aberto
  useEffect(() => {
    if (open) {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    }
  }, [open, queryClient]);

  // Buscar roles disponíveis
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, name, description')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      roleId: '',
      notes: '',
      whatsappNumber: '',
    },
  });

  const handleSubmit = async (values: InviteFormValues) => {
    try {
      setStep('creating');
      
      // Timeout de segurança para evitar travamentos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operação expirou após 30 segundos')), 30000)
      );
      
      // Promise principal
      const invitePromise = (async () => {
        const result = await createInvite(
          values.email.toLowerCase(),
          values.roleId,
          values.notes || undefined,
          '7 days',
          values.whatsappNumber || undefined,
          'email'
        );
        
        if (!result) {
          throw new Error('Falha ao criar convite');
        }
        
        return result;
      })();
      
      // Race entre timeout e criação do convite
      const result = await Promise.race([invitePromise, timeoutPromise]);

      if (result) {
        setStep('success');
        
        // Mostrar sucesso por um momento antes de fechar
        setTimeout(() => {
          form.reset();
          setStep('form');
          onOpenChange(false);
          onSuccess?.();
        }, 1200);
      } else {
        throw new Error('Resultado inválido');
      }
    } catch (error: any) {
      console.error('❌ [INVITE-DIALOG] Erro no processo:', error);
      setStep('error');
      
      // Voltar ao form após mostrar erro
      setTimeout(() => {
        setStep('form');
      }, 3000);
      
      toast.error('Erro ao criar convite', {
        description: error.message || 'Tente novamente em alguns instantes.'
      });
    }
  };

  const handleCancel = () => {
    if (step !== 'creating' && step !== 'sending') {
      form.reset();
      setStep('form');
      onOpenChange(false);
    }
  };

  // Reset step quando dialog abre/fecha
  useEffect(() => {
    if (!open) {
      setStep('form');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Convidar Novo Usuário
          </DialogTitle>
          <DialogDescription>
            Envie um convite por email para que a pessoa possa se cadastrar na plataforma.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Indicador de progresso */}
            <InviteProgressSteps currentStep={step} />
            
            <div className={cn("space-y-4", step !== 'form' && "opacity-60")}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email do usuário
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="usuario@exemplo.com"
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Papel no sistema
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isCreating || loadingRoles}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o papel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border">
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div>
                              <div className="font-medium">{role.name}</div>
                              {role.description && (
                                <div className="text-xs text-muted-foreground">
                                  {role.description}
                                </div>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="(11) 99999-9999"
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Informações adicionais sobre o convite..."
                        rows={3}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {step === 'creating' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando convite...
                  </>
                ) : step === 'sending' ? (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviando email...
                  </>
                ) : step === 'success' ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Enviado com sucesso!
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Convite
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};