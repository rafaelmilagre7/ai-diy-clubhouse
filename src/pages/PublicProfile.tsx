import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { 
  UserPlus, 
  Check, 
  Clock, 
  Linkedin, 
  Mail, 
  Building2, 
  Briefcase, 
  MapPin,
  Calendar,
  MessageSquare,
  Users,
  Edit,
  AlertCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePublicProfile, useConnectionsCount, usePostsCount } from '@/hooks/networking/usePublicProfile';
import { useConnections } from '@/hooks/networking/useConnections';
import { isProfileComplete, getProfileCompleteness } from '@/utils/profileValidation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = user?.id === userId;

  const { data: profile, isLoading } = usePublicProfile(userId);
  const { data: connectionsCount = 0 } = useConnectionsCount(userId);
  const { data: postsCount = 0 } = usePostsCount(userId);
  
  const { sendConnectionRequest, isSendingRequest, useCheckConnectionStatus } = useConnections();
  const { data: connectionStatus } = useCheckConnectionStatus(userId);
  const [localStatus, setLocalStatus] = useState<'none' | 'pending' | 'accepted'>('none');

  useEffect(() => {
    if (connectionStatus) {
      setLocalStatus(connectionStatus.status as 'none' | 'pending' | 'accepted');
    }
  }, [connectionStatus]);

  const handleAddConnection = async () => {
    if (!userId) return;
    try {
      await sendConnectionRequest(userId);
      setLocalStatus('pending');
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
    }
  };

  const handleOpenChat = () => {
    navigate('/networking/chat');
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-md"
        >
          <Loader2 className="h-12 w-12 animate-spin text-aurora" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-md">
        <LiquidGlassCard className="max-w-md w-full p-xl text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-md" />
          <h2 className="text-2xl font-bold mb-sm">Perfil não encontrado</h2>
          <p className="text-muted-foreground mb-lg">
            O perfil que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/networking')} className="gap-sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Networking
          </Button>
        </LiquidGlassCard>
      </div>
    );
  }

  const completeness = getProfileCompleteness(profile);
  const isComplete = isProfileComplete(profile);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section com gradiente Aurora */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-80 overflow-hidden"
      >
        <div className="absolute inset-0 aurora-gradient opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="relative container mx-auto px-md h-full flex items-end pb-xl">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col md:flex-row items-center md:items-end gap-lg w-full"
          >
            {/* Avatar com glow */}
            <div className="relative">
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px hsl(var(--aurora) / 0.3)',
                    '0 0 40px hsl(var(--aurora) / 0.5)',
                    '0 0 20px hsl(var(--aurora) / 0.3)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="rounded-full"
              >
                <Avatar className="w-40 h-40 border-4 border-background shadow-2xl">
                  <AvatarImage src={profile.avatar_url} alt={profile.name} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-aurora/30 to-aurora-primary/30 text-aurora font-bold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>

            {/* Nome e Cargo */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-foreground mb-sm">{profile.name}</h1>
              {profile.current_position && (
                <p className="text-xl text-muted-foreground mb-xs">{profile.current_position}</p>
              )}
              {profile.company_name && (
                <p className="text-lg text-muted-foreground font-semibold">{profile.company_name}</p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-md py-xl">
        <div className="max-w-6xl mx-auto">
          {/* Banner de perfil incompleto */}
          {!isComplete && isOwnProfile && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-6"
            >
              <Alert className="border-aurora/30 bg-aurora/5 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 text-aurora" />
                <AlertTitle className="text-aurora">Complete seu perfil</AlertTitle>
                <AlertDescription>
                  Seu perfil está {completeness}% completo.
                  <Link to="/profile/edit" className="text-aurora hover:underline ml-1 font-semibold">
                    Clique aqui para completar →
                  </Link>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda - Ações e Estatísticas */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Ações */}
              <LiquidGlassCard variant="premium" className="p-6 space-y-3">
                {isOwnProfile ? (
                  <Button
                    onClick={() => navigate('/profile/edit')}
                    size="default"
                    className="w-full gap-2 bg-gradient-to-r from-aurora via-aurora-primary to-operational hover:from-aurora/80 hover:via-aurora-primary/80 hover:to-operational/80 text-primary-foreground shadow-md hover:shadow-lg border-0"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="text-sm">Editar Perfil</span>
                  </Button>
                ) : (
                  <>
                    {/* Botão Adicionar Conexão */}
                    <Button
                      onClick={handleAddConnection}
                      disabled={localStatus !== 'none' || isSendingRequest}
                      size="default"
                      className={`w-full gap-2 transition-smooth shadow-md hover:shadow-lg border-0 ${
                        localStatus === 'accepted'
                          ? 'bg-gradient-to-r from-success via-success-light to-success-dark hover:from-success-dark hover:via-success hover:to-success-light text-primary-foreground'
                          : localStatus === 'pending'
                          ? 'bg-gradient-to-r from-warning via-warning-light to-warning-dark text-primary-foreground cursor-not-allowed opacity-80'
                          : 'bg-gradient-to-r from-aurora via-aurora-primary to-operational hover:from-aurora/80 hover:via-aurora-primary/80 hover:to-operational/80 text-primary-foreground'
                      }`}
                    >
                      {localStatus === 'accepted' ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span className="text-sm">Conectado</span>
                        </>
                      ) : localStatus === 'pending' ? (
                        <>
                          <Clock className="h-4 w-4 animate-pulse" />
                          <span className="text-sm">Enviada</span>
                        </>
                      ) : isSendingRequest ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Enviando...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          <span className="text-sm">Adicionar</span>
                        </>
                      )}
                    </Button>

                    {/* Botão Mensagem (só se conectado) */}
                    {localStatus === 'accepted' && (
                      <Button
                        onClick={handleOpenChat}
                        variant="outline"
                        size="default"
                        className="w-full gap-2 border-aurora/30 hover:bg-aurora/5"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">Enviar Mensagem</span>
                      </Button>
                    )}
                  </>
                )}

                {/* Links Externos */}
                {profile.linkedin_url && (
                  <Button
                    onClick={() => window.open(profile.linkedin_url, '_blank')}
                    variant="outline"
                    size="default"
                    className="w-full gap-2 border-social-linkedin/30 hover:bg-social-linkedin/5"
                  >
                    <Linkedin className="h-4 w-4 text-social-linkedin" />
                    <span className="text-sm">LinkedIn</span>
                  </Button>
                )}

                {profile.email && localStatus === 'accepted' && (
                  <Button
                    onClick={() => window.location.href = `mailto:${profile.email}`}
                    variant="outline"
                    size="default"
                    className="w-full gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </Button>
                )}
              </LiquidGlassCard>

              {/* Estatísticas */}
              <LiquidGlassCard variant="premium" className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-aurora" />
                  Estatísticas
                </h3>
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 rounded-lg aurora-glass-hover"
                  >
                    <span className="text-muted-foreground">Conexões</span>
                    <span className="text-2xl font-bold text-aurora">{connectionsCount}</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 rounded-lg aurora-glass-hover"
                  >
                    <span className="text-muted-foreground">Posts</span>
                    <span className="text-2xl font-bold text-aurora-primary">{postsCount}</span>
                  </motion.div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/30">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Membro desde {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>

            {/* Coluna Direita - Informações Detalhadas */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Sobre */}
              {profile.professional_bio && (
                <LiquidGlassCard variant="premium" className="p-6">
                  <h3 className="text-lg font-semibold mb-4">📝 Sobre</h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {profile.professional_bio}
                  </p>
                </LiquidGlassCard>
              )}

              {/* Informações Profissionais */}
              <LiquidGlassCard variant="premium" className="p-6">
                <h3 className="text-lg font-semibold mb-4">💼 Informações Profissionais</h3>
                <div className="space-y-3">
                  {profile.industry && (
                    <div className="flex items-center gap-3 p-3 rounded-lg aurora-glass-hover">
                      <MapPin className="h-5 w-5 text-aurora flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Indústria</p>
                        <p className="font-medium">{profile.industry}</p>
                      </div>
                    </div>
                  )}
                  {profile.company_name && (
                    <div className="flex items-center gap-3 p-3 rounded-lg aurora-glass-hover">
                      <Building2 className="h-5 w-5 text-aurora-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Empresa</p>
                        <p className="font-medium">{profile.company_name}</p>
                      </div>
                    </div>
                  )}
                  {profile.current_position && (
                    <div className="flex items-center gap-3 p-3 rounded-lg aurora-glass-hover">
                      <Briefcase className="h-5 w-5 text-operational flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Cargo</p>
                        <p className="font-medium">{profile.current_position}</p>
                      </div>
                    </div>
                  )}
                </div>
              </LiquidGlassCard>

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <LiquidGlassCard variant="premium" className="p-6">
                  <h3 className="text-lg font-semibold mb-4">🏷️ Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge className="px-4 py-2 aurora-glass-hover cursor-default">
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </LiquidGlassCard>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
