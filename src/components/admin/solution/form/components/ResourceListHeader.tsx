
import React from "react";
import { 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";

interface ResourceListHeaderProps {
  resourceCount: number;
  searchQuery?: string;
}

const ResourceListHeader: React.FC<ResourceListHeaderProps> = ({ 
  resourceCount,
  searchQuery 
}) => {
  return (
    <CardHeader>
      <CardTitle className="text-base">Materiais Adicionados</CardTitle>
      <CardDescription>
        {resourceCount} {resourceCount === 1 ? 'material encontrado' : 'materiais encontrados'}
      </CardDescription>
    </CardHeader>
  );
};

export default ResourceListHeader;
