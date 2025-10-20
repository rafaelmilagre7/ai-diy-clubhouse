
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileEdit, Calendar, CheckCircle, Clock, Building } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { Link } from "react-router-dom";

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
  // Função para validar a URL da imagem
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Verificar se a URL da imagem é válida
  const validAvatarUrl = isValidImageUrl(profileAvatar) ? profileAvatar : undefined;

  return (
    <Card className="md:col-span-1 glass-dark hover:shadow-lg transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 border-2 border-viverblue/20 shadow-md">
            <AvatarImage src={validAvatarUrl} />
            <AvatarFallback className="text-2xl bg-gradient-viver text-white">{avatarInitials}</AvatarFallback>
          </Avatar>
          
          <h2 className="mt-md text-xl font-semibold text-high-contrast">{profileName || "Usuário"}</h2>
          <p className="text-sm text-medium-contrast mt-xs">{profileEmail || ""}</p>

          <div className="w-full mt-lg space-y-sm">
            <div className="flex justify-between items-center text-sm bg-accent/30 p-3 rounded-lg">
              <span className="flex items-center text-medium-contrast">
                <Calendar className="h-4 w-4 mr-2 text-viverblue" />
                Membro desde
              </span>
              <span className="font-medium text-high-contrast">{formatDate(createdAt || new Date().toISOString())}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-medium-contrast">Implementações</span>
              <span className="font-medium text-high-contrast">{totalSolutions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center text-medium-contrast">
                <CheckCircle className="h-4 w-4 mr-2 text-system-healthy" />
                Concluídas
              </span>
              <span className="font-medium text-high-contrast">{completedSolutions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center text-medium-contrast">
                <Clock className="h-4 w-4 mr-2 text-warning" />
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
                background: 'var(--category-aurora-bg)'
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
