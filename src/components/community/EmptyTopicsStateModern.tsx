
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, PlusCircle, Users, Search } from "lucide-react";
import { CreateTopicDialog } from "./CreateTopicDialog";
import { useState } from "react";
import { motion } from "framer-motion";

interface EmptyTopicsStateModernProps {
  searchQuery: string;
}

export const EmptyTopicsStateModern = ({ searchQuery }: EmptyTopicsStateModernProps) => {
  const [createTopicOpen, setCreateTopicOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden bg-background/60 backdrop-blur-xl border-border/50 p-12 text-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4 w-8 h-8 border-2 border-primary rounded-full"></div>
          <div className="absolute top-8 right-8 w-4 h-4 bg-accent rounded-full"></div>
          <div className="absolute bottom-8 left-8 w-6 h-6 border border-secondary rounded-square rotate-45"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-muted rounded-full"></div>
        </div>

        <div className="relative z-10">
          {searchQuery ? (
            <>
              {/* Search Empty State */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-3xl mx-auto w-fit mb-6"
              >
                <Search className="h-16 w-16 text-muted-foreground mx-auto" />
              </motion.div>
              
              <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Nenhum resultado encontrado
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                Não encontramos discussões com <strong>"{searchQuery}"</strong>. 
                Tente termos diferentes ou inicie uma nova discussão sobre este tópico.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="hover:bg-muted/50"
                >
                  Limpar Busca
                </Button>
                <Button 
                  onClick={() => setCreateTopicOpen(true)}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Criar Discussão
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* General Empty State */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative mb-8"
              >
                <div className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl mx-auto w-fit">
                  <MessageSquare className="h-20 w-20 text-primary mx-auto mb-4" />
                  <div className="flex justify-center gap-2">
                    <Users className="h-6 w-6 text-accent animate-pulse" />
                    <MessageSquare className="h-6 w-6 text-primary animate-pulse animation-delay-1000" />
                  </div>
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Seja o Primeiro a Participar!
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                Esta categoria ainda não tem discussões. Que tal começar uma conversa interessante 
                e dar vida a esta comunidade?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setCreateTopicOpen(true)}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Iniciar Primeira Discussão
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="hover:bg-muted/50"
                  onClick={() => window.history.back()}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Explorar Outras Categorias
                </Button>
              </div>
              
              {/* Encouraging Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto">
                <div className="text-center">
                  <div className="p-3 bg-operational/10 rounded-xl mb-2 mx-auto w-fit">
                    <Users className="h-5 w-5 text-operational" />
                  </div>
                  <p className="text-2xl font-bold text-operational">50+</p>
                  <p className="text-xs text-muted-foreground">Membros Ativos</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-success/10 rounded-xl mb-2 mx-auto w-fit">
                    <MessageSquare className="h-5 w-5 text-success" />
                  </div>
                  <p className="text-2xl font-bold text-success">100+</p>
                  <p className="text-xs text-muted-foreground">Discussões</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-strategy/10 rounded-xl mb-2 mx-auto w-fit">
                    <MessageSquare className="h-5 w-5 text-strategy" />
                  </div>
                  <p className="text-2xl font-bold text-strategy">24h</p>
                  <p className="text-xs text-muted-foreground">Resposta Média</p>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      <CreateTopicDialog open={createTopicOpen} onOpenChange={setCreateTopicOpen} />
    </motion.div>
  );
};
