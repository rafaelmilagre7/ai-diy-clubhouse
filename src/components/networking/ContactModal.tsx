import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Loader2,
  Shield,
  Eye,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useRequestNetworkingContact } from '@/hooks/useRequestNetworkingContact';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  initialData?: {
    email?: string;
    whatsapp_number?: string;
    linkedin_url?: string;
    avatar_url?: string;
    company_name?: string;
    current_position?: string;
  };
}

interface ContactData {
  name: string;
  email: string;
  avatar_url?: string;
  whatsapp_number?: string;
  company_name?: string;
  current_position?: string;
  industry?: string;
  linkedin_url?: string;
  location?: string;
  onboarding_data?: {
    personal_info?: {
      bio?: string;
      city?: string;
      state?: string;
      phone?: string;
      linkedin_url?: string;
    };
    location_info?: {
      city?: string;
      state?: string;
      country?: string;
    };
    business_info?: {
      company_name?: string;
      current_position?: string;
      work_experience?: string;
      company_sector?: string;
      company_size?: string;
      company_website?: string;
      annual_revenue?: string;
      phone?: string;
      linkedin_url?: string;
      professional_bio?: string;
    };
    professional_info?: {
      company_name?: string;
      current_position?: string;
      work_experience?: string;
      company_sector?: string;
      company_size?: string;
      industry?: string;
      company_website?: string;
      annual_revenue?: string;
    };
    business_context?: {
      professional_bio?: string;
    };
  };
}

export const ContactModal = ({ isOpen, onClose, userId, userName, initialData }: ContactModalProps) => {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataRevealed, setIsDataRevealed] = useState(false);
  const { toast } = useToast();
  const requestContact = useRequestNetworkingContact();

  useEffect(() => {
    if (isOpen && userId) {
      // Inicializar com dados mascarados do initialData
      if (initialData) {
        setContactData({
          name: userName,
          email: initialData.email || 'e***@*****.com',
          avatar_url: initialData.avatar_url,
          whatsapp_number: initialData.whatsapp_number || '****',
          company_name: initialData.company_name,
          current_position: initialData.current_position,
          linkedin_url: initialData.linkedin_url,
        });
      }
      setIsDataRevealed(false);
    }
  }, [isOpen, userId, userName, initialData]);

  const handleRequestContact = async () => {
    setIsLoading(true);
    try {
      const result = await requestContact.mutateAsync({
        targetUserId: userId,
        message: `Olá! Gostaria de me conectar com você via ${userName}.`
      });

      if (result.success && result.contact_data) {
        // Atualizar com dados reais
        setContactData({
          name: result.contact_data.name,
          email: result.contact_data.email,
          avatar_url: initialData?.avatar_url,
          whatsapp_number: result.contact_data.whatsapp_number,
          company_name: result.contact_data.company_name,
          current_position: result.contact_data.current_position,
          linkedin_url: result.contact_data.linkedin_url,
        });
        setIsDataRevealed(true);
      }
    } catch (error) {
      console.error('Erro ao solicitar contato:', error);
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
    const onboarding = contactData?.onboarding_data;
    
    return {
      name: contactData?.name || userName,
      email: contactData?.email || initialData?.email || '',
      avatar: contactData?.avatar_url || initialData?.avatar_url,
      phone: contactData?.whatsapp_number || initialData?.whatsapp_number || onboarding?.personal_info?.phone || onboarding?.business_info?.phone,
      company: contactData?.company_name || initialData?.company_name || onboarding?.business_info?.company_name || onboarding?.professional_info?.company_name,
      position: contactData?.current_position || initialData?.current_position || onboarding?.business_info?.current_position || onboarding?.professional_info?.current_position,
      industry: contactData?.industry || onboarding?.business_info?.company_sector || onboarding?.professional_info?.industry,
      linkedin: contactData?.linkedin_url || initialData?.linkedin_url || onboarding?.personal_info?.linkedin_url || onboarding?.business_info?.linkedin_url,
      location: onboarding?.location_info?.city && onboarding?.location_info?.state ? 
        `${onboarding.location_info.city}, ${onboarding.location_info.state}` : 
        onboarding?.location_info?.city || onboarding?.personal_info?.city,
      experience: onboarding?.business_info?.work_experience || onboarding?.business_context?.professional_bio || onboarding?.personal_info?.bio,
      companySize: onboarding?.business_info?.company_size || onboarding?.professional_info?.company_size,
      website: onboarding?.business_info?.company_website || onboarding?.professional_info?.company_website,
      bio: onboarding?.personal_info?.bio || onboarding?.business_info?.professional_bio
    };
  };

  const displayData = getDisplayData();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-gradient-to-br from-background via-background to-background/95">
        <DialogHeader className="sr-only">
          <DialogTitle>Contato de {userName}</DialogTitle>
          <DialogDescription>Detalhes de contato e links profissionais</DialogDescription>
        </DialogHeader>
        <div className="relative">
          {/* Background decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-[100px] blur-xl"></div>
          
          <div className="relative">
            {isLoading && !displayData ? (
              <div className="flex items-center justify-center py-20">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse"></div>
                    <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
                  </div>
                  <p className="text-muted-foreground font-medium">Carregando perfil...</p>
                </motion.div>
              </div>
            ) : displayData ? (
              <div className="overflow-y-auto max-h-[90vh]">
                {/* Header com foto e informações principais */}
                <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 pb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center"
                  >
                    {/* Foto do perfil */}
                    <div className="relative mb-6">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-full blur-sm opacity-75"></div>
                      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 shadow-xl">
                      <img
                        src={displayData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayData.name || userName)}&background=0D8ABC&color=fff&size=96`}
                        alt={displayData.name || userName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="absolute inset-0 hidden items-center justify-center text-primary">
                        <User className="h-10 w-10" />
                      </div>
                      </div>
                      {/* Indicador online */}
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-lg"></div>
                    </div>

                    {/* Nome e cargo */}
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-foreground">{displayData.name}</h2>
                      {displayData.position && (
                        <p className="text-lg text-muted-foreground font-medium">{displayData.position}</p>
                      )}
                      {displayData.company && (
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-background/80 backdrop-blur rounded-full border border-border/50">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{displayData.company}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                 <div className="p-8 pt-4 space-y-8">
                   {/* Alerta de privacidade se dados não foram revelados */}
                   {!isDataRevealed && (
                     <Alert className="bg-primary/5 border-primary/20">
                       <Shield className="h-4 w-4 text-primary" />
                       <AlertDescription className="text-sm">
                         <div className="space-y-2">
                           <p className="font-medium">Dados protegidos por privacidade</p>
                           <p className="text-muted-foreground">
                             Por segurança e LGPD, os dados de contato estão mascarados. 
                             Clique em "Solicitar Contato" para revelar as informações reais. 
                             Esta ação será registrada para auditoria.
                           </p>
                         </div>
                       </AlertDescription>
                     </Alert>
                   )}

                   {/* Botão de solicitação de contato */}
                   {!isDataRevealed && (
                     <div className="flex justify-center">
                       <Button
                         onClick={handleRequestContact}
                         disabled={isLoading}
                         className="relative group bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-lg hover:shadow-primary/25"
                       >
                         {isLoading ? (
                           <>
                             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                             Solicitando...
                           </>
                         ) : (
                           <>
                             <Eye className="h-4 w-4 mr-2" />
                             Solicitar Dados de Contato
                           </>
                         )}
                       </Button>
                     </div>
                   )}

                   {/* Cards de informações */}
                  <div className="grid gap-6">
                    {/* Contato */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative group"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-card/50 backdrop-blur border border-border/30 rounded-xl p-6 space-y-4">
                        <h3 className="flex items-center gap-3 text-lg font-semibold text-foreground">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Mail className="h-5 w-5 text-primary" />
                          </div>
                          Contato
                        </h3>
                        
                         <div className="space-y-3">
                           {/* Email */}
                           <div className="flex items-center justify-between bg-background/50 rounded-lg p-4 border border-border/30 hover:border-primary/30 transition-colors group">
                             <div className="flex items-center gap-3 flex-1">
                               <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                               <div className="flex items-center gap-2 flex-1">
                                 <span className="text-sm font-medium">{displayData.email}</span>
                                 {!isDataRevealed && (
                                   <Lock className="h-3 w-3 text-muted-foreground" />
                                 )}
                               </div>
                             </div>
                             {isDataRevealed && (
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => copyToClipboard(displayData.email, 'Email')}
                                 className="hover:bg-primary/10 hover:text-primary"
                               >
                                 <Copy className="h-4 w-4" />
                               </Button>
                             )}
                           </div>

                           {/* Telefone */}
                           {displayData.phone && (
                             <div className="flex items-center justify-between bg-background/50 rounded-lg p-4 border border-border/30 hover:border-primary/30 transition-colors group">
                               <div className="flex items-center gap-3 flex-1">
                                 <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                 <div className="flex items-center gap-2 flex-1">
                                   <span className="text-sm font-medium">{displayData.phone}</span>
                                   {!isDataRevealed && (
                                     <Lock className="h-3 w-3 text-muted-foreground" />
                                   )}
                                 </div>
                               </div>
                               {isDataRevealed && (
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => copyToClipboard(displayData.phone!, 'Telefone')}
                                   className="hover:bg-primary/10 hover:text-primary"
                                 >
                                   <Copy className="h-4 w-4" />
                                 </Button>
                               )}
                             </div>
                           )}

                          {/* Localização */}
                          {displayData.location && (
                            <div className="flex items-center gap-3 bg-background/50 rounded-lg p-4 border border-border/30">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{displayData.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    {/* Informações Profissionais */}
                    {(displayData.industry || displayData.companySize || displayData.website) && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative group"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent to-primary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative bg-card/50 backdrop-blur border border-border/30 rounded-xl p-6 space-y-4">
                          <h3 className="flex items-center gap-3 text-lg font-semibold text-foreground">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            Informações Profissionais
                          </h3>
                          
                          <div className="grid gap-4">
                            {displayData.industry && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Setor:</span>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                  {displayData.industry}
                                </Badge>
                              </div>
                            )}

                            {displayData.companySize && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Porte da Empresa:</span>
                                <Badge variant="outline" className="border-primary/30 text-foreground">
                                  {displayData.companySize}
                                </Badge>
                              </div>
                            )}

                            {displayData.website && (
                              <div className="flex items-center justify-between bg-background/50 rounded-lg p-4 border border-border/30 hover:border-primary/30 transition-colors group">
                                <div className="flex items-center gap-3">
                                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                  <span className="text-sm font-medium">Website da empresa</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(displayData.website, '_blank')}
                                  className="hover:bg-primary/10 hover:text-primary"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Sobre */}
                    {(displayData.experience || displayData.bio) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative group"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative bg-card/50 backdrop-blur border border-border/30 rounded-xl p-6 space-y-4">
                          <h3 className="flex items-center gap-3 text-lg font-semibold text-foreground">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            Sobre
                          </h3>
                          <div className="bg-background/30 rounded-lg p-4 border border-border/20">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {displayData.experience || displayData.bio}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* CTA LinkedIn */}
                  {displayData.linkedin && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex justify-center pt-4"
                    >
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Button
                          onClick={() => window.open(displayData.linkedin, '_blank')}
                          size="lg"
                          className="relative bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl px-8 py-3 text-base font-semibold"
                        >
                          <Linkedin className="h-5 w-5 mr-2" />
                          Conectar no LinkedIn
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
                    <User className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="text-lg font-medium text-foreground">Dados não disponíveis</p>
                  <p className="text-muted-foreground">Não foi possível carregar as informações de contato.</p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};