
import { Fragment } from "react";
import { Route } from "react-router-dom";
import MemberLayout from "@/components/layout/MemberLayout";

// Páginas de membros
import Dashboard from "@/pages/member/Dashboard";
import Solutions from "@/pages/member/Solutions";
import SolutionDetails from "@/pages/member/SolutionDetails";
import SolutionImplementation from "@/pages/member/SolutionImplementation";
import ImplementationCompleted from "@/pages/member/ImplementationCompleted";
import Profile from "@/pages/member/Profile";
import EditProfile from "@/pages/member/EditProfile";
import Tools from "@/pages/member/Tools";
import ToolDetails from "@/pages/member/ToolDetails";
import Benefits from "@/pages/member/Benefits";
import Suggestions from "@/pages/member/Suggestions";
import SuggestionDetails from "@/pages/member/SuggestionDetails";
import NewSuggestion from "@/pages/member/NewSuggestion";
import Achievements from "@/pages/member/Achievements";

// Páginas de onboarding
import OnboardingIntro from "@/pages/onboarding/OnboardingIntro";
import PersonalInfo from "@/pages/onboarding/steps/PersonalInfo";
import ProfessionalData from "@/pages/onboarding/steps/ProfessionalData";
import BusinessContext from "@/pages/onboarding/steps/BusinessContext";
import AIExperience from "@/pages/onboarding/steps/AIExperience";
import BusinessGoalsClub from "@/pages/onboarding/steps/BusinessGoalsClub";
import ExperiencePersonalization from "@/pages/onboarding/steps/ExperiencePersonalization";
import ComplementaryInfo from "@/pages/onboarding/steps/ComplementaryInfo";
import Review from "@/pages/onboarding/steps/Review";
import TrailGeneration from "@/pages/onboarding/steps/TrailGeneration";
import ImplementationTrailPage from "@/pages/member/ImplementationTrailPage";

export const memberRoutes = (
  <Fragment>
    {/* Rotas do Dashboard */}
    <Route path="/" element={<MemberLayout><Dashboard /></MemberLayout>} />
    <Route path="/dashboard" element={<MemberLayout><Dashboard /></MemberLayout>} />
    
    {/* Trilha de implementação */}
    <Route path="/implementation-trail" element={<MemberLayout><ImplementationTrailPage /></MemberLayout>} />
    
    {/* Rotas de Soluções */}
    <Route path="/solutions" element={<MemberLayout><Solutions /></MemberLayout>} />
    <Route path="/solution/:id" element={<MemberLayout><SolutionDetails /></MemberLayout>} />
    <Route path="/implement/:id/:moduleIdx" element={<MemberLayout><SolutionImplementation /></MemberLayout>} />
    <Route path="/implementation/:id" element={<MemberLayout><SolutionImplementation /></MemberLayout>} />
    <Route path="/implementation/:id/:moduleIdx" element={<MemberLayout><SolutionImplementation /></MemberLayout>} />
    <Route path="/implementation/completed/:id" element={<MemberLayout><ImplementationCompleted /></MemberLayout>} />
    
    {/* Ferramentas */}
    <Route path="/tools" element={<MemberLayout><Tools /></MemberLayout>} />
    <Route path="/tools/:id" element={<MemberLayout><ToolDetails /></MemberLayout>} />
    
    {/* Perfil */}
    <Route path="/profile" element={<MemberLayout><Profile /></MemberLayout>} />
    <Route path="/profile/edit" element={<MemberLayout><EditProfile /></MemberLayout>} />
    
    {/* Benefícios */}
    <Route path="/benefits" element={<MemberLayout><Benefits /></MemberLayout>} />
    
    {/* Sugestões */}
    <Route path="/suggestions" element={<MemberLayout><Suggestions /></MemberLayout>} />
    <Route path="/suggestions/:id" element={<MemberLayout><SuggestionDetails /></MemberLayout>} />
    <Route path="/suggestions/new" element={<MemberLayout><NewSuggestion /></MemberLayout>} />
    
    {/* Conquistas */}
    <Route path="/achievements" element={<MemberLayout><Achievements /></MemberLayout>} />
    
    {/* Onboarding */}
    <Route path="/onboarding" element={<OnboardingIntro />} />
    <Route path="/onboarding/personal-info" element={<PersonalInfo />} />
    <Route path="/onboarding/professional-data" element={<ProfessionalData />} />
    <Route path="/onboarding/business-context" element={<BusinessContext />} />
    <Route path="/onboarding/ai-experience" element={<AIExperience />} />
    <Route path="/onboarding/club-goals" element={<BusinessGoalsClub />} />
    <Route path="/onboarding/customization" element={<ExperiencePersonalization />} />
    <Route path="/onboarding/complementary" element={<ComplementaryInfo />} />
    <Route path="/onboarding/review" element={<Review />} />
    <Route path="/onboarding/trail-generation" element={<TrailGeneration />} />
  </Fragment>
);
