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
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-aurora" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <LiquidGlassCard className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Perfil não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O perfil que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/networking')} className="gap-2">
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
        
        <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full"
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
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-aurora/30 to-viverblue/30 text-aurora font-bold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>

            {/* Nome e Cargo */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-foreground mb-2">{profile.name}</h1>
              {profile.current_position && (
                <p className="text-xl text-muted-foreground mb-1">{profile.current_position}</p>
              )}
              {profile.company_name && (
                <p className="text-lg text-muted-foreground font-semibold">{profile.company_name}</p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
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
                    className="w-full gap-2 bg-gradient-to-r from-aurora via-viverblue to-operational hover:from-aurora/80 hover:via-viverblue/80 hover:to-operational/80 text-white shadow-lg shadow-aurora/30"
                  >
                    <Edit className="h-5 w-5" />
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    {/* Botão Adicionar Conexão */}
                    <Button
                      onClick={handleAddConnection}
                      disabled={localStatus !== 'none' || isSendingRequest}
                      className={`w-full gap-2 transition-all duration-300 ${
                        localStatus === 'accepted'
                          ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-green-500/30'
                          : localStatus === 'pending'
                          ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white shadow-lg shadow-yellow-500/20 cursor-not-allowed'
                          : 'bg-gradient-to-r from-aurora via-viverblue to-operational hover:from-aurora/80 hover:via-viverblue/80 hover:to-operational/80 text-white shadow-lg shadow-aurora/30'
                      }`}
                    >
                      {localStatus === 'accepted' ? (
                        <>
                          <Check className="h-5 w-5" />
                          Conectado ✓
                        </>
                      ) : localStatus === 'pending' ? (
                        <>
                          <Clock className="h-5 w-5 animate-pulse" />
                          Solicitação Enviada
                        </>
                      ) : isSendingRequest ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5" />
                          Adicionar Conexão
                        </>
                      )}
                    </Button>

                    {/* Botão Mensagem (só se conectado) */}
                    {localStatus === 'accepted' && (
                      <Button
                        onClick={handleOpenChat}
                        variant="outline"
                        className="w-full gap-2 border-aurora/30 hover:bg-aurora/5"
                      >
                        <MessageSquare className="h-5 w-5" />
                        Enviar Mensagem
                      </Button>
                    )}
                  </>
                )}

                {/* Links Externos */}
                {profile.linkedin_url && (
                  <Button
                    onClick={() => window.open(profile.linkedin_url, '_blank')}
                    variant="outline"
                    className="w-full gap-2 border-[#0A66C2]/30 hover:bg-[#0A66C2]/5"
                  >
                    <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                    LinkedIn
                  </Button>
                )}

                {profile.email && localStatus === 'accepted' && (
                  <Button
                    onClick={() => window.location.href = `mailto:${profile.email}`}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Mail className="h-5 w-5" />
                    Email
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
                    <span className="text-2xl font-bold text-viverblue">{postsCount}</span>
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
                      <Building2 className="h-5 w-5 text-viverblue flex-shrink-0" />
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
