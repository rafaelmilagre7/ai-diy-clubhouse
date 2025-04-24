
import React from "react";
import { PersonalInfoLoader } from "./PersonalInfoLoader";

interface PersonalInfoLoaderSectionProps {
  totalSteps: number;
  progressPercentage: number;
  stepTitles: string[];
  onStepClick: (stepIdx: number) => void;
}

export function PersonalInfoLoaderSection(props: PersonalInfoLoaderSectionProps) {
  return <PersonalInfoLoader {...props} />;
}
