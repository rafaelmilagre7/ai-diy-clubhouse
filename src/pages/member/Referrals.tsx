
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReferralStats } from "@/components/referrals/ReferralStats";
import { ReferralsList } from "@/components/referrals/ReferralsList";
import { ReferralDialog } from "@/components/referrals/ReferralDialog";
import { useReferrals } from "@/hooks/referrals/useReferrals";

const Referrals = () => {
  const { refresh } = useReferrals();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between bg-[#151823] p-4 rounded-lg border border-neutral-800 shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-white">Sistema de Indicações</h1>
          <p className="text-neutral-300 mt-1">
            Indique amigos para o Viver de IA e ganhe benefícios exclusivos
          </p>
        </div>
        <ReferralDialog onSuccess={refresh} />
      </div>

      <ReferralStats />

      <Tabs defaultValue="indicacoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="indicacoes">Suas Indicações</TabsTrigger>
          <TabsTrigger value="beneficios">Benefícios</TabsTrigger>
          <TabsTrigger value="como-funciona">Como Funciona</TabsTrigger>
        </TabsList>
        
        <TabsContent value="indicacoes" className="space-y-4">
          <ReferralsList />
        </TabsContent>
        
        <TabsContent value="beneficios">
          <div className="p-6 border rounded-md bg-card">
            <h2 className="text-xl font-semibold mb-4">Benefícios do Programa de Indicação</h2>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-muted/50">
                <h3 className="font-medium text-lg">Para cada indicação concluída:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Extensão de 7 dias em sua assinatura do Club</li>
                  <li>Acesso a conteúdos exclusivos</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-md bg-muted/50">
                <h3 className="font-medium text-lg">Para 5 indicações concluídas:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Um mês grátis de assinatura do Club</li>
                  <li>Badge exclusivo de "Embaixador" em seu perfil</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-md bg-muted/50">
                <h3 className="font-medium text-lg">Para 10 indicações concluídas:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Consultoria individual de 30 minutos com especialistas</li>
                  <li>Desconto de 30% na renovação anual</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="como-funciona">
          <div className="p-6 border rounded-md bg-card">
            <h2 className="text-xl font-semibold mb-4">Como Funciona o Programa de Indicação</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Indique um amigo</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clique no botão "Indicar Amigo" e preencha o email da pessoa que deseja convidar.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Seu amigo recebe um convite</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enviaremos um email personalizado com seu convite e um link exclusivo para seu amigo.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Cadastro e ativação</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Quando seu amigo se cadastrar e ativar sua conta, sua indicação será contabilizada como concluída.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-medium">Ganhe benefícios</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Para cada indicação concluída, você ganhará benefícios exclusivos na plataforma.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Referrals;
