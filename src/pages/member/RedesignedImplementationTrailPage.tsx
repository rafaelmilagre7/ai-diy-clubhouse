
import React from "react";
import { SmartFeatureGuard } from "@/components/auth/SmartFeatureGuard";
import { RedesignedImplementationTrailPage as RedesignedTrailComponent } from "@/components/implementation-trail/redesigned/RedesignedImplementationTrailPage";
import { PageTransition } from "@/components/transitions/PageTransition";

const RedesignedImplementationTrailPage = () => {
  return (
    <PageTransition>
      <SmartFeatureGuard feature="implementation_trail">
        <RedesignedTrailComponent />
      </SmartFeatureGuard>
    </PageTransition>
  );
};

export default RedesignedImplementationTrailPage;
