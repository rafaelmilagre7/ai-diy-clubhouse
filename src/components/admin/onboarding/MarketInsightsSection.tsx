
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { OnboardingProgress } from '@/types/onboarding';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  isLoading: boolean;
  onboardingData: OnboardingProgress[];
}

export const MarketInsightsSection: React.FC<Props> = ({ isLoading, onboardingData }) => {
  // Dados para o gráfico de tamanho de empresa
  const companySizeData = useMemo(() => {
    if (!onboardingData?.length) return [];
    
    const sizeCounts: Record<string, number> = {};
    
    onboardingData.forEach(item => {
      let size = item.company_size || item.professional_info?.company_size;
      
      if (typeof size === 'string' && size.trim()) {
        // Normalizar valores
        size = size.toLowerCase().trim();
        
        // Agrupar tamanhos similares
        if (size.includes('pequena') || size.includes('small') || size.includes('1-10') || 
            size.includes('até 10') || size.includes('micro')) {
          size = 'Pequena (1-10)';
        } else if (size.includes('média') || size.includes('medium') || size.includes('11-50') ||
                  size.includes('11 a 50')) {
          size = 'Média (11-50)';
        } else if (size.includes('grande') || size.includes('large') || size.includes('51-200') ||
                  size.includes('51 a 200')) {
          size = 'Grande (51-200)';
        } else if (size.includes('enterprise') || size.includes('acima de 200') || 
                  size.includes('mais de 200') || size.includes('200+') || size.includes('201+')) {
          size = 'Enterprise (200+)';
        } else {
          size = 'Outros';
        }
        
        sizeCounts[size] = (sizeCounts[size] || 0) + 1;
      }
    });
    
    // Transformar em formato para o gráfico
    return Object.entries(sizeCounts)
      .map(([size, count]) => ({ name: size, value: count }));
  }, [onboardingData]);
  
  // Dados para o gráfico de setor de atividade
  const sectorData = useMemo(() => {
    if (!onboardingData?.length) return [];
    
    const sectorCounts: Record<string, number> = {};
    
    onboardingData.forEach(item => {
      let sector = item.company_sector || item.professional_info?.company_sector;
      
      if (typeof sector === 'string' && sector.trim()) {
        // Normalizar o valor
        sector = sector.trim();
        
        // Adicionar ao contador
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
      }
    });
    
    // Ordenar por contagem e retornar os 10 mais comuns
    return Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([sector, count]) => ({
        name: sector,
        Empresas: count
      }));
  }, [onboardingData]);
  
  // Dados para o gráfico de nível de conhecimento em IA
  const aiKnowledgeData = useMemo(() => {
    if (!onboardingData?.length) return [];
    
    const knowledgeCounts: Record<string, number> = {};
    
    onboardingData.forEach(item => {
      let level = item.ai_experience?.knowledge_level;
      
      if (typeof level === 'string' && level.trim()) {
        // Normalizar o valor
        level = level.toLowerCase().trim();
        
        // Mapear para categorias padrão
        if (level.includes('iniciante') || level.includes('beginner') || 
            level.includes('básico') || level.includes('basic')) {
          level = 'Iniciante';
        } else if (level.includes('intermediário') || level.includes('intermediate')) {
          level = 'Intermediário';
        } else if (level.includes('avançado') || level.includes('advanced')) {
          level = 'Avançado';
        } else if (level.includes('expert') || level.includes('especialista')) {
          level = 'Especialista';
        } else {
          level = 'Não especificado';
        }
        
        knowledgeCounts[level] = (knowledgeCounts[level] || 0) + 1;
      }
    });
    
    // Transformar em formato para o gráfico
    return Object.entries(knowledgeCounts)
      .map(([level, count]) => ({ name: level, value: count }));
  }, [onboardingData]);

  // Dados de desafios de negócio mais comuns
  const businessChallengesData = useMemo(() => {
    if (!onboardingData?.length) return [];
    
    const challengeCounts: Record<string, number> = {};
    
    onboardingData.forEach(item => {
      const challenges = item.business_context?.business_challenges;
      
      if (Array.isArray(challenges)) {
        challenges.forEach(challenge => {
          if (typeof challenge === 'string' && challenge.trim()) {
            const normalized = challenge.trim();
            challengeCounts[normalized] = (challengeCounts[normalized] || 0) + 1;
          }
        });
      }
    });
    
    // Ordenar por contagem e retornar os mais comuns
    return Object.entries(challengeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([challenge, count], index) => ({
        name: challenge.length > 30 ? challenge.substring(0, 30) + '...' : challenge,
        Menções: count
      }));
  }, [onboardingData]);
  
  // Cores para gráficos de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="bg-gray-800">
            <CardHeader>
              <Skeleton className="h-5 w-48 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full bg-gray-700" />
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800">
            <CardHeader>
              <Skeleton className="h-5 w-48 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full bg-gray-700" />
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-gray-800">
          <CardHeader>
            <Skeleton className="h-5 w-48 bg-gray-700" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full bg-gray-700" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Distribuição por Tamanho de Empresa */}
        <Card className="bg-gray-800">
          <CardHeader>
            <CardTitle>Tamanho das Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={companySizeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {companySizeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} empresas`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Conhecimento em IA */}
        <Card className="bg-gray-800">
          <CardHeader>
            <CardTitle>Conhecimento em IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={aiKnowledgeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {aiKnowledgeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} usuários`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Setores de Mercado */}
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle>Principais Setores de Mercado</CardTitle>
        </CardHeader>
        <CardContent>
          {sectorData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum setor registrado
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 120,
                    bottom: 5,
                  }}
                >
                  <XAxis type="number" />
                  <YAxis type="category" width={100} dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Empresas" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Principais Desafios de Negócio */}
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle>Principais Desafios de Negócio</CardTitle>
        </CardHeader>
        <CardContent>
          {businessChallengesData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum desafio de negócio registrado
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={businessChallengesData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 150,
                      bottom: 5,
                    }}
                  >
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      width={150} 
                      dataKey="name"
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Menções" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
