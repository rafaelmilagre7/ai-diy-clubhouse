
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, GraduationCap, Users, Briefcase, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { OnboardingStepProps } from '../types/onboardingTypes';

export const OnboardingStep2 = ({ 
  data, 
  onUpdateData, 
  onNext, 
  memberType 
}: OnboardingStepProps) => {
  const [businessStage, setBusinessStage] = useState<'idea' | 'startup' | 'growth' | 'established' | ''>(data.businessStage || '');
  const [businessArea, setBusinessArea] = useState(data.businessArea || '');
  const [teamSize, setTeamSize] = useState<'solo' | 'small' | 'medium' | 'large' | ''>(data.teamSize || '');
  const [educationLevel, setEducationLevel] = useState<'student' | 'graduate' | 'postgraduate' | 'professional' | ''>(data.educationLevel || '');
  const [studyArea, setStudyArea] = useState(data.studyArea || '');
  const [institution, setInstitution] = useState(data.institution || '');

  const handleNext = () => {
    if (memberType === 'club') {
      onUpdateData({ businessStage, businessArea, teamSize });
    } else {
      onUpdateData({ educationLevel, studyArea, institution });
    }
    onNext();
  };

  const isClubMember = memberType === 'club';
  const canProceed = isClubMember 
    ? businessStage && businessArea && teamSize
    : educationLevel && studyArea;

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 p-4 rounded-full">
            {isClubMember ? (
              <Building2 className="w-8 h-8 text-viverblue" />
            ) : (
              <GraduationCap className="w-8 h-8 text-viverblue" />
            )}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isClubMember ? 'Conte-nos sobre seu negócio! 💼' : 'Seu perfil educacional 🎓'}
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {isClubMember 
            ? 'Vamos entender melhor seu empreendimento para personalizar as soluções de IA mais adequadas!'
            : 'Queremos conhecer seu background educacional para oferecer o melhor conteúdo de formação!'
          }
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 max-w-md mx-auto"
      >
        {isClubMember ? (
          <>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Em que estágio está seu negócio?
              </Label>
              <Select value={businessStage} onValueChange={setBusinessStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estágio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">💡 Apenas uma ideia</SelectItem>
                  <SelectItem value="startup">🚀 Startup (até 2 anos)</SelectItem>
                  <SelectItem value="growth">📈 Em crescimento (2-5 anos)</SelectItem>
                  <SelectItem value="established">🏢 Estabelecido (5+ anos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Em qual área seu negócio atua?</Label>
              <Input
                value={businessArea}
                onChange={(e) => setBusinessArea(e.target.value)}
                placeholder="Ex: E-commerce, Consultoria, Saúde..."
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Qual o tamanho da sua equipe?
              </Label>
              <Select value={teamSize} onValueChange={setTeamSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">👤 Apenas eu</SelectItem>
                  <SelectItem value="small">👥 2-5 pessoas</SelectItem>
                  <SelectItem value="medium">👨‍👩‍👧‍👦 6-20 pessoas</SelectItem>
                  <SelectItem value="large">🏢 20+ pessoas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Qual seu nível educacional atual?
              </Label>
              <Select value={educationLevel} onValueChange={setEducationLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">📚 Estudante (graduação)</SelectItem>
                  <SelectItem value="graduate">🎓 Graduado</SelectItem>
                  <SelectItem value="postgraduate">📖 Pós-graduação</SelectItem>
                  <SelectItem value="professional">💼 Profissional experiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Em qual área você estuda/trabalha?</Label>
              <Input
                value={studyArea}
                onChange={(e) => setStudyArea(e.target.value)}
                placeholder="Ex: Tecnologia, Marketing, Administração..."
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <School className="w-4 h-4" />
                Instituição (opcional)
              </Label>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Nome da sua instituição de ensino"
              />
            </div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-6"
        >
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full bg-viverblue hover:bg-viverblue-dark text-lg py-6"
          >
            {isClubMember ? 'Falar sobre o mercado! 🎯' : 'Próximo passo! ✨'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
