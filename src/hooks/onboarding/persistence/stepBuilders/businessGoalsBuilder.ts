
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildBusinessGoalsUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  const existingBusinessGoals = progress?.business_goals || {};
  if ((data as any).business_goals) {
    const businessGoalsData = (data as any).business_goals;
    if (
      businessGoalsData.expected_outcome_30days &&
      !businessGoalsData.expected_outcomes
    ) {
      businessGoalsData.expected_outcomes = [businessGoalsData.expected_outcome_30days];
    }
    if (
      businessGoalsData.expected_outcomes &&
      businessGoalsData.expected_outcomes.length > 0 &&
      !businessGoalsData.expected_outcome_30days
    ) {
      businessGoalsData.expected_outcome_30days = businessGoalsData.expected_outcomes[0];
    }
    updateObj.business_goals = {
      ...existingBusinessGoals,
      ...businessGoalsData
    };
  } else if (typeof data === 'object' && data !== null) {
    const receivedData = data as any;
    updateObj.business_goals = {
      ...existingBusinessGoals,
      ...receivedData
    };
    if (
      receivedData.expected_outcome_30days &&
      !receivedData.expected_outcomes
    ) {
      updateObj.business_goals.expected_outcomes = [receivedData.expected_outcome_30days];
    }
    if (
      receivedData.expected_outcomes &&
      Array.isArray(receivedData.expected_outcomes) &&
      receivedData.expected_outcomes.length > 0 &&
      !receivedData.expected_outcome_30days
    ) {
      updateObj.business_goals.expected_outcome_30days = receivedData.expected_outcomes[0];
    }
  }
  return updateObj;
}
