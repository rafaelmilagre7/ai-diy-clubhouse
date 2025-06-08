
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileEdit, Calendar, CheckCircle, Clock, Building, Brain } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { Link } from "react-router-dom";
import { useOnboardingData } from '@/hooks/useOnboardingData';

interface ProfileHeaderProps {
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar: string | undefined;
  createdAt: string;
  totalSolutions: number;
  completedSolutions: number;
  completionRate: number;
  avatarInitials: string;
}

export const ProfileHeader = ({
  profileName,
  profileEmail,
  profileAvatar,
  createdAt,
  totalSolutions,
  completedSolutions,
  completionRate,
  avatarInitials
}: ProfileHeaderProps) => {
  const { data: onboardingData } = useOnboardingData();

  // Função para validar a URL da imagem
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Verificar se a URL da imagem é válida
  const validAvatarUrl = isValidImageUrl(profileAvatar) ? profileAvatar : undefined;

  const getAILevelInfo = (level: string) => {
    const levelMap: Record<string, { label: string; progress: number; color: string }> = {
      'beginner': { label: 'Iniciante', progress: 25, color: 'bg-blue-500/20 text-blue-400' },
      'intermediate': { label: 'Intermediário', progress: 50, color: 'bg-green-500/20 text-green-400' },
      'advanced': { label: 'Avançado', progress: 75, color: 'bg-yellow-500/20 text-yellow-400' },
      'expert': { label: 'Especialista', progress: 100, color: 'bg-purple-500/20 text-purple-400' },
    };
    return levelMap[level] || { label: level, progress: 0, color: 'bg-gray-500/20 text-gray-400' };
  };

  const aiLevelInfo = onboardingData?.aiKnowledgeLevel ? getAILevelInfo(onboardingData.aiKnowledgeLevel) : null;

  return (
    <Card className="md:col-span-1 glass-dark hover:shadow-lg transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 border-2 border-viverblue/20 shadow-md">
            <AvatarImage src={validAvatarUrl} />
            <AvatarFallback className="text-2xl bg-gradient-viver text-white">{avatarInitials}</AvatarFallback>
          </Avatar>
          
          <h2 className="mt-4 text-xl font-semibold text-high-contrast">{profileName || "Usuário"}</h2>
          <p className="text-sm text-medium-contrast mt-1">{profileEmail || ""}</p>
          
          {/* Badges do onboarding */}
          <div className="flex flex-wrap gap-2 mt-3">
            {onboardingData?.memberType && (
              <Badge variant="default" className="text-xs">
                {onboardingData.memberType === 'club' ? 'Club Member' : 'Formação'}
              </Badge>
            )}
            {onboardingData?.businessSector && (
              <Badge variant="outline" className="text-xs">
                <Building className="h-3 w-3 mr-1" />
                {onboardingData.businessSector}
              </Badge>
            )}
          </div>

          {/* Nível de IA */}
          {aiLevelInfo && (
            <div className="w-full mt-4 p-3 bg-neutral-800/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center text-xs text-medium-contrast">
                  <Brain className="h-3 w-3 mr-1" />
                  Maturidade IA
                </span>
                <Badge className={`${aiLevelInfo.color} text-xs`}>
                  {aiLevelInfo.label}
                </Badge>
              </div>
              <Progress value={aiLevelInfo.progress} className="h-1.5" />
            </div>
          )}
          
          <div className="w-full mt-6 space-y-3">
            <div className="flex justify-between items-center text-sm bg-neutral-800/30 p-3 rounded-lg">
              <span className="flex items-center text-medium-contrast">
                <Calendar className="h-4 w-4 mr-2 text-viverblue" />
                Membro desde
              </span>
              <span className="font-medium text-high-contrast">{formatDate(createdAt || new Date().toISOString())}</span>
            </div>
            
            {onboardingData?.companyName && (
              <div className="flex justify-between items-center text-sm bg-neutral-800/30 p-3 rounded-lg">
                <span className="flex items-center text-medium-contrast">
                  <Building className="h-4 w-4 mr-2 text-viverblue" />
                  Empresa
                </span>
                <span className="font-medium text-high-contrast text-right truncate max-w-32">
                  {onboardingData.companyName}
                </span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-medium-contrast">Implementações</span>
              <span className="font-medium text-high-contrast">{totalSolutions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center text-medium-contrast">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Concluídas
              </span>
              <span className="font-medium text-high-contrast">{completedSolutions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center text-medium-contrast">
                <Clock className="h-4 w-4 mr-2 text-amber-500" />
                Taxa de conclusão
              </span>
              <span className="font-medium text-high-contrast">{completionRate}%</span>
            </div>
          </div>
          
          <div className="w-full mt-6">
            <div className="flex justify-between text-xs text-medium-contrast mb-1">
              <span>Conclusão total</span>
              <span>{completionRate}%</span>
            </div>
            <Progress 
              value={completionRate} 
              className="h-2" 
              style={{
                background: 'rgba(0, 234, 217, 0.1)'
              }}
            />
          </div>
          
          <Link to="/profile/edit" className="mt-6 w-full">
            <Button className="w-full" variant="outline" size="sm">
              <FileEdit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
