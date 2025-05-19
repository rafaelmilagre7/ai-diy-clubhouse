
import React, { useState } from "react";
import { useReferrals } from "@/hooks/referrals/useReferrals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useCreateReferral } from "@/hooks/referrals/useCreateReferral";
import { Send, RefreshCw, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ReferralsList() {
  const { referrals, loading, refresh } = useReferrals();
  const [resendingId, setResendingId] = useState<string | null>(null);
  const { submitReferral } = useCreateReferral();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        Carregando indicações...
      </div>
    );
  }

  if (referrals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <p className="mb-2">Você ainda não fez nenhuma indicação.</p>
        <p>Comece indicando amigos e conhecidos para o Viver de IA!</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-300">Pendente</Badge>;
      case "registered":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-300">Registrado</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-300">Completado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "club" ? "Club" : "Formação";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  const handleResend = async (referral: any) => {
    try {
      setResendingId(referral.id);
      
      console.log("Enviando o convite novamente para:", {
        email: referral.email,
        type: referral.type,
        notes: referral.notes,
        whatsappNumber: referral.whatsapp_number,
        useWhatsapp: !!referral.whatsapp_number
      });
      
      // Atualizar contagem de envios na tabela referrals
      try {
        const { error: statsError } = await supabase.functions.invoke('update_invite_send_stats', {
          body: { invite_id: referral.id }
        });
        
        if (statsError) {
          console.error("Erro ao atualizar estatísticas de envio:", statsError);
        }
      } catch (statsUpdateError) {
        console.error("Exceção ao atualizar estatísticas de envio:", statsUpdateError);
      }
      
      // Reenviar o convite com os mesmos dados
      const result = await submitReferral({
        email: referral.email,
        type: referral.type,
        notes: referral.notes,
        whatsappNumber: referral.whatsapp_number,
        useWhatsapp: !!referral.whatsapp_number
      });
      
      if (result?.success) {
        toast.success("Convite reenviado com sucesso!", {
          description: "Um novo convite foi enviado para o email indicado."
        });
        
        // Atualizar a lista de indicações
        refresh();
      } else {
        toast.error("Erro ao reenviar convite", {
          description: result?.message || "Houve um problema ao reenviar o convite."
        });
      }
    } catch (error: any) {
      console.error("Erro detalhado ao reenviar convite:", error);
      toast.error("Erro ao reenviar convite", {
        description: error.message || "Não foi possível reenviar o convite."
      });
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.map((referral) => (
            <TableRow key={referral.id}>
              <TableCell className="font-medium">{referral.email}</TableCell>
              <TableCell>{getTypeLabel(referral.type)}</TableCell>
              <TableCell>{getStatusBadge(referral.status)}</TableCell>
              <TableCell>{formatDate(referral.created_at)}</TableCell>
              <TableCell className="text-right">
                {referral.status === "pending" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResend(referral)}
                          disabled={resendingId === referral.id}
                          className="flex items-center gap-1"
                        >
                          {resendingId === referral.id ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Reenviando...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Reenviar
                              {referral.send_attempts ? 
                                <span className="ml-1 text-xs text-muted-foreground flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {referral.send_attempts}
                                </span> : null
                              }
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      {referral.send_attempts ? (
                        <TooltipContent>
                          <p>Enviado {referral.send_attempts} {referral.send_attempts === 1 ? 'vez' : 'vezes'}</p>
                          {referral.last_sent_at && (
                            <p>Último envio: {formatDate(referral.last_sent_at)}</p>
                          )}
                        </TooltipContent>
                      ) : (
                        <TooltipContent>Reenviar convite</TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
