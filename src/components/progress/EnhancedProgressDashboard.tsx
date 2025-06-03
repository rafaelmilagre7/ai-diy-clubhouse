
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressStats } from "./ProgressStats";
import { ProgressTimeline } from "./ProgressTimeline";
import { CircularProgress } from "./CircularProgress";
import { useProgressData } from "@/hooks/useProgressData";
import { Activity, TrendingUp } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";

export const EnhancedProgressDashboard = () => {
  const progressData = useProgressData();

  if (progressData.isLoading) {
    return <LoadingScreen message="Carregando dados de progresso..." />;
  }

  if (progressData.error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-500">Erro ao carregar dados de progresso</p>
          <p className="text-sm text-gray-500 mt-2">{progressData.error}</p>
        </CardContent>
      </Card>
    );
  }

  const timelineItems = progressData.recentActivity.map(activity => ({
    id: activity.id,
    title: activity.title,
    description: `Implementação de solução - ${activity.type}`,
    status: activity.status,
    timestamp: activity.timestamp,
    estimatedTime: "2-3h"
  }));

  return (
    <div className="space-y-6">
      {/* Header com animação */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Acompanhamento de Progresso
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitore seu crescimento e conquistas na implementação de IA
          </p>
        </div>
        <TrendingUp className="w-8 h-8 text-viverblue" />
      </motion.div>

      {/* Stats principais */}
      <ProgressStats
        completionRate={progressData.completionRate}
        totalSolutions={progressData.totalSolutions}
        completedSolutions={progressData.completedSolutions}
        averageTime={progressData.averageTime}
        streak={progressData.streak}
      />

      {/* Timeline e atividade recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timelineItems.length > 0 ? (
              <ProgressTimeline items={timelineItems} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma atividade recente</p>
                <p className="text-sm text-gray-400 mt-1">
                  Comece uma implementação para ver seu progresso aqui
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progresso Semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso Semanal</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-8">
            <div className="text-center space-y-4">
              <CircularProgress
                value={75}
                size={100}
                color="#0ABAB5"
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-viverblue">75%</div>
                  <div className="text-xs text-gray-500">Meta Semanal</div>
                </div>
              </CircularProgress>
              <p className="text-sm text-gray-600">
                Você está quase alcançando sua meta desta semana!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Insights do seu Progresso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                🎯 Foco Consistente
              </h4>
              <p className="text-sm text-green-700 dark:text-green-400">
                Você mantém uma sequência de {progressData.streak} dias. Continue assim!
              </p>
            </motion.div>

            <motion.div
              className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                📈 Progresso Acelerado
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Seu tempo médio de implementação está 20% melhor que a média.
              </p>
            </motion.div>

            <motion.div
              className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
                🚀 Próximo Nível
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                Complete mais 2 soluções para desbloquear o nível Expert.
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
