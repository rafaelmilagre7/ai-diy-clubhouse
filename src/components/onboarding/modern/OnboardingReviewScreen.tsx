
import React from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, User, Building, Brain, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingReviewScreenProps {
  data: QuickOnboardingData;
  onEdit: (step: number) => void;
  onContinue: () => void;
  isLoading?: boolean;
}

export const OnboardingReviewScreen: React.FC<OnboardingReviewScreenProps> = ({
  data,
  onEdit,
  onContinue,
  isLoading = false
}) => {
  const formatList = (items: string[]) => {
    if (!items || items.length === 0) return 'Não informado';
    return items.join(', ');
  };

  const formatPhone = (countryCode: string, phone: string) => {
    if (!phone) return 'Não informado';
    return `${countryCode} ${phone}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
          <h2 className="text-3xl font-bold text-white">
            Revisão das Informações
          </h2>
        </div>
        <p className="text-gray-300 text-lg">
          Confirme se todos os dados estão corretos antes de finalizar
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Dados Pessoais */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-gray-800/50 border-gray-700 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-viverblue" />
                <CardTitle className="text-white">Dados Pessoais</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(1)}
                className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Nome:</span>
                <p className="text-white font-medium">{data.personal_info?.name || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">E-mail:</span>
                <p className="text-white font-medium">{data.personal_info?.email || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">WhatsApp:</span>
                <p className="text-white font-medium">
                  {formatPhone(data.personal_info?.country_code || '+55', data.personal_info?.whatsapp || '')}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Como nos conheceu:</span>
                <p className="text-white font-medium">{data.personal_info?.how_found_us || 'Não informado'}</p>
              </div>
              {data.personal_info?.linkedin_url && (
                <div>
                  <span className="text-gray-400 text-sm">LinkedIn:</span>
                  <p className="text-white font-medium text-sm truncate">{data.personal_info.linkedin_url}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Dados Profissionais */}
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-gray-800/50 border-gray-700 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-viverblue" />
                <CardTitle className="text-white">Dados Profissionais</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(2)}
                className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Empresa:</span>
                <p className="text-white font-medium">{data.professional_info?.company_name || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Cargo:</span>
                <p className="text-white font-medium">{data.professional_info?.role || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Tamanho da empresa:</span>
                <p className="text-white font-medium">{data.professional_info?.company_size || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Segmento:</span>
                <p className="text-white font-medium">{data.professional_info?.company_segment || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Faturamento:</span>
                <p className="text-white font-medium">{data.professional_info?.annual_revenue_range || 'Não informado'}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Experiência com IA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-gray-800/50 border-gray-700 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-viverblue" />
                <CardTitle className="text-white">Experiência com IA</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(3)}
                className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Nível de conhecimento:</span>
                <p className="text-white font-medium">{data.ai_experience?.ai_knowledge_level || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Uso atual de IA:</span>
                <p className="text-white font-medium">{data.ai_experience?.uses_ai || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Objetivo principal:</span>
                <p className="text-white font-medium">{data.ai_experience?.main_goal || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Áreas de interesse:</span>
                <p className="text-white font-medium text-sm">{formatList(data.ai_experience?.desired_ai_areas || [])}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Já implementou IA:</span>
                <p className="text-white font-medium">{data.ai_experience?.has_implemented || 'Não informado'}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Botão de Finalizar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex justify-center mt-8"
      >
        <Button
          onClick={onContinue}
          disabled={isLoading}
          className="bg-gradient-to-r from-viverblue to-blue-600 hover:from-viverblue/90 hover:to-blue-600/90 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Finalizando...
            </>
          ) : (
            <>
              Finalizar Onboarding
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};
