
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Mail, MessageCircle, Send } from "lucide-react";
import { useInviteCreate } from "@/hooks/admin/invites/useInviteCreate";
import { UserNameInput } from "./UserNameInput";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface SimpleCreateInviteDialogProps {
  roles: Role[];
  onInviteCreated: () => void;
}

interface FormData {
  email: string;
  roleId: string;
  notes: string;
  expiresIn: string;
  channels: string[];
  whatsappNumber: string;
  userName: string;
}

const SimpleCreateInviteDialog = ({ roles, onInviteCreated }: SimpleCreateInviteDialogProps) => {
  const [open, setOpen] = useState(false);
  const { createInvite, loading } = useInviteCreate();

  const form = useForm<FormData>({
    defaultValues: {
      email: "",
      roleId: "",
      notes: "",
      expiresIn: "7 days",
      channels: ["email"],
      whatsappNumber: "",
      userName: ""
    }
  });

  const selectedChannels = form.watch("channels");
  const isWhatsAppSelected = selectedChannels.includes("whatsapp");

  const onSubmit = async (data: FormData) => {
    try {
      console.log("🎯 Criando convite:", data);

      const channelsArray = data.channels as ('email' | 'whatsapp')[];
      
      // Validar se WhatsApp está selecionado mas campos obrigatórios estão vazios
      if (channelsArray.includes('whatsapp')) {
        if (!data.whatsappNumber?.trim()) {
          toast.error("Número do WhatsApp é obrigatório quando WhatsApp está selecionado");
          return;
        }
        if (!data.userName?.trim()) {
          toast.error("Nome da pessoa é obrigatório para envio via WhatsApp");
          return;
        }
      }

      const result = await createInvite({
        email: data.email,
        roleId: data.roleId,
        notes: data.notes,
        expiresIn: data.expiresIn,
        channels: channelsArray,
        whatsappNumber: data.whatsappNumber || undefined,
        userName: data.userName || undefined
      });

      if (result?.status === 'success') {
        setOpen(false);
        form.reset();
        onInviteCreated();
      }
    } catch (error) {
      console.error("❌ Erro ao criar convite:", error);
    }
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    const currentChannels = form.getValues("channels");
    if (checked) {
      form.setValue("channels", [...currentChannels, channel]);
    } else {
      form.setValue("channels", currentChannels.filter(c => c !== channel));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Criar Convite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Convite</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="usuario@exemplo.com" {...field} />
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
                  <FormLabel>Função *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Label>Canais de Comunicação *</Label>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-channel"
                    checked={selectedChannels.includes("email")}
                    onCheckedChange={(checked) => handleChannelChange("email", checked as boolean)}
                  />
                  <Label htmlFor="email-channel" className="flex items-center cursor-pointer">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="whatsapp-channel"
                    checked={selectedChannels.includes("whatsapp")}
                    onCheckedChange={(checked) => handleChannelChange("whatsapp", checked as boolean)}
                  />
                  <Label htmlFor="whatsapp-channel" className="flex items-center cursor-pointer">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Label>
                </div>
              </div>
            </div>

            {isWhatsAppSelected && (
              <div className="space-y-4 ml-6 p-4 bg-muted/50 rounded-lg">
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do WhatsApp *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+55 11 99999-9999"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Inclua código do país (ex: +55 para Brasil)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <UserNameInput form={form} isRequired={isWhatsAppSelected} />
              </div>
            )}

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

            <FormField
              control={form.control}
              name="expiresIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiração</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1 day">1 dia</SelectItem>
                      <SelectItem value="3 days">3 dias</SelectItem>
                      <SelectItem value="7 days">7 dias</SelectItem>
                      <SelectItem value="30 days">30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Criar Convite
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCreateInviteDialog;
