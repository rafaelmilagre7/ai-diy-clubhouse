
import { OnboardingData } from "./onboarding";

// Consolidate all possible review data fields
export interface ReviewData {
  personal_info?: OnboardingData['personal_info'];
  professional_info?: OnboardingData['professional_info'];
  business_context?: OnboardingData['business_context'];
  business_goals?: OnboardingData['business_goals'];
  ai_experience?: OnboardingData['ai_experience'];
  experience_personalization?: OnboardingData['experience_personalization'];
  complementary_info?: OnboardingData['complementary_info'];
  
  // Optional catch-all for any additional dynamic fields
  [key: string]: any;
}
