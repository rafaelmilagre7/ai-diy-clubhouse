
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { BenefitStatsHeader } from '@/components/admin/benefits/BenefitStatsHeader';
import { BenefitActionsCell } from '@/components/admin/benefits/BenefitActionsCell';

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
  
  if (loading) {
    return <LoadingScreen message="Carregando estatísticas..." />;
  }
  
  return (
    <div className="space-y-6">
      <BenefitStatsHeader />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar ferramenta..."
              className="pl-8 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              Cliques em links de benefícios
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ferramentas com Benefícios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toolsWithBenefits}</div>
            <p className="text-xs text-muted-foreground">
              Total de ferramentas com ofertas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Cliques</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {toolsWithBenefits > 0 ? (totalClicks / toolsWithBenefits).toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Cliques por ferramenta (média)
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Ferramenta</CardTitle>
          <CardDescription>
            Cliques em links de benefícios exclusivos para membros
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Nenhuma ferramenta encontrada com essa busca.' 
                  : 'Não há ferramentas com benefícios cadastrados.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ferramenta</TableHead>
                  <TableHead>Benefício</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStats.map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">{stat.name}</TableCell>
                    <TableCell>{stat.benefit_title || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5]">
                        {stat.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {stat.benefit_clicks || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      <BenefitActionsCell tool={stat as any} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BenefitStats;
