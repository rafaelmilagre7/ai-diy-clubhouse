
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const CommunityHero = () => {
  const { data: onlineCount } = useQuery({
    queryKey: ['onlineMembers'],
    queryFn: async () => {
      // Simulação de membros online - pode ser substituído por dados reais
      return Math.floor(Math.random() * 50) + 10;
    },
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  });

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      {/* Background Aurora */}
      <div className="absolute inset-0 bg-gradient-to-br from-viverblue/20 via-aurora/10 to-revenue/20 opacity-80"></div>
      <div className="absolute -inset-10 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-viverblue/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-revenue/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-operational/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge com membros online */}
          <div className="flex items-center justify-center mb-6 animate-fade-in">
            <Badge variant="secondary" className="px-4 py-2 bg-white/10 backdrop-blur-sm border-white/20 text-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Users className="h-4 w-4" />
                <span>{onlineCount || 0} membros online</span>
              </div>
            </Badge>
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="bg-gradient-to-r from-viverblue via-revenue to-operational bg-clip-text text-transparent">
              Comunidade
            </span>
            <br />
            <span className="text-foreground">VIVER DE IA</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Conecte-se, compartilhe conhecimento e transforme sua jornada em IA junto com outros empreendedores
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" className="bg-viverblue hover:bg-viverblue-dark text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <Link to="/comunidade/novo-topico" className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Criar Novo Tópico
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="border-2 border-viverblue/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-8 py-3 text-lg font-semibold">
              <Sparkles className="h-5 w-5 mr-2" />
              Explorar Categorias
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
