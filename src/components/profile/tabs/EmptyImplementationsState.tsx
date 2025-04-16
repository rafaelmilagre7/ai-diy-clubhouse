
import React from 'react';
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export const EmptyImplementationsState = () => {
  return (
    <Card className="border-dashed border-2 p-6 text-center">
      <div className="flex flex-col items-center">
        <div className="bg-muted/30 h-16 w-16 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base">Comece sua jornada</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Explore nossa biblioteca de soluções e comece a implementar IA em sua empresa
        </p>
        <Button className="mt-4" asChild>
          <Link to="/dashboard">
            Explorar Soluções
          </Link>
        </Button>
      </div>
    </Card>
  );
};
