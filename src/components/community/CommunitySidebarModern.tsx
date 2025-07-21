
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Star,
  Shield,
  Heart,
  Lightbulb,
  Target,
  Zap
} from "lucide-react";
import { useCommunityStats } from "@/hooks/community/useCommunityStats";
import { CreateTopicDialog } from "./CreateTopicDialog";
import { useState } from "react";

export const CommunitySidebarModern = () => {
  const { topicCount, activeUserCount, solvedCount, isLoading } = useCommunityStats();
  const [createTopicOpen, setCreateTopicOpen] = useState(false);

  const quickStats = [
    { icon: MessageSquare, label: "Tópicos", value: topicCount, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Users, label: "Membros Ativos", value: activeUserCount, color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: TrendingUp, label: "Resolvidos", value: solvedCount, color: "text-purple-600", bg: "bg-purple-50" }
  ];

  const communityGuidelines = [
    { icon: Heart, text: "Seja respeitoso e acolhedor", color: "text-red-500" },
    { icon: Lightbulb, text: "Compartilhe conhecimento útil", color: "text-yellow-500" },
    { icon: Target, text: "Use títulos claros e específicos", color: "text-blue-500" },
    { icon: Shield, text: "Mantenha discussões construtivas", color: "text-green-500" },
    { icon: Star, text: "Marque soluções quando encontrar", color: "text-purple-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Action Card */}
      <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <Button 
            onClick={() => setCreateTopicOpen(true)}
            className="w-full mb-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-semibold"
            size="lg"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Novo Tópico
          </Button>
          
          <p className="text-sm text-slate-600 text-center leading-relaxed">
            Compartilhe suas dúvidas, experiências e conhecimento com nossa comunidade.
          </p>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <Zap className="h-5 w-5 text-blue-500" />
            Estatísticas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.bg}`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{stat.label}</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/70 text-slate-700 font-semibold shadow-sm">
                      {stat.value}
                    </Badge>
                  </div>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>

      {/* Guidelines Card */}
      <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <Shield className="h-5 w-5 text-emerald-500" />
            Diretrizes da Comunidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {communityGuidelines.map((guideline, index) => {
            const Icon = guideline.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50/50 transition-colors duration-200">
                <Icon className={`h-4 w-4 mt-0.5 ${guideline.color}`} />
                <span className="text-sm text-slate-600 leading-relaxed">{guideline.text}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Community Support */}
      <Card className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-xl border-blue-200/50 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mb-3">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Precisa de Ajuda?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Nossa comunidade está aqui para apoiar você em sua jornada com IA.
            </p>
            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              Falar com Suporte
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateTopicDialog open={createTopicOpen} onOpenChange={setCreateTopicOpen} />
    </div>
  );
};
