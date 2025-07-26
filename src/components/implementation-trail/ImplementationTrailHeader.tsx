import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, TrendingUp, Target, Star, Award, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
interface ImplementationTrailHeaderProps {
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}
export const ImplementationTrailHeader = ({
  onRegenerate,
  isRegenerating
}: ImplementationTrailHeaderProps) => {
  return null; // Banner removido conforme solicitado
};