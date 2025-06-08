
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalizedMessage } from '../PersonalizedMessage';
import { Target, GraduationCap, Clock, Sparkles, TrendingUp } from 'lucide-react';

interface ImplementationTrail {
  priority1: Array<{
    solutionId: string;
    justification: string;
    aiScore?: number;
    estimatedTime?: string;
  }>;
  priority2: Array<{
    solutionId: string;
    justification: string;
    aiScore?: number;
    estimatedTime?: string;
  }>;
  priority3: Array<{
    solutionId: string;
    justification: string;
    aiScore?: number;
    estimatedTime?: string;
  }>;
  recommended_lessons?: Array<{
    lessonId: string;
    moduleId: string;
    courseId: string;
    title: string;
    justification: string;
    priority: number;
  }>;
  ai_message?: string;
  generated_at: string;
}

interface OverviewTabProps {
  trail: ImplementationTrail;
}

export const OverviewTab = ({ trail }: OverviewTabProps) => {
  const totalSolutions = trail.priority1.length + trail.priority2.length + trail.priority3.length;
  const totalLessons = trail.recommended_lessons?.length || 0;
  
  const stats = [
    {
      title: "Soluções Recomendadas",
      value: totalSolutions,
      icon: Target,
      color: "text-viverblue",
      bgColor: "bg-viverblue/10"
    },
    {
      title: "Aulas Selecionadas",
      value: totalLessons,
      icon: GraduationCap,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Alta Prioridade",
      value: trail.priority1.length,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Mensagem personalizada da IA */}
      {trail.ai_message && (
        <div className="animate-fade-in">
          <PersonalizedMessage message={trail.ai_message} />
        </div>
      )}

      {/* Estatísticas resumidas */}
      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold text-high-contrast mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-viverblue" />
          Resumo da Sua Trilha
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title}
              className="glass-dark border border-neutral-700/50 hover:border-viverblue/50 transition-all duration-300 group"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-high-contrast group-hover:text-white transition-colors">
                      {stat.value}
                    </p>
                    <p className="text-sm text-medium-contrast">
                      {stat.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Distribuição por prioridade */}
      <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
        <Card className="glass-dark border border-neutral-700/50">
          <CardHeader>
            <CardTitle className="text-high-contrast flex items-center gap-2">
              <Target className="h-5 w-5 text-viverblue" />
              Distribuição por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-high-contrast font-medium">Prioridade 1 - Alta</span>
                </div>
                <span className="text-green-400 font-bold">{trail.priority1.length} soluções</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-high-contrast font-medium">Prioridade 2 - Média</span>
                </div>
                <span className="text-blue-400 font-bold">{trail.priority2.length} soluções</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-high-contrast font-medium">Prioridade 3 - Baixa</span>
                </div>
                <span className="text-purple-400 font-bold">{trail.priority3.length} soluções</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos passos */}
      <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
        <Card className="glass-dark border border-viverblue/40 bg-viverblue/5">
          <CardHeader>
            <CardTitle className="text-high-contrast flex items-center gap-2">
              <Clock className="h-5 w-5 text-viverblue" />
              Próximos Passos Recomendados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-medium-contrast">
              <p>📋 Comece pelas soluções de <strong className="text-green-400">Prioridade 1</strong> para resultados imediatos</p>
              <p>🎓 Estude as aulas recomendadas para fortalecer sua base de conhecimento</p>
              <p>🚀 Avance gradualmente pelas prioridades 2 e 3 conforme sua evolução</p>
              <p>💡 Revisitar esta trilha periodicamente para ajustes baseados em seu progresso</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
