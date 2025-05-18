
import React from "react";
import { SuccessCard } from "../celebration/SuccessCard";
import { toast } from "sonner";

interface OnboardingSuccessToastProps {
  title: string;
  message: string;
}

export const showOnboardingSuccessToast = ({ title, message }: OnboardingSuccessToastProps) => {
  toast.custom((t) => (
    <div className="w-full max-w-md" onClick={() => toast.dismiss(t)}>
      <SuccessCard
        title={title}
        message={message}
        type="implementation"
        showConfetti={true}
        className="cursor-pointer hover:opacity-95 transition-opacity"
      />
    </div>
  ), {
    duration: 6000,
  });
};
