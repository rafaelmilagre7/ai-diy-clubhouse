
import React, { useEffect, useState } from "react";
import { Module, Solution, supabase } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentChecklistProps {
  module: Module;
  onComplete?: () => void;
}

interface ChecklistItem {
  title: string;
  description?: string;
  checked: boolean;
}

export const ModuleContentChecklist = ({ module, onComplete }: ModuleContentChecklistProps) => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [allChecked, setAllChecked] = useState(false);
  const navigate = useNavigate();
  const { log } = useLogging();

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
        
        // Ensure data is of Solution type before setting
        const solutionData = data as Solution;
        setSolution(solutionData);
        
        // Check if checklist property exists and is an array
        if (solutionData.checklist && Array.isArray(solutionData.checklist)) {
          // Transform items to ensure they have the required properties
          const transformedChecklist: ChecklistItem[] = solutionData.checklist.map((item: any) => ({
            title: item.title || "Item sem título",
            description: item.description,
            checked: item.checked || false
          }));
          setChecklist(transformedChecklist);
        } else {
          // Log for debugging if checklist is missing
          console.warn("Checklist property is missing or not an array", solutionData);
          setChecklist([]);
        }
      } catch (err) {
        console.error("Error fetching solution data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [module.solution_id]);

  // Verify if all items are checked
  useEffect(() => {
    if (checklist.length > 0) {
      const isAllChecked = checklist.every(item => item.checked);
      setAllChecked(isAllChecked);
    }
  }, [checklist]);

  const handleCheckChange = (index: number, checked: boolean) => {
    const newChecklist = [...checklist];
    newChecklist[index] = { ...newChecklist[index], checked };
    setChecklist(newChecklist);
    
    // Log user interaction
    log("User toggled checklist item", { 
      solution_id: module.solution_id,
      module_id: module.id,
      item_index: index,
      checked
    });
  };

  const handleImplementationConfirm = () => {
    if (solution) {
      // Navigate to implementation confirmation
      navigate(`/implement/${solution.id}/confirm`);
    }
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
              checked={item.checked}
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
      
      {/* Botão de confirmação de implementação */}
      {module.type === "verification" && (
        <div className="mt-8 pt-4 border-t">
          <Button
            onClick={handleImplementationConfirm}
            disabled={!allChecked}
            className="w-full py-6"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Confirmar Implementação
          </Button>
          {!allChecked && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Complete todos os itens do checklist para confirmar a implementação.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
