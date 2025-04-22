
import React from "react";
import { PersonalInfoError } from "./PersonalInfoError";

interface PersonalInfoErrorSectionProps {
  totalSteps: number;
  progressPercentage: number;
  stepTitles: string[];
  onStepClick: (stepIdx: number) => void;
  loadError: string | null;
  lastError: any;
  onRetry: () => void;
}

export function PersonalInfoErrorSection(props: PersonalInfoErrorSectionProps) {
  return <PersonalInfoError {...props} />;
}
