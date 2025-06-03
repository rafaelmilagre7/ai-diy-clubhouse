
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "./CircularProgress";
import { TrendingUp, Target, Clock, Award } from "lucide-react";

interface ProgressStatsProps {
  completionRate: number;
  totalSolutions: number;
  completedSolutions: number;
  averageTime: string;
  streak: number;
  className?: string;
}

export const ProgressStats = ({
  completionRate,
  totalSolutions,
  completedSolutions,
  averageTime,
  streak,
  className
}: ProgressStatsProps) => {
  const stats = [
    {
      title: "Taxa de Conclusão",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Soluções Ativas",
      value: `${completedSolutions}/${totalSolutions}`,
      icon: Target,
      color: "text-viverblue",
      bgColor: "bg-blue-50"
    },
    {
      title: "Tempo Médio",
      value: averageTime,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Sequência",
      value: `${streak} dias`,
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className={className}>
      {/* Main Progress Card */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <CardTitle>Progresso Geral</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <CircularProgress
            value={completionRate}
            size={120}
            strokeWidth={10}
            color="#0ABAB5"
          />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
