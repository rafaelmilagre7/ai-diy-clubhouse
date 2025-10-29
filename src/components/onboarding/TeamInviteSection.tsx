import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, X, Mail, Phone, Users, AlertCircle, Loader2 } from 'lucide-react';
import { useOnboardingTeamInvites, TeamInviteData } from '@/hooks/onboarding/useOnboardingTeamInvites';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamInviteSectionProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const TeamInviteSection: React.FC<TeamInviteSectionProps> = ({ onComplete, onSkip }) => {
  console.log('[TEAM_INVITE] 🎬 Componente montado', { onComplete: typeof onComplete, onSkip: typeof onSkip });
  
  const { isLoading, planLimits, checkPlanLimits, sendTeamInvites } = useOnboardingTeamInvites();
  const [invites, setInvites] = useState<TeamInviteData[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentPhone, setCurrentPhone] = useState('');
  const [currentChannel, setCurrentChannel] = useState<'email' | 'whatsapp' | 'both'>('email');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkLimits = async () => {
      console.log('[TEAM_INVITE] 🔍 Verificando limites do plano...');
      setIsChecking(true);
      const limits = await checkPlanLimits();
      console.log('[TEAM_INVITE] 📊 Limites obtidos:', limits);
      setIsChecking(false);
    };
    checkLimits();
  }, []);

  const handleAddInvite = () => {
    if (!currentEmail.trim()) {
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentEmail)) {
      return;
    }

    // Verificar se email já foi adicionado
    if (invites.some(i => i.email === currentEmail)) {
      return;
    }

    // Verificar limite de convites
    const availableSlots = (planLimits?.maxMembers || 1) - (planLimits?.currentMembers || 1);
    if (invites.length >= availableSlots) {
      return;
    }

    setInvites([...invites, {
      email: currentEmail.trim(),
      phone: currentPhone.trim() || undefined,
      channelPreference: currentChannel
    }]);

    // Limpar campos
    setCurrentEmail('');
    setCurrentPhone('');
    setCurrentChannel('email');
  };

  const handleRemoveInvite = (email: string) => {
    setInvites(invites.filter(i => i.email !== email));
  };

  const handleSendInvites = async () => {
    if (invites.length === 0) {
      onSkip();
      return;
    }

    const success = await sendTeamInvites(invites);
    if (success) {
      onComplete();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInvite();
    }
  };

  // Sempre permitir continuar, mesmo durante loading
  const handleContinue = () => {
    console.log('[TEAM_INVITE] 🚀 Botão Continuar clicado - chamando onSkip');
    onSkip();
  };

  if (isChecking) {
    console.log('[TEAM_INVITE] ⏳ Ainda verificando limites...');
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Adicionar Membros da Equipe
          </CardTitle>
          <CardDescription>
            Verificando limites do seu plano...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <Button onClick={handleContinue} variant="outline" className="w-full">
            Pular Esta Etapa
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Se não pode adicionar membros, pular esta seção
  if (!planLimits?.canAddMembers) {
    console.log('[TEAM_INVITE] ⚠️ Plano não permite adicionar membros', planLimits);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Adicionar Membros da Equipe
          </CardTitle>
          <CardDescription>
            Seu plano atual não permite adicionar membros adicionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleContinue} className="w-full">
            Continuar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const availableSlots = planLimits.maxMembers - planLimits.currentMembers;
  const remainingSlots = availableSlots - invites.length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Convide Membros da Equipe
        </CardTitle>
        <CardDescription>
          Adicione até {availableSlots} membro(s) à sua equipe. Os convites serão enviados por email ou WhatsApp.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informações do plano */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Plano {planLimits.planType}:</strong> {planLimits.currentMembers}/{planLimits.maxMembers} membros utilizados
            {remainingSlots > 0 && ` • ${remainingSlots} convite(s) disponível(is)`}
          </AlertDescription>
        </Alert>

        {/* Formulário de adicionar convite */}
        {remainingSlots > 0 && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email do Membro *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@empresa.com"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                WhatsApp (opcional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+55 11 99999-9999"
                value={currentPhone}
                onChange={(e) => setCurrentPhone(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Canal de Envio</Label>
              <Select value={currentChannel} onValueChange={(v: any) => setCurrentChannel(v)}>
                <SelectTrigger id="channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="whatsapp">📱 WhatsApp</SelectItem>
                  <SelectItem value="both">📧 + 📱 Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAddInvite}
              variant="secondary"
              className="w-full"
              disabled={!currentEmail.trim()}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar à Lista
            </Button>
          </div>
        )}

        {/* Lista de convites */}
        <AnimatePresence>
          {invites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              <Label>Convites a Enviar ({invites.length})</Label>
              <div className="space-y-2">
                {invites.map((invite, index) => (
                  <motion.div
                    key={invite.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 border rounded-lg bg-background"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {invite.channelPreference === 'both' ? '📧 + 📱' :
                         invite.channelPreference === 'whatsapp' ? '📱 WhatsApp' : '📧 Email'}
                        {invite.phone && ` • ${invite.phone}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveInvite(invite.email)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1"
            disabled={isLoading}
          >
            Pular Esta Etapa
          </Button>
          <Button
            onClick={handleSendInvites}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : invites.length > 0 ? (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Enviar {invites.length} Convite(s)
              </>
            ) : (
              'Continuar'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
