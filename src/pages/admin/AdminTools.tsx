
import React, { useState } from "react";
import { useTools } from "@/hooks/useTools";
import { AdminToolList } from "@/components/admin/tools/AdminToolList";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Wrench, TrendingUp, Package, Gift } from "lucide-react";

const AdminTools = () => {
  const { tools, isLoading, error, refetch } = useTools();
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleRefresh = async () => {
    setRefreshCounter(prev => prev + 1);
    await refetch();
  };

  // Calculate stats
  const totalTools = tools.length;
  const activeTools = tools.filter(t => t.status).length;
  const inactiveTools = tools.filter(t => !t.status).length;
  const toolsWithBenefits = tools.filter(t => t.has_member_benefit).length;
  const averageClicks = totalTools > 0 ? tools.reduce((sum, t) => sum + (t.benefit_clicks || 0), 0) / totalTools : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-blue-500/5 p-6 space-y-8 relative overflow-hidden">
        {/* Aurora Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/8 to-cyan-500/4 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-60 right-20 w-96 h-96 bg-gradient-to-br from-purple-500/6 to-pink-500/3 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-indigo-500/4 to-aurora/3 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Loading Header */}
        <div className="aurora-glass rounded-2xl border border-blue-500/20 backdrop-blur-md animate-pulse">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/5 p-8 border-b border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl"></div>
              <div className="space-y-3 flex-1">
                <div className="w-80 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 rounded-lg"></div>
                <div className="w-96 h-5 bg-gradient-to-r from-blue-500/15 to-cyan-500/8 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aurora-glass rounded-2xl border border-blue-500/20 backdrop-blur-md animate-pulse">
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/5 p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-xl"></div>
                  <div className="w-16 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 rounded-lg"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="w-32 h-3 bg-gradient-to-r from-blue-500/15 to-cyan-500/8 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Content */}
        <div className="aurora-glass rounded-2xl border border-blue-500/20 backdrop-blur-md p-8">
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 aurora-glass rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
              <div className="absolute inset-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-full aurora-pulse"></div>
            </div>
            <div className="ml-6">
              <h3 className="text-2xl font-semibold aurora-text-gradient mb-2">Carregando Ferramentas</h3>
              <p className="text-muted-foreground text-lg">Preparando painel de gestão completo...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-destructive/5 p-6 space-y-8 relative overflow-hidden">
        {/* Aurora Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-destructive/8 to-red-500/4 rounded-full blur-3xl animate-blob"></div>
        </div>

        <div className="aurora-glass rounded-2xl border border-destructive/20 backdrop-blur-md overflow-hidden">
          <div className="bg-gradient-to-r from-destructive/15 via-red-500/10 to-transparent p-8 border-b border-destructive/20">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-destructive/25 to-red-500/15 aurora-glass">
                <Wrench className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-destructive mb-2">Erro ao Carregar Ferramentas</h1>
                <p className="text-muted-foreground text-lg">{error.message}</p>
              </div>
            </div>
          </div>
          <div className="p-8 text-center">
            <Button 
              onClick={handleRefresh}
              className="bg-gradient-to-r from-destructive to-red-500 hover:from-destructive-dark hover:to-red-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-blue-500/5 p-6 space-y-8 relative overflow-hidden">
      {/* Aurora Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/8 to-cyan-500/4 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-60 right-20 w-96 h-96 bg-gradient-to-br from-purple-500/6 to-pink-500/3 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-indigo-500/4 to-aurora/3 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Enhanced Header with Aurora Style */}
      <div className="relative aurora-glass rounded-2xl p-8 border border-blue-500/20 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-16 bg-gradient-to-b from-blue-500 via-cyan-500 to-purple-500 rounded-full aurora-glow"></div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 aurora-glass">
                    <Wrench className="h-6 w-6 text-blue-500" />
                  </div>
                  <h1 className="text-4xl font-bold aurora-text-gradient">
                    Gestão de Ferramentas
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground font-medium">
                  Painel completo para gerenciar ferramentas, benefícios e parcerias
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="h-12 px-6 aurora-glass border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-500 font-medium backdrop-blur-sm"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
        
        {/* Enhanced Quick Stats */}
        <div className="flex gap-6 mt-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full aurora-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {totalTools} Ferramentas Total
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full aurora-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {activeTools} Ativas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full aurora-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {toolsWithBenefits} Com Benefícios
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full aurora-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">
              Performance Ativa
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          {
            label: "Total de Ferramentas",
            value: totalTools,
            icon: Package,
            gradient: "from-blue-500/20 to-cyan-500/10",
            iconColor: "text-blue-500",
            border: "border-blue-500/30",
            description: "Ferramentas cadastradas"
          },
          {
            label: "Ferramentas Ativas",
            value: activeTools,
            icon: TrendingUp,
            gradient: "from-green-500/20 to-emerald-500/10",
            iconColor: "text-green-500",
            border: "border-green-500/30",
            description: "Disponíveis para membros"
          },
          {
            label: "Ferramentas Inativas", 
            value: inactiveTools,
            icon: RefreshCcw,
            gradient: "from-gray-500/20 to-slate-500/10",
            iconColor: "text-gray-500",
            border: "border-gray-500/30",
            description: "Aguardando ativação"
          },
          {
            label: "Com Benefícios",
            value: toolsWithBenefits,
            icon: Gift,
            gradient: "from-purple-500/20 to-pink-500/10",
            iconColor: "text-purple-500",
            border: "border-purple-500/30",
            description: "Ofertas exclusivas"
          },
          {
            label: "Cliques Médios",
            value: averageClicks.toFixed(1),
            icon: TrendingUp,
            gradient: "from-orange-500/20 to-amber-500/10",
            iconColor: "text-orange-500",
            border: "border-orange-500/30",
            description: "Por ferramenta"
          }
        ].map((stat, index) => (
          <div 
            key={stat.label} 
            className={`aurora-glass rounded-2xl border ${stat.border} backdrop-blur-md overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`bg-gradient-to-r ${stat.gradient} p-6 border-b border-white/10`}>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl aurora-glass bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold aurora-text-gradient group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="font-medium text-foreground group-hover:text-foreground transition-colors duration-300 mb-1">
                {stat.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Tools List */}
      <AdminToolList tools={tools} refreshTrigger={refreshCounter} />
    </div>
  );
};

export default AdminTools;
