
import React, { useState } from "react";
import { Module } from "@/lib/supabase";
import { Trophy, Download, Share2, ArrowRight, CheckCircle, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import confetti from 'canvas-confetti';
import { useEffect } from "react";

interface CompletionModuleProps {
  module: Module;
  onComplete: () => void;
}

export const CompletionModule = ({ module, onComplete }: CompletionModuleProps) => {
  const [showCelebration, setShowCelebration] = useState(false);
  
  useEffect(() => {
    // Trigger celebration animation
    setShowCelebration(true);
    
    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  const solutionData = module.content;
  const implementationDate = new Date().toLocaleDateString('pt-BR');

  const handleDownloadCertificate = () => {
    // TODO: Implement certificate generation
    console.log("Gerando certificado...");
  };

  const handleShareSuccess = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Implementei uma solução de IA!',
        text: `Acabei de implementar com sucesso: ${solutionData?.title}`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-viverblue/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Celebration Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${showCelebration ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 rounded-full mb-6 animate-bounce">
            <Trophy className="h-12 w-12 text-yellow-400" />
          </div>
          
          <div className="space-y-4">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-lg px-4 py-2">
              <CheckCircle className="h-5 w-5 mr-2" />
              Implementação Concluída
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-viverblue bg-clip-text text-transparent mb-6 leading-tight">
              Parabéns! 🎉
            </h1>
            
            <p className="text-2xl text-white mb-4">
              Você implementou com sucesso:
            </p>
            
            <h2 className="text-3xl md:text-4xl font-bold text-viverblue-light">
              {solutionData?.title || "Sua Solução de IA"}
            </h2>
          </div>
        </div>

        {/* Implementation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-white mb-1">100%</div>
            <div className="text-neutral-400 text-sm">Implementação Completa</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
            <Clock className="h-8 w-8 text-viverblue mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-white mb-1">{implementationDate}</div>
            <div className="text-neutral-400 text-sm">Data de Conclusão</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
            <Target className="h-8 w-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-white mb-1">Novo</div>
            <div className="text-neutral-400 text-sm">Nível Desbloqueado</div>
          </div>
        </div>

        {/* Achievement Section */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-8 mb-12">
          <div className="text-center">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">
              Conquista Desbloqueada!
            </h3>
            <p className="text-yellow-300 mb-6">
              Você ganhou o badge de "Implementador de IA" por concluir sua primeira solução completa.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-lg px-4 py-2">
                🏆 Implementador de IA
              </Badge>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-lg px-4 py-2">
                ✅ Primeira Implementação
              </Badge>
              <Badge className="bg-viverblue/20 text-viverblue border-viverblue/30 text-lg px-4 py-2">
                🚀 Inovador
              </Badge>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">Próximos Passos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-viverblue-light">Continue Aprendendo</h4>
              <ul className="space-y-2 text-neutral-300">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Explore outras soluções de IA</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Participe da comunidade</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Compartilhe sua experiência</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-viverblue-light">Otimize Seus Resultados</h4>
              <ul className="space-y-2 text-neutral-300">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Monitore o desempenho</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Colete feedback dos usuários</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Implemente melhorias</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleDownloadCertificate}
            size="lg"
            variant="outline"
            className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 px-8 py-3"
          >
            <Download className="h-5 w-5 mr-2" />
            Baixar Certificado
          </Button>
          
          <Button
            onClick={handleShareSuccess}
            size="lg"
            variant="outline"
            className="border-green-500/30 text-green-300 hover:bg-green-500/10 px-8 py-3"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Compartilhar Conquista
          </Button>
          
          <Button
            onClick={onComplete}
            size="lg"
            className="bg-gradient-to-r from-viverblue to-viverblue-dark hover:from-viverblue-dark hover:to-viverblue text-white px-8 py-3"
          >
            Explorar Mais Soluções
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
