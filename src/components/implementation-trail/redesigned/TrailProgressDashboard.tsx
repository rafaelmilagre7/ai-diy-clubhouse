
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Clock, BookOpen, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TrailProgressDashboardProps {
  totalSolutions: number;
  completedSolutions: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: number;
  currentStreak: number;
}

export const TrailProgressDashboard: React.FC<TrailProgressDashboardProps> = ({
  totalSolutions,
  completedSolutions,
  totalLessons,
  completedLessons,
  estimatedTime,
  currentStreak
}) => {
  const solutionProgress = totalSolutions > 0 ? (completedSolutions / totalSolutions) * 100 : 0;
  const lessonProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const overallProgress = ((solutionProgress + lessonProgress) / 2);

  const stats = [
    {
      icon: Target,
      label: "Soluções",
      value: `${completedSolutions}/${totalSolutions}`,
      progress: solutionProgress,
      color: "text-viverblue"
    },
    {
      icon: BookOpen,
      label: "Aulas",
      value: `${completedLessons}/${totalLessons}`,
      progress: lessonProgress,
      color: "text-emerald-400"
    },
    {
      icon: Clock,
      label: "Tempo Estimado",
      value: `${estimatedTime}h`,
      progress: 0,
      color: "text-purple-400"
    },
    {
      icon: Trophy,
      label: "Sequência",
      value: `${currentStreak} dias`,
      progress: 0,
      color: "text-amber-400"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              Seu Progresso
            </CardTitle>
            <Badge 
              className="bg-viverblue/20 text-viverblue border-viverblue/30"
              variant="outline"
            >
              {Math.round(overallProgress)}% Completo
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Progresso Geral</span>
              <span className="text-white font-medium">{Math.round(overallProgress)}%</span>
            </div>
            <Progress 
              value={overallProgress} 
              className="h-2 bg-gray-700"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="text-center space-y-2"
              >
                <div className={`inline-flex p-2 rounded-lg bg-gray-800/50 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
                {stat.progress > 0 && (
                  <Progress 
                    value={stat.progress} 
                    className="h-1 bg-gray-700"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Achievement Badges */}
          {overallProgress > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
              <span className="text-xs text-gray-400 w-full mb-2">Conquistas:</span>
              {overallProgress >= 25 && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Iniciante
                </Badge>
              )}
              {overallProgress >= 50 && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Target className="h-3 w-3 mr-1" />
                  Progredindo
                </Badge>
              )}
              {overallProgress >= 75 && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Trophy className="h-3 w-3 mr-1" />
                  Avançado
                </Badge>
              )}
              {overallProgress >= 100 && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Trophy className="h-3 w-3 mr-1" />
                  Mestre IA
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
