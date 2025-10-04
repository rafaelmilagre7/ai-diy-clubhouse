import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useProfileData } from '@/hooks/useProfileData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  Users,
  Settings, 
  Trophy, 
  BarChart3, 
  Calendar, 
  Target,
  Zap,
  Clock,
  CheckCircle,
  Edit3,
  Bell,
  Share2,
  Download,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Globe,
  Github,
  Linkedin,
  Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/dateUtils';
import LoadingScreen from '@/components/common/LoadingScreen';
import { ActivityWidget } from '@/components/profile/ActivityWidget';
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';
import { TeamManagement } from '@/components/team/TeamManagement';
import { isUserMaster } from '@/utils/roleHelpers';

const ProfilePage = () => {
  const { profile, setProfile } = useAuth();
  const { loading, stats, implementations } = useProfileData();
  const [activeTab, setActiveTab] = useState('overview');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const { toast } = useToast();
  
  // Verificar se usuário é master usando helper centralizado
  const isMasterUser = isUserMaster(profile);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'membro_club': return 'bg-blue-500';
      case 'formacao': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'iniciante': return 'text-green-400';
      case 'intermediario': return 'text-yellow-400';
      case 'avancado': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleImageUpdate = async (imageUrl: string) => {
    try {
      if (!profile?.id) return;
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: imageUrl })
        .eq('id', profile.id);

      if (error) throw error;

      // Atualizar o contexto local
      setProfile({ ...profile, avatar_url: imageUrl });
      
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
      
      setShowImageUpload(false);
    } catch (error) {
      console.error('Erro ao atualizar imagem de perfil:', error);
      toast({
        title: "Erro ao atualizar foto",
        description: "Ocorreu um erro ao atualizar sua foto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando seu perfil..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header Section */}
      <div className="relative">
        {/* Cover Background */}
        <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
        </div>

        {/* Profile Header */}
        <div className="relative -mt-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar Section */}
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-2xl ring-2 ring-primary/20">
                  <AvatarImage src={profile?.avatar_url} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-secondary text-white">
                    {getInitials(profile?.name)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  variant="secondary"
                  onClick={() => setShowImageUpload(true)}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
                      {profile?.name || 'Usuário'}
                    </h1>
                    <p className="text-muted-foreground mt-1">{profile?.email}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge 
                        variant="secondary" 
                        className={`${getRoleColor(profile?.user_roles?.name || '')} text-white border-0`}
                      >
                        {profile?.user_roles?.name || 'Membro'}
                      </Badge>
                      <Badge variant="outline" className="border-primary/30">
                        <Calendar className="w-3 h-3 mr-1" />
                        Membro desde {formatDate(profile?.created_at || new Date().toISOString()).split(' de ')[1]}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link to="/profile/edit">
                      <Button variant="outline" size="sm">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </Link>
                    <Link to="/profile/notifications">
                      <Button variant="outline" size="sm">
                        <Bell className="w-4 h-4 mr-2" />
                        Notificações
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isMasterUser ? 'grid-cols-5' : 'grid-cols-4'} lg:w-${isMasterUser ? '3/5' : '1/2'}`}>
            <TabsTrigger value="overview" className="text-xs">
              <User className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs">
              <BarChart3 className="w-4 h-4 mr-2" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="implementations" className="text-xs">
              <Target className="w-4 h-4 mr-2" />
              Implementações
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs">
              <Trophy className="w-4 h-4 mr-2" />
              Conquistas
            </TabsTrigger>
            {isMasterUser && (
              <TabsTrigger value="team" className="text-xs">
                <Users className="w-4 h-4 mr-2" />
                Gestão de Equipe
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass-card hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Soluções</p>
                      <p className="text-2xl font-bold text-primary">{stats.totalSolutions}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Concluídas</p>
                      <p className="text-2xl font-bold text-green-500">{stats.completedSolutions}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                      <p className="text-2xl font-bold text-blue-500">{stats.completionRate}%</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-full">
                      <Zap className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ativas</p>
                      <p className="text-2xl font-bold text-orange-500">{stats.activeSolutions || stats.inProgressSolutions || 0}</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-full">
                      <Clock className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Progresso Geral</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Conclusão Total</span>
                        <span>{stats.completionRate}%</span>
                      </div>
                      <Progress value={stats.completionRate} className="h-3" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mt-6">
                      <div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg border border-green-500/20">
                        <div className="text-xl font-bold text-green-500">{stats.completedSolutions}</div>
                        <div className="text-xs text-muted-foreground">Concluídas</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg border border-blue-500/20">
                        <div className="text-xl font-bold text-blue-500">{stats.activeSolutions || stats.inProgressSolutions || 0}</div>
                        <div className="text-xs text-muted-foreground">Ativas</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg border border-purple-500/20">
                        <div className="text-xl font-bold text-purple-500">{Math.max(0, stats.totalSolutions - stats.completedSolutions - (stats.activeSolutions || stats.inProgressSolutions || 0))}</div>
                        <div className="text-xs text-muted-foreground">Disponíveis</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Widget */}
              <ActivityWidget 
                activities={[]}
                isLoading={loading}
              />
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Estatísticas Detalhadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-muted-foreground">Implementações por Categoria</h4>
                    {/* Aqui você pode adicionar gráficos ou mais estatísticas */}
                    <div className="text-center text-muted-foreground py-8">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Gráficos de estatísticas em breve</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-muted-foreground">Atividade Mensal</h4>
                    <div className="text-center text-muted-foreground py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Histórico de atividades em breve</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Implementations Tab */}
          <TabsContent value="implementations">
            <div className="space-y-4">
              {implementations.length > 0 ? (
                implementations.map((impl) => (
                  <Card key={impl.id} className="glass-card hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{impl.solution.title}</h4>
                            <Badge variant="outline" className={getDifficultyColor(impl.solution.difficulty)}>
                              {impl.solution.difficulty}
                            </Badge>
                            <Badge variant="secondary">
                              {impl.solution.category}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Módulo {impl.current_module}</span>
                            {impl.is_completed ? (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Concluído
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-orange-500/30 text-orange-500">
                                <Clock className="w-3 h-3 mr-1" />
                                Em andamento
                              </Badge>
                            )}
                          </div>
                          
                          {impl.last_activity && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Última atividade: {formatDate(impl.last_activity)}
                            </p>
                          )}
                        </div>
                        
                        <Link to={`/solution/${impl.solution.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma implementação iniciada</h3>
                    <p className="text-muted-foreground mb-4">
                      Comece sua jornada de implementação de IA agora mesmo
                    </p>
                    <Link to="/solutions">
                      <Button>
                        Explorar Soluções
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Sistema de Conquistas</h3>
                <p className="text-muted-foreground mb-4">
                  Sistema de badges e conquistas chegando em breve
                </p>
                <Button variant="outline" disabled>
                  Em Desenvolvimento
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Management Tab - Only for master users */}
          {isMasterUser && (
            <TabsContent value="team">
              <TeamManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Dialog para upload de imagem */}
      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Foto de Perfil</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <ProfileImageUpload
              currentImageUrl={profile?.avatar_url}
              userName={profile?.name}
              userId={profile?.id}
              onImageUpdate={handleImageUpdate}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;