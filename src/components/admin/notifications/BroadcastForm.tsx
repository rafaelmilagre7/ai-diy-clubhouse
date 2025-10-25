import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Bell, Send, Users, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const broadcastSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(100),
  message: z.string().min(10, "Mensagem deve ter no mínimo 10 caracteres").max(500),
  type: z.string(),
  category: z.string(),
  priority: z.number().min(1).max(5),
  action_url: z.string().optional(),
  target_audience: z.enum(["all", "by_role", "by_date"]),
  roles: z.array(z.string()).optional(),
  created_after: z.string().optional(),
});

type BroadcastFormValues = z.infer<typeof broadcastSchema>;

const NOTIFICATION_TYPES = [
  { value: "feature_announcement", label: "Anúncio de Feature" },
  { value: "system_update", label: "Atualização de Sistema" },
  { value: "event", label: "Evento" },
  { value: "maintenance", label: "Manutenção" },
  { value: "promotional", label: "Promocional" },
];

const CATEGORIES = [
  { value: "platform", label: "Plataforma" },
  { value: "community", label: "Comunidade" },
  { value: "learning", label: "Aprendizado" },
  { value: "tools", label: "Ferramentas" },
];

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "membro_club", label: "Membro Club" },
  { value: "member", label: "Member" },
  { value: "formacao", label: "Formação" },
];

export default function BroadcastForm() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [estimatedRecipients, setEstimatedRecipients] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);

  const form = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "feature_announcement",
      category: "platform",
      priority: 3,
      action_url: "",
      target_audience: "all",
      roles: [],
      created_after: "",
    },
  });

  const targetAudience = form.watch("target_audience");
  const selectedRoles = form.watch("roles");

  // Estimar número de destinatários
  const estimateRecipients = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      
      if (targetAudience === "by_role" && selectedRoles?.length) {
        filters.roles = selectedRoles;
      }
      
      if (targetAudience === "by_date") {
        filters.created_after = form.getValues("created_after");
      }

      const { data, error } = await supabase.rpc("get_users_for_broadcast", {
        p_roles: filters.roles || null,
        p_created_after: filters.created_after || null,
        p_status: "active",
      });

      if (error) throw error;

      setEstimatedRecipients(data?.length || 0);
    } catch (error) {
      console.error("Erro ao estimar destinatários:", error);
      toast.error("Erro ao calcular destinatários");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: BroadcastFormValues) => {
    await estimateRecipients();
    setShowConfirmDialog(true);
  };

  const sendBroadcast = async () => {
    setIsSending(true);
    setProgress(0);
    
    try {
      const values = form.getValues();
      
      const filters: any = {};
      if (values.target_audience === "by_role" && values.roles?.length) {
        filters.roles = values.roles;
      }
      if (values.target_audience === "by_date" && values.created_after) {
        filters.created_after = values.created_after;
      }

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke("broadcast-notification", {
        body: {
          title: values.title,
          message: values.message,
          type: values.type,
          category: values.category,
          priority: values.priority,
          action_url: values.action_url || null,
          filters,
          metadata: {
            broadcast_date: new Date().toISOString(),
          },
          confirm: true,
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      toast.success("Broadcast enviado!", {
        description: `${data.stats.sent} notificações enviadas com sucesso`,
      });

      form.reset();
      setEstimatedRecipients(null);
      setShowConfirmDialog(false);
    } catch (error: any) {
      console.error("Erro ao enviar broadcast:", error);
      toast.error("Erro ao enviar broadcast", {
        description: error.message,
      });
    } finally {
      setIsSending(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Broadcast de Notificações</h2>
          <p className="text-muted-foreground">
            Envie notificações em massa para usuários da plataforma
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Título */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título da Notificação</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Nova funcionalidade disponível" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mensagem */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensagem</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva a notificação..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Máximo 500 caracteres</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NOTIFICATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Action URL */}
          <FormField
            control={form.control}
            name="action_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de Ação (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="/ferramentas/builder" {...field} />
                </FormControl>
                <FormDescription>Para onde redirecionar ao clicar</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Público-alvo */}
          <FormField
            control={form.control}
            name="target_audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Público-Alvo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">Todos os Usuários</SelectItem>
                    <SelectItem value="by_role">Por Role</SelectItem>
                    <SelectItem value="by_date">Por Data de Cadastro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Filtros condicionais */}
          {targetAudience === "by_role" && (
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecionar Roles</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map((role) => (
                      <label key={role.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={role.value}
                          checked={field.value?.includes(role.value)}
                          onChange={(e) => {
                            const updatedRoles = e.target.checked
                              ? [...(field.value || []), role.value]
                              : (field.value || []).filter((r) => r !== role.value);
                            field.onChange(updatedRoles);
                          }}
                          className="rounded border-gray-300"
                        />
                        <span>{role.label}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {targetAudience === "by_date" && (
            <FormField
              control={form.control}
              name="created_after"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cadastrados Após</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Estimativa */}
          {estimatedRecipients !== null && (
            <div className="p-4 rounded-lg bg-muted flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Destinatários Estimados</p>
                <p className="text-2xl font-bold text-primary">{estimatedRecipients}</p>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={estimateRecipients}
              disabled={isLoading}
            >
              <Users className="h-4 w-4 mr-2" />
              {isLoading ? "Calculando..." : "Calcular Destinatários"}
            </Button>
            <Button type="submit" disabled={isSending || isLoading}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Broadcast
            </Button>
          </div>

          {/* Progress bar durante envio */}
          {isSending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Enviando notificações...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </form>
      </Form>

      {/* Dialog de Confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <AlertDialogTitle>Confirmar Envio de Broadcast</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2">
              <p>
                Você está prestes a enviar uma notificação para{" "}
                <strong className="text-foreground">{estimatedRecipients} usuários</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Esta ação não pode ser desfeita. Todos os usuários receberão a notificação
                imediatamente.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={sendBroadcast} disabled={isSending}>
              {isSending ? "Enviando..." : "Confirmar Envio"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
