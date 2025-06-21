
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Mail, MessageCircle } from "lucide-react";
import { useUserRoles } from "@/hooks/admin/useUserRoles";
import { useInviteCreate } from "@/hooks/admin/invites/useInviteCreate";
import { UserNameInput } from "./UserNameInput";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  roleId: z.string().min(1, "Selecione um papel"),
  notes: z.string().optional(),
  channels: z.array(z.enum(["email", "whatsapp"])).min(1, "Selecione pelo menos um canal"),
  whatsappNumber: z.string().optional(),
  userName: z.string().optional(),
}).refine((data) => {
  // Se WhatsApp está selecionado, número e nome são obrigatórios
  if (data.channels.includes("whatsapp")) {
    return data.whatsappNumber && data.whatsappNumber.trim() !== "" &&
           data.userName && data.userName.trim() !== "";
  }
  return true;
}, {
  message: "WhatsApp número e nome da pessoa são obrigatórios quando WhatsApp está selecionado",
  path: ["whatsappNumber"],
});

interface SimpleCreateInviteDialogProps {
  onInviteCreated?: () => void;
}

const SimpleCreateInviteDialog = ({ onInviteCreated }: SimpleCreateInviteDialogProps) => {
  const [open, setOpen] = useState(false);
  const { roles } = useUserRoles();
  const { createInvite, loading } = useInviteCreate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      roleId: "",
      notes: "",
      channels: ["email"],
      whatsappNumber: "",
      userName: "",
    },
  });

  const watchedChannels = form.watch("channels");
  const isWhatsAppSelected = watchedChannels.includes("whatsapp");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await createInvite({
      email: values.email,
      roleId: values.roleId,
      notes: values.notes,
      channels: values.channels,
      whatsappNumber: values.whatsappNumber,
      userName: values.userName,
    });

    if (result?.status === 'success') {
      setOpen(false);
      form.reset();
      onInviteCreated?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Criar Convite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Convite</DialogTitle>
          <DialogDescription>
            Crie um convite para um novo usuário. Escolha os canais de envio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario@exemplo.com" {...field} />
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
                    <FormLabel>Papel*</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="">Selecione um papel</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="channels"
                render={() => (
                  <FormItem>
                    <FormLabel>Canais de Envio*</FormLabel>
                    <div className="flex items-center space-x-4">
                      <FormField
                        control={form.control}
                        name="channels"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes("email")}
                                onCheckedChange={(checked) => {
                                  const currentChannels = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentChannels.filter(c => c !== "email"), "email"]);
                                  } else {
                                    field.onChange(currentChannels.filter(c => c !== "email"));
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <FormLabel>Email</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="channels"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes("whatsapp")}
                                onCheckedChange={(checked) => {
                                  const currentChannels = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentChannels.filter(c => c !== "whatsapp"), "whatsapp"]);
                                  } else {
                                    field.onChange(currentChannels.filter(c => c !== "whatsapp"));
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              <FormLabel>WhatsApp</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isWhatsAppSelected && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Número WhatsApp*
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(11) 99999-9999" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <UserNameInput form={form} isRequired={isWhatsAppSelected} />
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais sobre o convite..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Convite"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCreateInviteDialog;
