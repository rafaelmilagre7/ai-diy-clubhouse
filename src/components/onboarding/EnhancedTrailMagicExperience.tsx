
import React from 'react';
import { ModernTrailAnimation } from './ModernTrailAnimation';

interface EnhancedTrailMagicExperienceProps {
  onFinish: () => void;
}

export const EnhancedTrailMagicExperience: React.FC<EnhancedTrailMagicExperienceProps> = ({
  onFinish
}) => {
  return <ModernTrailAnimation onComplete={onFinish} />;
};
