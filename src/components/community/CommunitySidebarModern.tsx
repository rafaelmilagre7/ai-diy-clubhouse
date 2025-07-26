
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, MessageSquare, TrendingUp, Star, Award, Calendar, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useCommunityStats } from "@/hooks/community/useCommunityStats";
import { CreateTopicDialog } from "./CreateTopicDialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export const CommunitySidebarModern = () => {
  const { topicCount, activeUserCount, solvedCount, isLoading } = useCommunityStats();
  const [createTopicOpen, setCreateTopicOpen] = useState(false);

  const quickStats = [
    {
      icon: MessageSquare,
      label: "Tópicos",
      value: topicCount,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: Users,
      label: "Membros",
      value: activeUserCount,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      icon: Award,
      label: "Resolvidos",
      value: solvedCount,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  const communityGuidelines = [
    "💎 Seja respeitoso e construtivo",
    "🎯 Use títulos claros e descritivos",
    "🔍 Busque antes de perguntar",
    "🚀 Compartilhe experiências práticas",
    "✅ Marque soluções quando encontrar"
  ];

  return (
    <div className="space-y-6">
      {/* Quick Action Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <Card className="relative bg-background/80 backdrop-blur-xl border-border/50 hover:border-border/80 transition-all">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl mx-auto w-fit">
                <Star className="h-8 w-8 text-primary" />
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Compartilhe suas Ideias</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Inicie uma discussão e conecte-se com a comunidade
                </p>
              </div>
              
              <Button 
                onClick={() => setCreateTopicOpen(true)}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Novo Tópico
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-background/80 backdrop-blur-xl border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : (
              <>
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-background/50 to-muted/20 hover:from-background/80 hover:to-muted/40 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <span className="font-medium text-sm">{stat.label}</span>
                      </div>
                      <Badge variant="secondary" className="font-bold">
                        {stat.value}
                      </Badge>
                    </motion.div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Community Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-background/80 backdrop-blur-xl border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Diretrizes da Comunidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {communityGuidelines.map((guideline, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/30"
                >
                  <span className="text-base leading-none">{guideline.split(' ')[0]}</span>
                  <span className="leading-relaxed">{guideline.split(' ').slice(1).join(' ')}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Events Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-xl border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="p-3 bg-primary/10 rounded-xl mb-3 mx-auto w-fit">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Fique atento aos próximos eventos da comunidade
              </p>
              <Button variant="outline" size="sm" className="text-xs">
                Ver Agenda
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <CreateTopicDialog open={createTopicOpen} onOpenChange={setCreateTopicOpen} />
    </div>
  );
};
