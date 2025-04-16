
import React from 'react';
import { ImplementationCard } from "../implementation/ImplementationCard";
import { EmptyImplementationsState } from "./EmptyImplementationsState";
import { Implementation } from "@/hooks/useProfileData";

interface ImplementationsTabContentProps {
  implementations: Implementation[];
}

export const ImplementationsTabContent = ({ implementations }: ImplementationsTabContentProps) => {
  return (
    <div className="space-y-4">
      {implementations.length > 0 ? (
        implementations.map((implementation) => (
          <ImplementationCard key={implementation.id} implementation={implementation} />
        ))
      ) : (
        <EmptyImplementationsState />
      )}
    </div>
  );
};
