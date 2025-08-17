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
import { Loader2, Mail, User, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      setIsSubmitting(true);

      // Verificar se o email já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', values.email.toLowerCase())
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        toast.error('Este email já está cadastrado na plataforma');
        return;
      }

      // Calcular data de expiração (7 dias)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Gerar token único
      const token = crypto.randomUUID();

      // Criar convite
      const { data: inviteData, error: inviteError } = await supabase
        .from('invites')
        .insert({
          email: values.email.toLowerCase(),
          role_id: values.roleId,
          token,
          expires_at: expiresAt.toISOString(),
          notes: values.notes || null,
          whatsapp_number: values.whatsappNumber || null,
          preferred_channel: 'email',
          created_by: user?.id,
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Enviar email de convite via edge function
      const { error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: { inviteId: inviteData.id }
      });

      if (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Não falha a operação principal se o email não for enviado
        toast.warning('Convite criado, mas houve problema ao enviar o email. Verifique com o usuário.');
      } else {
        toast.success('Convite enviado com sucesso!');
      }
      form.reset();
      onOpenChange(false);
      onSuccess?.();

    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast.error(`Erro ao enviar convite: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

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
            <div className="space-y-4">
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
                        disabled={isSubmitting}
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
                      disabled={isSubmitting || loadingRoles}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
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