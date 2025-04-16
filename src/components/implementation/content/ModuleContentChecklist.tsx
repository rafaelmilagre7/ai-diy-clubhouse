
import React, { useState, useEffect } from "react";
import { Module, Solution, supabase } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface ModuleContentChecklistProps {
  module: Module;
}

interface ChecklistItem {
  title: string;
  description?: string;
  checked?: boolean;
}

export const ModuleContentChecklist = ({ module }: ModuleContentChecklistProps) => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", module.solution_id)
          .single();
        
        if (error) {
          console.error("Error fetching solution:", error);
          return;
        }
        
        setSolution(data);
        
        if (data.checklist && Array.isArray(data.checklist)) {
          setChecklist(data.checklist);
        }
      } catch (err) {
        console.error("Error fetching solution data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [module.solution_id]);

  const handleCheckChange = (index: number, checked: boolean) => {
    const newChecklist = [...checklist];
    newChecklist[index] = { ...newChecklist[index], checked };
    setChecklist(newChecklist);
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Checklist de Implementação</h3>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start p-4 border rounded-md">
            <Skeleton className="h-5 w-5 rounded mr-3 mt-0.5" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (checklist.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold">Checklist de Implementação</h3>
      <p className="text-muted-foreground">
        Verifique se você completou todos os requisitos para implementar esta solução:
      </p>
      
      <div className="space-y-3 mt-4">
        {checklist.map((item, index) => (
          <div key={index} className="flex items-start p-4 border rounded-md">
            <Checkbox
              id={`checklist-item-${index}`}
              checked={item.checked || false}
              onCheckedChange={(checked) => handleCheckChange(index, checked as boolean)}
              className="mt-0.5 mr-3"
            />
            <div>
              <Label htmlFor={`checklist-item-${index}`} className="font-medium cursor-pointer">
                {item.title}
              </Label>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
