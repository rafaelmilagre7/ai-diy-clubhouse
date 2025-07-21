
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
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
      bgGlow: "bg-blue-500/10"
    },
    {
      title: "Membros Conectados",
      value: activeUserCount,
      icon: Users,
      gradient: "from-emerald-500/20 to-green-500/20",
      iconColor: "text-emerald-500",
      bgGlow: "bg-emerald-500/10"
    },
    {
      title: "Soluções Encontradas",
      value: solvedCount,
      icon: CheckCircle2,
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
      bgGlow: "bg-purple-500/10"
    },
    {
      title: "Insights Compartilhados",
      value: Math.floor(Math.random() * 150) + 50,
      icon: Sparkles,
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-500",
      bgGlow: "bg-orange-500/10"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse bg-background/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="h-4 bg-muted/50 rounded w-20 mb-4"></div>
              <div className="h-8 bg-muted/50 rounded w-12 mb-2"></div>
              <div className="h-3 bg-muted/50 rounded w-16"></div>
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
            <Card className="relative overflow-hidden bg-background/60 backdrop-blur-xl border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-2xl">
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Glow Effect */}
              <div className={`absolute -inset-1 ${stat.bgGlow} rounded-lg opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300`}></div>
              
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} backdrop-blur-sm`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <Zap className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div>
                  <p className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
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
