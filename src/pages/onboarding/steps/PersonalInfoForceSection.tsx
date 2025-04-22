
import React from "react";
import { PersonalInfoForceButton } from "./PersonalInfoForceButton";

interface PersonalInfoForceSectionProps {
  totalSteps: number;
  progressPercentage: number;
  stepTitles: string[];
  onStepClick: (stepIdx: number) => void;
  onForceContinue: () => void;
  onRetry: () => void;
}

export function PersonalInfoForceSection(props: PersonalInfoForceSectionProps) {
  return <PersonalInfoForceButton {...props} />;
}
