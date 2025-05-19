
import React, { useState, useEffect } from "react";
import { TrailGuidedExperience } from "../onboarding/TrailGuidedExperience";

export const ImplementationTrailCreator = () => {
  return (
    <div className="space-y-6">
      <TrailGuidedExperience autoStart={true} />
    </div>
  );
};
