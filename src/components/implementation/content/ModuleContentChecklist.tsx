
import React, { useEffect, useState } from "react";
import { Module, Solution, supabase, UserChecklist } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

interface ModuleContentChecklistProps {
  module: Module;
}

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  checked: boolean;
}

export const ModuleContentChecklist = ({ module }: ModuleContentChecklistProps) => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [userChecklist, setUserChecklist] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch solution data
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", module.solution_id)
          .single();
        
        if (error) {
          logError("Error fetching solution:", error);
          return;
        }
        
        // Ensure data is of Solution type
        const solutionData = data as Solution;
        setSolution(solutionData);
        
        // Check if checklist property exists and is an array
        if (solutionData.checklist && Array.isArray(solutionData.checklist)) {
          // Transform items to ensure they have the required properties
          const transformedChecklist: ChecklistItem[] = solutionData.checklist.map((item: any, index: number) => ({
            id: item.id || `checklist-${index}`,
            title: item.title || "Item sem título",
            description: item.description,
            checked: false
          }));
          setChecklist(transformedChecklist);
          
          // Initialize user checklist state
          const initialUserChecklist: Record<string, boolean> = {};
          transformedChecklist.forEach(item => {
            initialUserChecklist[item.id] = false;
          });
          
          // If user is logged in, fetch their specific checklist progress
          if (user) {
            const { data: userData, error: userError } = await supabase
              .from("user_checklists")
              .select("*")
              .eq("user_id", user.id)
              .eq("solution_id", module.solution_id)
              .single();
              
            if (!userError && userData) {
              const typedUserData = userData as UserChecklist;
              // Update the initial state with user's saved progress
              if (typedUserData.checked_items) {
                Object.keys(typedUserData.checked_items).forEach(itemId => {
                  if (initialUserChecklist.hasOwnProperty(itemId)) {
                    initialUserChecklist[itemId] = typedUserData.checked_items[itemId];
                  }
                });
              }
            }
          }
          
          setUserChecklist(initialUserChecklist);
        } else {
          // Log for debugging if checklist is missing
          console.warn("Checklist property is missing or not an array", solutionData);
          setChecklist([]);
        }
      } catch (err) {
        logError("Error fetching solution data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [module.solution_id, user, log, logError]);

  // Handle checkbox change and save to user's progress
  const handleCheckChange = async (itemId: string, checked: boolean) => {
    try {
      // Update local state first for immediate feedback
      const newUserChecklist = { ...userChecklist };
      newUserChecklist[itemId] = checked;
      setUserChecklist(newUserChecklist);
      
      // Only save to database if user is logged in
      if (user && solution) {
        setSaving(true);
        
        // Check if a record already exists
        const { data, error } = await supabase
          .from("user_checklists")
          .select("*")
          .eq("user_id", user.id)
          .eq("solution_id", solution.id)
          .single();
          
        if (error && error.code !== "PGRST116") { // PGRST116 = Not found, which is expected if no record yet
          throw error;
        }
        
        if (data) {
          // Update existing record
          await supabase
            .from("user_checklists")
            .update({
              checked_items: newUserChecklist,
              updated_at: new Date().toISOString()
            })
            .eq("id", data.id);
        } else {
          // Create new record
          await supabase
            .from("user_checklists")
            .insert({
              user_id: user.id,
              solution_id: solution.id,
              checked_items: newUserChecklist,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        }
        
        // Log user interaction
        log("User toggled checklist item", { 
          solution_id: solution.id,
          item_id: itemId,
          checked
        });
      }
    } catch (error) {
      logError("Error saving checklist progress:", error);
      toast.error("Erro ao salvar progresso do checklist");
      
      // Revert the change in UI if save fails
      setUserChecklist(prevState => ({
        ...prevState,
        [itemId]: !checked
      }));
    } finally {
      setSaving(false);
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
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum checklist disponível para esta solução.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold">Checklist de Implementação</h3>
      <p className="text-muted-foreground">
        Verifique se você completou todos os requisitos para implementar esta solução:
      </p>
      
      <div className="space-y-3 mt-4">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-start p-4 border rounded-md">
            <Checkbox
              id={`checklist-item-${item.id}`}
              checked={userChecklist[item.id] || false}
              onCheckedChange={(checked) => handleCheckChange(item.id, checked as boolean)}
              className="mt-0.5 mr-3"
              disabled={saving}
            />
            <div>
              <Label htmlFor={`checklist-item-${item.id}`} className="font-medium cursor-pointer">
                {item.title}
              </Label>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Progresso do checklist */}
      <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-green-800">
            Progresso do checklist
          </span>
          <span className="text-sm font-medium text-green-800">
            {Object.values(userChecklist).filter(Boolean).length} de {checklist.length}
          </span>
        </div>
      </div>
    </div>
  );
};
