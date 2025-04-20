
import React from "react";
import { ChatOnboarding } from "./ChatOnboarding";
import { EtapasProgresso } from "./EtapasProgresso";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: string;
  title: string;
  backUrl?: string;
}

export const OnboardingLayout = ({
  children,
  currentStep,
  title,
  backUrl = "/onboarding",
}: OnboardingLayoutProps) => {
  return (
    <div className="container max-w-screen-lg py-8">
      <div className="relative mb-4">
        <Link to={backUrl}>
          <Button variant="ghost" size="icon" className="absolute left-0 top-0 z-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        
        <div className="flex justify-center">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="h-8"
          />
        </div>
      </div>

      <EtapasProgresso currentStep={currentStep} />

      <div className="mt-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>

      <ChatOnboarding />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {children}
      </div>
    </div>
  );
};
