
import React from "react";
import { useParams, Link } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, CheckCircle2, Clock, Target, Users } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { PageTransition } from "@/components/transitions/PageTransition";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { solution, loading, error } = useSolutionData(id);

  if (loading) {
    return <LoadingScreen message="Carregando detalhes da solução..." />;
  }

  if (error || !solution) {
    return <SolutionNotFound />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/solutions" 
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar às Soluções
            </Link>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-200 p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-neutral-800 mb-4">
                    {solution.title}
                  </h1>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge variant="secondary" className="bg-viverblue/10 text-viverblue border-viverblue/20">
                      {solution.category}
                    </Badge>
                    <Badge variant="outline" className="border-neutral-300">
                      {solution.difficulty}
                    </Badge>
                    {solution.estimated_time && (
                      <div className="flex items-center gap-1 text-sm text-neutral-600">
                        <Clock className="w-4 h-4" />
                        {solution.estimated_time}
                      </div>
                    )}
                  </div>
                  
                  {solution.overview && (
                    <p className="text-neutral-600 leading-relaxed">
                      {solution.overview}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  <Link to={`/implement/${solution.id}`}>
                    <Button 
                      size="lg" 
                      className="w-full bg-viverblue hover:bg-viverblue-dark text-white flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Implementar Solução
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="grid gap-6">
            {/* Overview Section */}
            {solution.overview && (
              <Card className="bg-white/95 backdrop-blur-sm border-neutral-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neutral-800">
                    <Target className="w-5 h-5 text-viverblue" />
                    Visão Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 leading-relaxed">
                    {solution.overview}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Implementation Preview */}
            {solution.implementation_steps && (
              <Card className="bg-white/95 backdrop-blur-sm border-neutral-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neutral-800">
                    <CheckCircle2 className="w-5 h-5 text-viverblue" />
                    Passos de Implementação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(typeof solution.implementation_steps === 'string' 
                      ? JSON.parse(solution.implementation_steps) 
                      : solution.implementation_steps
                    ).slice(0, 3).map((step: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                        <div className="w-6 h-6 bg-viverblue/20 text-viverblue rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-800">{step.title}</h4>
                          {step.description && (
                            <p className="text-sm text-neutral-600 mt-1">{step.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(typeof solution.implementation_steps === 'string' 
                      ? JSON.parse(solution.implementation_steps) 
                      : solution.implementation_steps
                    ).length > 3 && (
                      <div className="text-center pt-4">
                        <Link to={`/implement/${solution.id}`}>
                          <Button variant="outline" className="text-viverblue border-viverblue hover:bg-viverblue/5">
                            Ver todos os {(typeof solution.implementation_steps === 'string' 
                              ? JSON.parse(solution.implementation_steps) 
                              : solution.implementation_steps
                            ).length} passos
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Section */}
            <Card className="bg-gradient-to-br from-viverblue/5 to-viverblue-dark/5 border-viverblue/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-viverblue" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">
                  Pronto para começar?
                </h3>
                <p className="text-neutral-600 mb-6">
                  Implemente esta solução com nosso guia interativo passo a passo
                </p>
                <Link to={`/implement/${solution.id}`}>
                  <Button 
                    size="lg" 
                    className="bg-viverblue hover:bg-viverblue-dark text-white"
                  >
                    Começar Implementação
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SolutionDetails;
