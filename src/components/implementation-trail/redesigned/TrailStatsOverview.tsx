
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Award, 
  Zap,
  BookOpen,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface TrailStatsOverviewProps {
  stats: {
    totalItems: number;
    avgCompletionTime: number;
    successRate: number;
    activeUsers: number;
    totalSolutions: number;
    totalLessons: number;
    userProgress: number;
    streak: number;
  };
}

export const TrailStatsOverview: React.FC<TrailStatsOverviewProps> = ({ stats }) => {
  const overviewCards = [
    {
      icon: Target,
      label: "Itens na Trilha",
      value: stats.totalItems,
      suffix: "itens",
      color: "text-viverblue",
      bg: "bg-viverblue/10"
    },
    {
      icon: BookOpen,
      label: "Soluções",
      value: stats.totalSolutions,
      suffix: "soluções",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      icon: Clock,
      label: "Aulas",
      value: stats.totalLessons,
      suffix: "aulas",
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    },
    {
      icon: TrendingUp,
      label: "Seu Progresso",
      value: stats.userProgress,
      suffix: "%",
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    }
  ];

  const performanceCards = [
    {
      icon: CheckCircle,
      label: "Taxa de Sucesso",
      value: `${stats.successRate}%`,
      description: "dos usuários completam a trilha",
      color: "text-emerald-400"
    },
    {
      icon: Clock,
      label: "Tempo Médio",
      value: `${stats.avgCompletionTime}h`,
      description: "para completar a trilha",
      color: "text-blue-400"
    },
    {
      icon: Users,
      label: "Usuários Ativos",
      value: stats.activeUsers.toLocaleString(),
      description: "implementando IA atualmente",
      color: "text-purple-400"
    },
    {
      icon: Award,
      label: "Sua Sequência",
      value: `${stats.streak} dias`,
      description: "mantendo o foco",
      color: "text-amber-400"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-gray-800 bg-gray-900/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className={`inline-flex p-2 rounded-lg mb-2 ${card.bg}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div className="space-y-1">
                  <div className={`text-lg font-bold ${card.color}`}>
                    {card.value}
                    <span className="text-xs ml-1 text-gray-400">{card.suffix}</span>
                  </div>
                  <div className="text-xs text-gray-400">{card.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Performance insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gray-800 bg-gray-900/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-viverblue" />
              <h3 className="font-semibold text-white">Insights da Plataforma</h3>
              <Badge className="bg-viverblue/20 text-viverblue border-viverblue/30">
                Em tempo real
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceCards.map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center space-y-2"
                >
                  <card.icon className={`h-6 w-6 mx-auto ${card.color}`} />
                  <div className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </div>
                  <div className="text-sm font-medium text-white">
                    {card.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {card.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Motivational element */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-viverblue/30 bg-gradient-to-r from-viverblue/10 to-emerald-400/10 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-viverblue" />
              <span className="font-semibold text-viverblue">Dica do Dia</span>
            </div>
            <p className="text-gray-300">
              {stats.userProgress < 25 
                ? "Comece pequeno! Implemente uma solução simples primeiro para ganhar confiança."
                : stats.userProgress < 50
                ? "Você está progredindo bem! Continue focado nas soluções de alta prioridade."
                : stats.userProgress < 75
                ? "Excelente progresso! Considere compartilhar seus resultados com a comunidade."
                : "Parabéns! Você está quase completando sua trilha. Que tal ajudar outros membros?"
              }
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
