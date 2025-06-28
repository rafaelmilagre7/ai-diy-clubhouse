
import React from "react";
import { Module } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChecklistData } from "./useChecklistData";
import { useChecklistInteractions } from "./useChecklistInteractions";
import { CheckCircle, Circle } from "lucide-react";

interface ChecklistDisplayProps {
  module: Module;
}

export const ChecklistDisplay = ({ module }: ChecklistDisplayProps) => {
  const { checklist, userChecklist, loading } = useChecklistData(module);
  const { handleToggleItem } = useChecklistInteractions(module);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (checklist.length === 0) {
    return null;
  }

  const completedCount = checklist.filter(item => userChecklist[item.id]).length;
  const totalCount = checklist.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Lista de Verificação</span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount}/{totalCount} completo ({completionPercentage}%)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#0ABAB5] h-2 rounded-full transition-all duration-300" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        
        <div className="space-y-3">
          {checklist.map(item => (
            <div 
              key={item.id} 
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                id={item.id}
                checked={userChecklist[item.id] || false}
                onCheckedChange={() => handleToggleItem(item.id)}
              />
              <label
                htmlFor={item.id}
                className={`flex-1 text-sm cursor-pointer ${
                  userChecklist[item.id] ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {item.title}
              </label>
              {userChecklist[item.id] ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
