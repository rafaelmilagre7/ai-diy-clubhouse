
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Solution } from "@/lib/supabase";
import { formatDate } from "./publish/DateFormatter";
import { usePublishSolution } from "./publish/usePublishSolution";
import SolutionHeaderInfo from "./publish/SolutionHeaderInfo";
import ImplementationStatus from "./publish/ImplementationStatus";
import PublishToggle from "./publish/PublishToggle";
import ActionButtons from "./publish/ActionButtons";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { useNavigate } from "react-router-dom";

interface PublishSolutionFormProps {
  solutionId: string | null;
  solution: Solution | null;
  onSave: (values: any) => Promise<void>;
  saving: boolean;
}

/**
 * Formulário para publicação de solução
 * Permite revisar, publicar e visualizar a solução antes de disponibilizá-la aos membros
 * Exibe status de implementação e controles para gerenciar publicação
 */
const PublishSolutionForm: React.FC<PublishSolutionFormProps> = ({
  solutionId,
  solution,
  onSave,
  saving
}) => {
  const navigate = useNavigate();
  const {
    isPublished,
    handlePublishToggle,
    handleViewSolution
  } = usePublishSolution(solutionId, solution, onSave, saving);

  return (
    <Container className="space-y-6">
      <div className="space-y-2">
        <Text variant="section" textColor="primary">Revisão e Publicação</Text>
        <Text variant="body" textColor="secondary">
          Revise todos os detalhes da solução antes de publicá-la para os membros.
        </Text>
      </div>
      
      <Card variant="elevated" className="overflow-hidden">
        <SolutionHeaderInfo solution={solution} formatDate={formatDate} />
        
        <CardContent className="space-y-6">
          <ImplementationStatus isPublished={isPublished} />
          
          <PublishToggle 
            isPublished={isPublished} 
            handlePublishToggle={handlePublishToggle} 
            saving={saving} 
          />
        </CardContent>
        
        <CardFooter className="flex gap-3 border-t border-border pt-6">
          <ActionButtons 
            solutionId={solutionId}
            handleViewSolution={handleViewSolution}
          />
        </CardFooter>
      </Card>
      
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/solutions")}
          disabled={saving}
          className="hover-lift"
        >
          <Text variant="button">Voltar para Lista de Soluções</Text>
        </Button>
      </div>
    </Container>
  );
};

export default PublishSolutionForm;
