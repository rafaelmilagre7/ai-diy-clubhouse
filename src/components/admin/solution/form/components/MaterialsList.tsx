
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Resource } from "../types/ResourceTypes";
import MaterialItem from "./MaterialItem";

interface MaterialsListProps {
  materials: Resource[];
  loading: boolean;
  onRemove: (id: string) => Promise<void>;
}

const MaterialsList: React.FC<MaterialsListProps> = ({ 
  materials, 
  loading, 
  onRemove 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Materiais Adicionados</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : materials.length > 0 ? (
          <ScrollArea className="h-scroll-lg pr-4">
            <div className="space-y-3">
              {materials.map((material) => (
                <MaterialItem 
                  key={material.id} 
                  material={material} 
                  onRemove={onRemove} 
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>Nenhum material foi adicionado ainda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialsList;
