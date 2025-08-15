
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Role, useRoles } from "@/hooks/admin/useRoles";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  role?: Role;
}

const roleSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(50, "O nome não pode ter mais de 50 caracteres")
    .regex(/^[a-z0-9_-]+$/, "Use apenas letras minúsculas, números, _ ou -")
    .refine((s) => !["admin", "member"].includes(s), {
      message: "Este nome de papel é reservado pelo sistema",
    }),
  description: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres")
    .max(200, "A descrição não pode ter mais de 200 caracteres"),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export function RoleForm({ open, onOpenChange, mode, role }: RoleFormProps) {
  const { createRole, updateRole, isCreating, isUpdating } = useRoles();
  const { user, session, isAdmin } = useAuth();
  const [authStatus, setAuthStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [retryCount, setRetryCount] = useState(0);

  // Verificar status de autenticação quando o modal abrir
  useEffect(() => {
    if (open) {
      checkAuthenticationStatus();
    }
  }, [open, user, session, isAdmin]);

  const checkAuthenticationStatus = async () => {
    setAuthStatus('checking');
    
    // Pequeno delay para dar tempo dos estados se atualizarem
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('🔐 [ROLE_FORM] Verificando auth:', { 
      user: !!user, 
      session: !!session, 
      isAdmin 
    });
    
    if (!user || !session || !isAdmin) {
      console.warn('⚠️ [ROLE_FORM] Problemas de autenticação detectados');
      setAuthStatus('invalid');
    } else {
      console.log('✅ [ROLE_FORM] Autenticação OK');
      setAuthStatus('valid');
    }
  };

  const handleRetryAuth = () => {
    setRetryCount(prev => prev + 1);
    checkAuthenticationStatus();
  };

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && role) {
      form.reset({
        name: role.name,
        description: role.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [form, mode, role, open]);

  const onSubmit = async (values: RoleFormValues) => {
    try {
      // Verificar auth antes de submeter
      if (authStatus !== 'valid') {
        console.error('❌ [ROLE_FORM] Tentativa de submissão sem auth válida');
        await checkAuthenticationStatus();
        return;
      }

      if (mode === "create") {
        console.log('🔄 [ROLE_FORM] Criando role:', values);
        await createRole({
          name: values.name,
          description: values.description,
          is_system: false,
        });
      } else if (mode === "edit" && role) {
        console.log('🔄 [ROLE_FORM] Editando role:', values);
        await updateRole(role.id, {
          name: values.name,
          description: values.description,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("❌ [ROLE_FORM] Erro ao salvar papel:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Criar novo papel" : "Editar papel"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Crie um novo papel para atribuir aos usuários"
              : "Atualize as informações do papel"}
          </DialogDescription>
        </DialogHeader>

        {/* Status de autenticação */}
        {authStatus === 'checking' && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Verificando permissões de administrador...
            </AlertDescription>
          </Alert>
        )}

        {authStatus === 'invalid' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Sessão inválida ou permissões insuficientes. Faça login como administrador.
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetryAuth}
                className="ml-2"
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {authStatus === 'valid' && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Autenticação verificada. Pronto para criar papéis.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do papel</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="usuario_premium" 
                      {...field} 
                      disabled={mode === "edit" && role?.is_system}
                    />
                  </FormControl>
                  <FormDescription>
                    O nome técnico do papel, usado internamente no sistema
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o papel e suas permissões..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Uma descrição clara para ajudar a identificar o propósito deste papel
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating || authStatus !== 'valid'}
              >
                {isCreating || isUpdating ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
