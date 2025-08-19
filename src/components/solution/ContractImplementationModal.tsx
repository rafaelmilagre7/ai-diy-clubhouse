import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCheck, Mail, Phone, Briefcase, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContractImplementationModalProps {
  isOpen: boolean;
  onClose: () => void;
  solutionTitle: string;
  solutionCategory: string;
  solutionId?: string;
}

export const ContractImplementationModal = ({ 
  isOpen, 
  onClose, 
  solutionTitle, 
  solutionCategory,
  solutionId 
}: ContractImplementationModalProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState(profile?.email || "");
  const [userPhone, setUserPhone] = useState("");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validação básica
      if (!userEmail || !profile?.name) {
        toast({
          title: "Erro",
          description: "Nome e email são obrigatórios",
          variant: "destructive",
        });
        return;
      }

      if (!solutionId) {
        toast({
          title: "Erro", 
          description: "ID da solução não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para envio
      const requestData = {
        solutionId,
        solutionTitle,
        solutionCategory,
        userName: profile.name,
        userEmail,
        userPhone: userPhone || ""
      };

      console.log("Enviando solicitação:", requestData);

      // Chamar edge function
      const { data, error } = await supabase.functions.invoke('process-implementation-request', {
        body: requestData
      });

      if (error) {
        console.error("Edge function error:", error);
        toast({
          title: "Erro ao processar solicitação",
          description: error.message || "Tente novamente em alguns minutos",
          variant: "destructive",
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "Solicitação enviada com sucesso! 🎉",
          description: data.message || "Nossa equipe entrará em contato em breve",
        });
        
        console.log("Solicitação processada:", {
          requestId: data.requestId,
          pipedrive: data.pipedrive,
          discord: data.discord
        });
        
        onClose();
      } else {
        toast({
          title: "Erro",
          description: data?.error || "Erro inesperado ao processar solicitação",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão e tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sincronizar dados quando profile mudar
  useEffect(() => {
    const fetchUserData = async () => {
      setUserEmail(profile?.email || "");
      
      // Buscar telefone do onboarding_final
      if (profile?.id) {
        try {
          const { data } = await supabase
            .from('onboarding_final')
            .select('personal_info')
            .eq('user_id', profile.id)
            .maybeSingle();
          
          const personalInfo = data?.personal_info || {};
          const phone = personalInfo.phone || "";
          setUserPhone(phone);
        } catch (error) {
          console.warn('Erro ao buscar telefone do onboarding:', error);
        }
      }
    };
    
    fetchUserData();
  }, [profile?.email, profile?.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-sm border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-white to-viverblue-light bg-clip-text text-transparent">
            Contratar Implementação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Dados do usuário */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-300">Seus dados:</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <UserCheck className="h-4 w-4 text-viverblue-light" />
                <div className="flex-1">
                  <p className="font-medium text-white">{profile?.name || "Nome não informado"}</p>
                  <p className="text-xs text-neutral-400">Nome completo</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Mail className="h-4 w-4 text-viverblue-light" />
                <div className="flex-1">
                  <Input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Seu email de contato"
                    className="bg-transparent border-none p-0 font-medium text-white placeholder:text-neutral-500 focus-visible:ring-0"
                  />
                  <p className="text-xs text-neutral-400">Email de contato</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Phone className="h-4 w-4 text-viverblue-light" />
                <div className="flex-1">
                  <Input
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="Seu telefone (com DDD)"
                    className="bg-transparent border-none p-0 font-medium text-white placeholder:text-neutral-500 focus-visible:ring-0"
                  />
                  <p className="text-xs text-neutral-400">Telefone</p>
                </div>
              </div>
            </div>
          </div>

          {/* Solução interessada */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-300">Solução de interesse:</h3>
            
            <div className="flex items-start gap-3 p-3 bg-viverblue/10 rounded-lg border border-viverblue/20">
              <Briefcase className="h-4 w-4 text-viverblue-light mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-white">{solutionTitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-viverblue/20 text-viverblue-light border-viverblue/30">
                    {solutionCategory}
                  </Badge>
                </div>
              </div>
            </div>
          </div>


          {/* Botões de ação */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-neutral-600 text-neutral-300 hover:bg-neutral-800"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-viverblue to-viverblue-dark hover:from-viverblue-light hover:to-viverblue text-white border-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Quero Contratar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};