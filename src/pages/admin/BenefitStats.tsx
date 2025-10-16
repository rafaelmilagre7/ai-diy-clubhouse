
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Users, ArrowUpRight, Gift, BarChart3, RefreshCw, Plus, ExternalLink } from 'lucide-react';
import { BenefitActionsCell } from '@/components/admin/benefits/BenefitActionsCell';
import { Link } from 'react-router-dom';

interface BenefitStat {
  id: string;
  name: string;
  benefit_title: string;
  benefit_clicks: number;
  category: string;
}

const BenefitStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BenefitStat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalClicks, setTotalClicks] = useState(0);
  const [toolsWithBenefits, setToolsWithBenefits] = useState(0);
  
  useEffect(() => {
    fetchBenefitStats();
  }, []);
  
  const fetchBenefitStats = async () => {
    try {
      setLoading(true);
      
      // Buscar ferramentas com benefícios
      const { data, error } = await supabase
        .from('tools')
        .select('id, name, benefit_title, benefit_clicks, category')
        .eq('has_member_benefit', true)
        .order('benefit_clicks', { ascending: false });
      
      if (error) throw error;
      
      setStats(data || []);
      setToolsWithBenefits(data?.length || 0);
      
      // Calcular total de cliques
      const total = data?.reduce((sum, tool) => sum + (tool.benefit_clicks || 0), 0) || 0;
      setTotalClicks(total);
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas de benefícios:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredStats = stats.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.benefit_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const averageClicks = toolsWithBenefits > 0 ? (totalClicks / toolsWithBenefits) : 0;
  const topPerformer = stats[0];
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-success/5 p-6 space-y-8 relative overflow-hidden">
        {/* Aurora Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-success/8 to-success-light/4 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-60 right-20 w-96 h-96 bg-gradient-to-br from-aurora-primary/6 to-operational/3 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-purple-500/4 to-aurora/3 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Loading Header */}
        <div className="aurora-glass rounded-2xl border border-success/20 backdrop-blur-md animate-pulse">
          <div className="bg-gradient-to-r from-success/10 to-success-light/5 p-8 border-b border-success/20">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-success-light/10 rounded-2xl"></div>
              <div className="space-y-3 flex-1">
                <div className="w-80 h-8 bg-gradient-to-r from-success/20 to-success-light/10 rounded-lg"></div>
                <div className="w-96 h-5 bg-gradient-to-r from-success/15 to-success-light/8 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aurora-glass rounded-2xl border border-success/20 backdrop-blur-md animate-pulse">
              <div className="bg-gradient-to-r from-success/10 to-success-light/5 p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-success/20 to-success-light/10 rounded-xl"></div>
                  <div className="w-16 h-8 bg-gradient-to-r from-success/20 to-success-light/10 rounded-lg"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="w-32 h-3 bg-gradient-to-r from-success/15 to-success-light/8 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Content */}
        <div className="aurora-glass rounded-2xl border border-success/20 backdrop-blur-md p-8">
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 aurora-glass rounded-full border-4 border-success/30 border-t-success animate-spin"></div>
              <div className="absolute inset-3 bg-gradient-to-br from-success/20 to-success-light/10 rounded-full aurora-pulse"></div>
            </div>
            <div className="ml-6">
              <h3 className="text-2xl font-semibold aurora-text-gradient mb-2">Carregando Estatísticas de Benefícios</h3>
              <p className="text-muted-foreground text-lg">Analisando dados de parcerias e ofertas exclusivas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-success/5 p-6 space-y-8 relative overflow-hidden">
      {/* Aurora Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-success/8 to-success-light/4 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-60 right-20 w-96 h-96 bg-gradient-to-br from-aurora-primary/6 to-operational/3 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-purple-500/4 to-aurora/3 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Enhanced Header with Aurora Style */}
      <div className="relative aurora-glass rounded-2xl p-8 border border-green-500/20 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-16 bg-gradient-to-b from-green-500 via-emerald-500 to-aurora-primary rounded-full aurora-glow"></div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 aurora-glass">
                    <Gift className="h-6 w-6 text-green-500" />
                  </div>
                  <h1 className="text-4xl font-bold aurora-text-gradient">
                    Estatísticas de Benefícios
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground font-medium">
                  Acompanhe o desempenho das parcerias e ofertas exclusivas para membros
                </p>
              </div>
            </div>
          </div>
          
          <Link to="/admin/tools/new">
            <Button className="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Nova Ferramenta com Benefício
            </Button>
          </Link>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full aurora-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {toolsWithBenefits} Ferramentas Ativas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-aurora-primary to-operational rounded-full aurora-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {totalClicks} Cliques Totais
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full aurora-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">
              Conversão Ativa
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Search Section */}
      <div className="aurora-glass rounded-2xl p-6 border border-green-500/20 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Search className="h-5 w-5 text-green-500/70" />
            </div>
            <Input
              type="search"
              placeholder="Buscar ferramentas e benefícios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 aurora-glass border-green-500/30 bg-background/50 backdrop-blur-sm focus:border-green-500/50 focus:ring-green-500/20 font-medium"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full aurora-pulse"></div>
            </div>
          </div>
          
          <Button
            onClick={fetchBenefitStats}
            variant="outline"
            className="h-12 px-6 aurora-glass border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10 text-green-500 font-medium backdrop-blur-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Dados
          </Button>
          
          {searchQuery && filteredStats.length !== stats.length && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full aurora-pulse"></div>
              Exibindo <span className="font-bold text-green-500">{filteredStats.length}</span> de <span className="font-bold">{stats.length}</span> resultados
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total de Cliques",
            value: totalClicks,
            icon: TrendingUp,
            gradient: "from-green-500/20 to-emerald-500/10",
            iconColor: "text-green-500",
            border: "border-green-500/30",
            description: "Cliques em links de benefícios"
          },
          {
            label: "Ferramentas com Benefícios",
            value: toolsWithBenefits,
            icon: Users,
            gradient: "from-aurora-primary/20 to-operational/10",
            iconColor: "text-aurora-primary",
            border: "border-aurora-primary/30",
            description: "Total de ferramentas com ofertas"
          },
          {
            label: "Média de Cliques",
            value: averageClicks.toFixed(1),
            icon: BarChart3,
            gradient: "from-purple-500/20 to-pink-500/10",
            iconColor: "text-purple-500",
            border: "border-purple-500/30",
            description: "Cliques por ferramenta (média)"
          },
          {
            label: "Top Performer",
            value: topPerformer ? topPerformer.benefit_clicks : 0,
            icon: ArrowUpRight,
            gradient: "from-orange-500/20 to-amber-500/10",
            iconColor: "text-orange-500",
            border: "border-orange-500/30",
            description: topPerformer ? topPerformer.name : "Nenhuma ferramenta"
          }
        ].map((metric, index) => (
          <div 
            key={metric.label} 
            className={`aurora-glass rounded-2xl border ${metric.border} backdrop-blur-md overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`bg-gradient-to-r ${metric.gradient} p-6 border-b border-white/10`}>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl aurora-glass bg-gradient-to-br ${metric.gradient}`}>
                  <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold aurora-text-gradient group-hover:scale-110 transition-transform duration-300">
                    {metric.value}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="font-medium text-foreground group-hover:text-foreground transition-colors duration-300 mb-1">
                {metric.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Enhanced Benefits Table */}
      <div className="aurora-glass rounded-2xl border border-green-500/20 backdrop-blur-md overflow-hidden animate-fade-in animation-delay-500">
        <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent p-8 border-b border-green-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 aurora-glass">
              <BarChart3 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold aurora-text-gradient">Desempenho por Ferramenta</h2>
              <p className="text-muted-foreground font-medium">
                Análise detalhada de cliques em benefícios exclusivos para membros
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {filteredStats.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/20 to-muted/10 aurora-glass mx-auto w-fit mb-6">
                <Gift className="h-16 w-16 text-muted-foreground" />
              </div>
              <h4 className="text-2xl font-bold aurora-text-gradient mb-4">
                {searchQuery ? 'Nenhum Resultado Encontrado' : 'Nenhum Benefício Disponível'}
              </h4>
              <p className="text-lg text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Tente ajustar sua busca ou explore outras ferramentas.' 
                  : 'Comece criando ferramentas com benefícios exclusivos para membros.'}
              </p>
              {!searchQuery && (
                <Link to="/admin/tools/new">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Ferramenta
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Enhanced Table Header */}
              <div className="aurora-glass rounded-xl p-4 border border-muted/20 backdrop-blur-sm">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                  <div className="col-span-3">Ferramenta</div>
                  <div className="col-span-3">Benefício</div>
                  <div className="col-span-2">Categoria</div>
                  <div className="col-span-2 text-right">Cliques</div>
                  <div className="col-span-2 text-center">Ações</div>
                </div>
              </div>
              
              {/* Enhanced Table Rows */}
              {filteredStats.map((stat, index) => (
                <div 
                  key={stat.id}
                  className="aurora-glass rounded-xl p-4 border border-muted/20 backdrop-blur-sm hover:border-green-500/30 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/10 aurora-glass flex items-center justify-center">
                          <Gift className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{stat.name}</p>
                          <p className="text-xs text-muted-foreground">Ferramenta</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-3">
                      <p className="font-medium text-foreground">{stat.benefit_title || '-'}</p>
                      <p className="text-xs text-muted-foreground">Oferta exclusiva</p>
                    </div>
                    
                    <div className="col-span-2">
                      <Badge 
                        variant="outline" 
                        className="bg-green-500/10 text-green-500 border-green-500/30 font-medium"
                      >
                        {stat.category}
                      </Badge>
                    </div>
                    
                    <div className="col-span-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <p className="text-2xl font-bold aurora-text-gradient">
                          {stat.benefit_clicks || 0}
                        </p>
                        <ExternalLink className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">Total de acessos</p>
                    </div>
                    
                    <div className="col-span-2 flex justify-center">
                      <BenefitActionsCell tool={stat as any} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BenefitStats;
