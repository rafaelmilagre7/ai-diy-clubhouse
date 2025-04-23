
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Resource } from "../types/ResourceTypes";
import MaterialItem from "./MaterialItem";

interface MaterialsListProps {
  materials: Resource[];
  loading?: boolean;
  searchQuery?: string;
  onRemove: (id: string) => Promise<void>;
}

const MaterialsList: React.FC<MaterialsListProps> = ({ 
  materials, 
  searchQuery = "",
  onRemove,
  loading = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Materiais Adicionados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Materiais Adicionados</CardTitle>
      </CardHeader>
      <CardContent>
        {materials.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {materials.map((resource) => (
                <MaterialItem 
                  key={resource.id}
                  material={resource}
                  onRemove={() => resource.id && onRemove(resource.id)}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            {searchQuery ? (
              <p>Nenhum resultado encontrado para "{searchQuery}"</p>
            ) : (
              <p>Nenhum material foi adicionado ainda.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialsList;
