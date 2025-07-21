
import React from "react";
import { Module } from "@/lib/supabase";
import { Clock, Users, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SolutionCoverModuleProps {
  module: Module;
  onComplete: () => void;
}

export const SolutionCoverModule = ({ module, onComplete }: SolutionCoverModuleProps) => {
  const solutionData = module.content;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-viverblue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-viverblue-dark/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-viverblue/20 text-viverblue border-viverblue/30">
            Implementação de Solução
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-viverblue-light to-viverblue bg-clip-text text-transparent mb-6 leading-tight">
            {solutionData?.title || "Solução de IA"}
          </h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            {solutionData?.description || "Uma solução completa para transformar seu negócio com Inteligência Artificial"}
          </p>
        </div>

        {/* Solution Image */}
        {solutionData?.image_url && (
          <div className="relative mb-12 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-viverblue/20 to-viverblue-dark/20 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800/50 border border-white/10">
              <img 
                src={solutionData.image_url} 
                alt={solutionData?.title || "Solução"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        )}

        {/* Solution Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
            <Clock className="h-8 w-8 text-viverblue mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-white mb-1">
              {solutionData?.estimated_time || "2-4h"}
            </div>
            <div className="text-neutral-400 text-sm">Tempo Estimado</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
            <Users className="h-8 w-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-white mb-1">
              {solutionData?.difficulty || "Intermediário"}
            </div>
            <div className="text-neutral-400 text-sm">Nível de Dificuldade</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
            <Star className="h-8 w-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-white mb-1">
              {solutionData?.success_rate || "94%"}
            </div>
            <div className="text-neutral-400 text-sm">Taxa de Sucesso</div>
          </div>
        </div>

        {/* Overview */}
        {solutionData?.overview && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Visão Geral</h2>
            <div 
              className="text-neutral-200 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: solutionData.overview }}
            />
          </div>
        )}

        {/* What You'll Learn */}
        {solutionData?.learning_objectives && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6">O que você vai implementar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solutionData.learning_objectives.map((objective: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-viverblue/20 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-viverblue rounded-full" />
                  </div>
                  <span className="text-neutral-200">{objective}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={onComplete}
            size="lg"
            className="bg-gradient-to-r from-viverblue to-viverblue-dark hover:from-viverblue-dark hover:to-viverblue text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            Começar Implementação
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-neutral-400 text-sm mt-4">
            Vamos começar sua jornada de implementação de IA
          </p>
        </div>
      </div>
    </div>
  );
};
