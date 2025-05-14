
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { OnboardingProgress } from '@/types/onboarding';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Props {
  isLoading: boolean;
  onboardingData: OnboardingProgress[];
}

export const UserPreferencesSection: React.FC<Props> = ({ isLoading, onboardingData }) => {
  // Dados para o gráfico de disponibilidade de networking
  const networkingAvailabilityData = useMemo(() => {
    if (!onboardingData?.length) return [];
    
    // Contador para cada valor de disponibilidade
    const availabilityMap: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    // Contar ocorrências
    onboardingData.forEach(item => {
      const availability = item.experience_personalization?.networking_availability;
      if (typeof availability === 'number' && availability >= 1 && availability <= 5) {
        availabilityMap[availability] = (availabilityMap[availability] || 0) + 1;
      }
    });
    
    // Transformar em formato para o gráfico
    return Object.entries(availabilityMap).map(([key, value]) => ({
      disponibilidade: `Nível ${key}`,
      usuarios: value
    }));
  }, [onboardingData]);
  
  // Extrair e consolidar dados de preferências de tempo
  const timePreferencesData = useMemo(() => {
    if (!onboardingData?.length) return [];
    
    // Contador para períodos
    const timeCounts: Record<string, number> = {
      'manhã': 0,
      'tarde': 0,
      'noite': 0
    };
    
    // Processar todos os onboardings com dados válidos
    onboardingData.forEach(item => {
      const preferences = item.experience_personalization?.time_preference;
      if (Array.isArray(preferences)) {
        preferences.forEach(pref => {
          // Normalizar para resolver variações
          const normalizedPref = pref.toLowerCase();
          if (normalizedPref.includes('manhã') || normalizedPref.includes('manha') || normalizedPref.includes('morning')) {
            timeCounts['manhã']++;
          }
          if (normalizedPref.includes('tarde') || normalizedPref.includes('afternoon')) {
            timeCounts['tarde']++;
          }
          if (normalizedPref.includes('noite') || normalizedPref.includes('night')) {
            timeCounts['noite']++;
          }
        });
      }
    });
    
    // Converter para formato do gráfico
    return Object.entries(timeCounts).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value
    }));
  }, [onboardingData]);
  
  // Extrai os interesses mais comuns dos usuários
  const topInterests = useMemo(() => {
    if (!onboardingData?.length) return [];
    
    // Contador de interesse
    const interestCounts: Record<string, number> = {};
    
    // Processar todos os interesses em todos os onboardings
    onboardingData.forEach(item => {
      const interests = item.experience_personalization?.interests;
      if (Array.isArray(interests)) {
        interests.forEach(interest => {
          if (typeof interest === 'string' && interest.trim()) {
            const normalized = interest.trim().toLowerCase();
            interestCounts[normalized] = (interestCounts[normalized] || 0) + 1;
          }
        });
      }
    });
    
    // Ordenar por contagem e pegar os 20 mais comuns
    return Object.entries(interestCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([interest, count]) => ({
        interest,
        count
      }));
  }, [onboardingData]);
  
  // Extrai dados sobre tópicos de mentoria
  const mentorshipTopicsData = useMemo(() => {
    if (!onboardingData?.length) return [];
    
    const topicCounts: Record<string, number> = {};
    
    onboardingData.forEach(item => {
      const topics = item.experience_personalization?.mentorship_topics;
      if (Array.isArray(topics)) {
        topics.forEach(topic => {
          if (typeof topic === 'string' && topic.trim()) {
            const normalized = topic.trim().toLowerCase();
            topicCounts[normalized] = (topicCounts[normalized] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count], index) => ({
        name: topic.charAt(0).toUpperCase() + topic.slice(1),
        Usuários: count
      }));
  }, [onboardingData]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

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
        {/* Disponibilidade para Networking */}
        <Card className="bg-gray-800">
          <CardHeader>
            <CardTitle>Disponibilidade para Networking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={networkingAvailabilityData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="disponibilidade" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} usuários`, 'Quantidade']} 
                    labelFormatter={(label) => `${label} de disponibilidade`} 
                  />
                  <Legend />
                  <Bar name="Usuários" dataKey="usuarios" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Nível 1 = Pouco disponível, Nível 5 = Muito disponível
            </p>
          </CardContent>
        </Card>

        {/* Preferência de Horário */}
        <Card className="bg-gray-800">
          <CardHeader>
            <CardTitle>Preferência de Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timePreferencesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timePreferencesData.map((entry, index) => (
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

      {/* Tópicos de Mentoria */}
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle>Principais Tópicos de Mentoria</CardTitle>
        </CardHeader>
        <CardContent>
          {mentorshipTopicsData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum tópico de mentoria registrado
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mentorshipTopicsData}
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
                  <Bar dataKey="Usuários" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interesses dos Usuários */}
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle>Interesses dos Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {topInterests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum interesse registrado
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="flex flex-wrap gap-2">
                {topInterests.map((item, index) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="px-3 py-1 text-sm capitalize"
                  >
                    {item.interest} ({item.count})
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
