
import { useState } from "react";
import { useImplementationProfilesData } from "@/hooks/admin/useImplementationProfilesData";
import {
  ArrowUpRight,
  Users,
  Briefcase,
  Brain,
  Target,
  BarChart4,
  Star,
  UserCheck,
  Search,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, BarChart } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ImplementationProfile } from "@/hooks/useImplementationProfile";

const AdminImplementationProfiles = () => {
  const { profiles, stats, loading } = useImplementationProfilesData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // Filtrar perfis
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = searchQuery.trim() === "" || 
      (profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       profile.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       profile.company_name?.toLowerCase().includes(searchQuery.toLowerCase()));
       
    const matchesFilter = filterType === "all" || 
      (filterType === "completed" && profile.is_completed) ||
      (filterType === "incomplete" && !profile.is_completed);
      
    return matchesSearch && matchesFilter;
  });
  
  // Formatar nível de conhecimento em IA
  const formatAiLevel = (level: string | number | null | undefined) => {
    if (level === null || level === undefined) return "Básico";
    
    const numLevel = typeof level === 'number' ? level : parseInt(String(level));
    
    switch(numLevel) {
      case 1: return "Básico";
      case 2: return "Intermediário";
      case 3: return "Avançado";
      case 4: return "Expert";
      default: return "Básico";
    }
  };
  
  // Formatar data
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  // Obter iniciais para avatar
  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin mr-2" />
        <span>Carregando dados dos perfis de implementação...</span>
      </div>
    );
  }
  
  const aiLevelData = [
    { name: "Básico", value: stats.byAiLevel["1"] || 0 },
    { name: "Intermediário", value: stats.byAiLevel["2"] || 0 },
    { name: "Avançado", value: stats.byAiLevel["3"] || 0 },
    { name: "Expert", value: stats.byAiLevel["4"] || 0 }
  ];
  
  const primaryGoalData = Object.entries(stats.byPrimaryGoal).map(([name, value]) => ({ name, value }));
  
  const companySizeData = Object.entries(stats.byCompanySize).map(([name, value]) => ({ name, value }));
  
  const npsData = Array.from({ length: 11 }, (_, i) => ({
    name: String(i),
    nps: stats.npsDistribution[i] || 0
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perfis de Implementação</h1>
          <p className="text-muted-foreground">
            Análise e estatísticas dos perfis de implementação dos membros.
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">Total de Perfis</p>
              <Users className="h-4 w-4 text-viverblue" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.totalProfiles}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.completedProfiles} completos ({stats.completionRate.toFixed(0)}%)
                </p>
              </div>
              <div className="rounded-full bg-viverblue/10 p-2">
                <UserCheck className="h-5 w-5 text-viverblue" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">Nível Médio IA</p>
              <Brain className="h-4 w-4 text-viverblue" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {
                    aiLevelData.reduce((acc, item, i) => {
                      const weights = ["Básico", "Intermediário", "Avançado", "Expert"];
                      return item.value > acc.value ? { name: weights[i], value: item.value } : acc;
                    }, { name: "Básico", value: 0 }).name
                  }
                </p>
                <p className="text-xs text-muted-foreground">Nível mais comum entre os membros</p>
              </div>
              <div className="rounded-full bg-viverblue/10 p-2">
                <Brain className="h-5 w-5 text-viverblue" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">Objetivo Principal</p>
              <Target className="h-4 w-4 text-viverblue" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {
                    primaryGoalData.length > 0 ? 
                    primaryGoalData.reduce((acc, item) => 
                      item.value > acc.value ? item : acc
                    ).name.split(' ')[0] : "-"
                  }
                </p>
                <p className="text-xs text-muted-foreground">Objetivo mais comum</p>
              </div>
              <div className="rounded-full bg-viverblue/10 p-2">
                <Target className="h-5 w-5 text-viverblue" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">NPS Médio</p>
              <Star className="h-4 w-4 text-viverblue" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.averageNps.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Em uma escala de 0 a 10</p>
              </div>
              <div className="rounded-full bg-viverblue/10 p-2">
                <Star className="h-5 w-5 text-viverblue" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="profiles">Lista de Perfis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Nível de Conhecimento em IA</CardTitle>
                <CardDescription>Distribuição dos membros por nível</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={aiLevelData}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value} membros`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Objetivos Principais</CardTitle>
                <CardDescription>O que os membros buscam com IA</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={primaryGoalData}
                  index="name"
                  categories={["value"]}
                  valueFormatter={(value) => `${value} membros`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Distribuição de NPS</CardTitle>
                <CardDescription>Avaliações de 0 a 10</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={npsData}
                  index="name"
                  categories={["nps"]}
                  valueFormatter={(value) => `${value} avaliações`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Tamanho das Empresas</CardTitle>
                <CardDescription>Perfil das empresas dos membros</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={companySizeData}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value} empresas`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por nome, email ou empresa..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os perfis</SelectItem>
                    <SelectItem value="completed">Perfis completos</SelectItem>
                    <SelectItem value="incomplete">Perfis incompletos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Nível IA</TableHead>
                    <TableHead>Objetivo</TableHead>
                    <TableHead>NPS</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.length > 0 ? (
                    filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={undefined} />
                              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{profile.name || "-"}</div>
                              <div className="text-xs text-muted-foreground">{profile.email || "-"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{profile.company_name || "-"}</TableCell>
                        <TableCell>{profile.current_position || "-"}</TableCell>
                        <TableCell>{formatAiLevel(profile.ai_knowledge_level)}</TableCell>
                        <TableCell>{profile.primary_goal || "-"}</TableCell>
                        <TableCell>{profile.nps_score !== null ? profile.nps_score : "-"}</TableCell>
                        <TableCell>
                          {profile.is_completed ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              Completo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                              Incompleto
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(profile.created_at)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Nenhum perfil encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminImplementationProfiles;
