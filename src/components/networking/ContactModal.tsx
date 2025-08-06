import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Linkedin, 
  MapPin, 
  Calendar,
  Copy,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

interface ContactData {
  name: string;
  email: string;
  whatsapp_number?: string;
  company_name?: string;
  current_position?: string;
  industry?: string;
  linkedin_url?: string;
  location?: string;
  onboarding_data?: {
    professional_info?: {
      company_name?: string;
      current_position?: string;
      work_experience?: string;
      company_sector?: string;
      company_size?: string;
    };
    contact_info?: {
      phone?: string;
      linkedin?: string;
      location?: string;
    };
  };
}

export const ContactModal = ({ isOpen, onClose, userId, userName }: ContactModalProps) => {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchContactData();
    }
  }, [isOpen, userId]);

  const fetchContactData = async () => {
    setIsLoading(true);
    try {
      // Buscar dados básicos do perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, company_name, current_position, industry, linkedin_url, professional_bio, skills, whatsapp_number')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Buscar dados adicionais do onboarding se disponível
      const { data: onboarding } = await supabase
        .from('onboarding_final')
        .select('professional_info, contact_info, personal_info')
        .eq('user_id', userId)
        .single();

      setContactData({
        ...profile,
        onboarding_data: onboarding || undefined
      });
    } catch (error) {
      console.error('Erro ao buscar dados de contato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de contato.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    });
  };

  const getDisplayData = () => {
    if (!contactData) return null;

    const onboarding = contactData.onboarding_data;
    
    return {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.whatsapp_number || onboarding?.contact_info?.phone,
      company: contactData.company_name || onboarding?.professional_info?.company_name,
      position: contactData.current_position || onboarding?.professional_info?.current_position,
      industry: contactData.industry || onboarding?.professional_info?.company_sector,
      linkedin: contactData.linkedin_url || onboarding?.contact_info?.linkedin,
      location: onboarding?.contact_info?.location,
      experience: onboarding?.professional_info?.work_experience,
      companySize: onboarding?.professional_info?.company_size
    };
  };

  const displayData = getDisplayData();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            Dados de Contato
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando dados...</span>
          </div>
        ) : displayData ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header com nome */}
            <div className="text-center pb-4 border-b border-border/50">
              <h3 className="text-lg font-semibold text-foreground">{displayData.name}</h3>
              {displayData.position && (
                <p className="text-muted-foreground">{displayData.position}</p>
              )}
              {displayData.company && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{displayData.company}</span>
                </div>
              )}
            </div>

            {/* Informações de contato */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contato
              </h4>
              
              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{displayData.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(displayData.email, 'Email')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                {/* Telefone */}
                {displayData.phone && (
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{displayData.phone}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(displayData.phone!, 'Telefone')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* LinkedIn */}
                {displayData.linkedin && (
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">LinkedIn</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(displayData.linkedin, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Localização */}
                {displayData.location && (
                  <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{displayData.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informações profissionais */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Informações Profissionais
              </h4>
              
              <div className="space-y-3">
                {displayData.industry && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Setor:</span>
                    <Badge variant="secondary">{displayData.industry}</Badge>
                  </div>
                )}

                {displayData.companySize && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Porte da Empresa:</span>
                    <Badge variant="outline">{displayData.companySize}</Badge>
                  </div>
                )}

                {displayData.experience && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Experiência:</span>
                    <p className="text-sm bg-muted/50 rounded-lg p-3">
                      {displayData.experience}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => window.open(`mailto:${displayData.email}`, '_blank')}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
              
              {displayData.linkedin && (
                <Button
                  variant="outline"
                  onClick={() => window.open(displayData.linkedin, '_blank')}
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Dados de contato não disponíveis.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};