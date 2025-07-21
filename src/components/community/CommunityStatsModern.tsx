
import { useCommunityStats } from "@/hooks/community/useCommunityStats";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, TrendingUp, CheckCircle2, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

export const CommunityStatsModern = () => {
  const { topicCount, activeUserCount, solvedCount, isLoading } = useCommunityStats();

  const statCards = [
    {
      title: "Discussões Ativas",
      value: topicCount,
      icon: MessageSquare,
      gradient: "from-blue-400/30 to-cyan-400/30",
      iconColor: "text-blue-600",
      bgGlow: "bg-blue-400/20"
    },
    {
      title: "Membros Conectados",
      value: activeUserCount,
      icon: Users,
      gradient: "from-emerald-400/30 to-green-400/30",
      iconColor: "text-emerald-600",
      bgGlow: "bg-emerald-400/20"
    },
    {
      title: "Soluções Encontradas",
      value: solvedCount,
      icon: CheckCircle2,
      gradient: "from-purple-400/30 to-pink-400/30",
      iconColor: "text-purple-600",
      bgGlow: "bg-purple-400/20"
    },
    {
      title: "Insights Compartilhados",
      value: Math.floor(Math.random() * 150) + 50,
      icon: Sparkles,
      gradient: "from-orange-400/30 to-red-400/30",
      iconColor: "text-orange-600",
      bgGlow: "bg-orange-400/20"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="h-4 bg-slate-200 rounded w-20 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-12 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-slate-200/50 hover:border-slate-300/70 transition-all duration-300 hover:shadow-2xl shadow-lg">
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Glow Effect */}
              <div className={`absolute -inset-1 ${stat.bgGlow} rounded-lg opacity-0 group-hover:opacity-30 blur-xl transition-all duration-300`}></div>
              
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} backdrop-blur-sm border border-white/20`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <Zap className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div>
                  <p className="text-2xl font-bold text-slate-800 mb-1 group-hover:text-slate-900 transition-colors">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
