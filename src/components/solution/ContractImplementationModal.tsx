import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, UserCheck, Mail, Phone, Briefcase, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Badge } from "@/components/ui/badge";

interface ContractImplementationModalProps {
  isOpen: boolean;
  onClose: () => void;
  solutionTitle: string;
  solutionCategory: string;
}

export const ContractImplementationModal = ({ 
  isOpen, 
  onClose, 
  solutionTitle, 
  solutionCategory 
}: ContractImplementationModalProps) => {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Aqui iremos implementar a integração com Pipedrive e Discord
      console.log("Solicitação de contratação enviada:", {
        userName: profile?.name,
        userEmail: profile?.email,
        userPhone: "N/A", // Por enquanto, até implementarmos campo de telefone
        solutionTitle,
        solutionCategory
      });
      
      // TODO: Implementar chamada para edge function
      
      // Simular delay por enquanto
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onClose();
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm border border-white/10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-white to-viverblue-light bg-clip-text text-transparent">
              Contratar Implementação
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dados do usuário */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-300">Seus dados:</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <UserCheck className="h-4 w-4 text-viverblue-light" />
                <div>
                  <p className="font-medium text-white">{profile?.name || "Nome não informado"}</p>
                  <p className="text-xs text-neutral-400">Nome completo</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Mail className="h-4 w-4 text-viverblue-light" />
                <div>
                  <p className="font-medium text-white">{profile?.email || "Email não informado"}</p>
                  <p className="text-xs text-neutral-400">Email de contato</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Phone className="h-4 w-4 text-viverblue-light" />
                <div>
                  <p className="font-medium text-white">Será solicitado no contato</p>
                  <p className="text-xs text-neutral-400">Telefone</p>
                </div>
              </div>
            </div>
          </div>

          {/* Solução interessada */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-neutral-300">Solução de interesse:</h3>
            
            <div className="flex items-start gap-3 p-3 bg-viverblue/10 rounded-lg border border-viverblue/20">
              <Briefcase className="h-4 w-4 text-viverblue-light mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-white">{solutionTitle}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs bg-viverblue/20 text-viverblue-light border-viverblue/30">
                    {solutionCategory}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Informação sobre o processo */}
          <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700">
            <p className="text-sm text-neutral-300">
              Ao confirmar, nossa equipe entrará em contato em até 24 horas para entender suas necessidades 
              e apresentar uma proposta personalizada de implementação.
            </p>
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