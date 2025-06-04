import React from "react";
import { Solution, Module } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Target } from "lucide-react";
interface ImplementationHeaderProps {
  solution: Solution;
  currentModuleIndex: number;
  totalModules: number;
  currentModule: Module | null;
}
export const ImplementationHeader: React.FC<ImplementationHeaderProps> = ({
  solution,
  currentModuleIndex,
  totalModules,
  currentModule
}) => {
  return;
};