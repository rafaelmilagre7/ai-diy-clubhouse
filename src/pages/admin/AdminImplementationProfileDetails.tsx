
import React from 'react';
import { useParams } from 'react-router-dom';
import { useImplementationProfileDetails } from '@/hooks/admin/useImplementationProfileDetails';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/date";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AdminImplementationProfileDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, isLoading } = useImplementationProfileDetails(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Carregando perfil...</h2>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Perfil não encontrado</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/implementation-profiles')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{profile.name}</h2>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
        <Badge variant={profile.is_completed ? "default" : "secondary"}>
          {profile.is_completed ? "Perfil Completo" : "Perfil Incompleto"}
        </Badge>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>Dados sobre a empresa do membro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Empresa</p>
              <p className="text-sm text-muted-foreground">{profile.company_name}</p>
            </div>
            <div>
              <p className="font-medium">Porte</p>
              <p className="text-sm text-muted-foreground">{profile.company_size}</p>
            </div>
            <div>
              <p className="font-medium">Setor</p>
              <p className="text-sm text-muted-foreground">{profile.company_sector}</p>
            </div>
            <div>
              <p className="font-medium">Site</p>
              <p className="text-sm text-muted-foreground">
                {profile.company_website ? (
                  <a href={profile.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {profile.company_website}
                  </a>
                ) : "Não informado"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Dados pessoais e profissionais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Cargo</p>
              <p className="text-sm text-muted-foreground">{profile.current_position}</p>
            </div>
            <div>
              <p className="font-medium">Localização</p>
              <p className="text-sm text-muted-foreground">
                {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}
              </p>
            </div>
            <div>
              <p className="font-medium">Telefone</p>
              <p className="text-sm text-muted-foreground">
                {profile.phone ? `${profile.phone_country_code} ${profile.phone}` : "Não informado"}
              </p>
            </div>
            <div>
              <p className="font-medium">Redes Sociais</p>
              <div className="flex gap-4">
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                    LinkedIn
                  </a>
                )}
                {profile.instagram && (
                  <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experiência com IA</CardTitle>
            <CardDescription>Nível de conhecimento e objetivos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Nível de Conhecimento</p>
              <Badge variant={profile.ai_knowledge_level >= 7 ? "default" : "secondary"}>
                {profile.ai_knowledge_level}/10
              </Badge>
            </div>
            <div>
              <p className="font-medium">Objetivo Principal</p>
              <p className="text-sm text-muted-foreground">{profile.primary_goal || "Não informado"}</p>
            </div>
            {profile.business_challenges && profile.business_challenges.length > 0 && (
              <div>
                <p className="font-medium">Desafios de Negócio</p>
                <ul className="list-disc pl-4">
                  {profile.business_challenges.map((challenge, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{challenge}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações de Registro</CardTitle>
            <CardDescription>Dados do cadastro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Data de Cadastro</p>
              <p className="text-sm text-muted-foreground">{formatDate(profile.created_at)}</p>
            </div>
            <div>
              <p className="font-medium">Última Atualização</p>
              <p className="text-sm text-muted-foreground">{formatDate(profile.updated_at)}</p>
            </div>
            <div>
              <p className="font-medium">NPS</p>
              {profile.nps_score !== null ? (
                <Badge variant={profile.nps_score >= 8 ? "default" : "secondary"}>
                  {profile.nps_score}/10
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground">Não avaliado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminImplementationProfileDetails;
