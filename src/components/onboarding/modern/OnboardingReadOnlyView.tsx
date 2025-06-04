
import React from 'react';
import { motion } from 'framer-motion';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { CheckCircle, ArrowLeft, Calendar, Building, User, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface OnboardingReadOnlyViewProps {
  data: QuickOnboardingData;
}

export const OnboardingReadOnlyView: React.FC<OnboardingReadOnlyViewProps> = ({ data }) => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Informações Pessoais',
      icon: User,
      items: [
        { label: 'Nome', value: data.name },
        { label: 'Email', value: data.email },
        { label: 'WhatsApp', value: data.whatsapp },
        { label: 'Como nos conheceu', value: data.how_found_us },
        { label: 'Indicação', value: data.referred_by || 'Não informado' }
      ]
    },
    {
      title: 'Informações Profissionais',
      icon: Building,
      items: [
        { label: 'Empresa', value: data.company_name },
        { label: 'Cargo', value: data.role },
        { label: 'Tamanho da empresa', value: data.company_size },
        { label: 'Segmento', value: data.company_segment },
        { label: 'Faturamento anual', value: data.annual_revenue_range },
        { label: 'Principal desafio', value: data.main_challenge }
      ]
    },
    {
      title: 'Experiência com IA',
      icon: Target,
      items: [
        { label: 'Nível de conhecimento', value: data.ai_knowledge_level },
        { label: 'Usa IA atualmente', value: data.uses_ai },
        { label: 'Principal objetivo', value: data.main_goal },
        { label: 'Já implementou IA', value: data.has_implemented },
        { label: 'Ferramentas anteriores', value: data.previous_tools?.join(', ') || 'Nenhuma' },
        { label: 'Áreas de interesse', value: data.desired_ai_areas?.join(', ') || 'Não informado' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Dashboard</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Onboarding Concluído</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Seus Dados de Configuração
          </h1>
          <p className="text-gray-600">
            Visualização dos dados fornecidos durante o processo de onboarding
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + sectionIndex * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              {/* Section Header */}
              <div className="bg-gradient-to-r from-viverblue to-blue-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <section.icon className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                </div>
              </div>

              {/* Section Content */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {section.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium text-gray-700">
                        {item.label}
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-900">
                          {item.value || 'Não informado'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
            <Calendar className="h-5 w-5" />
            <span>Onboarding concluído</span>
          </div>
          <p className="text-sm text-gray-500">
            Estes dados são utilizados para personalizar sua experiência na plataforma. 
            Entre em contato com o suporte se precisar atualizar alguma informação.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
