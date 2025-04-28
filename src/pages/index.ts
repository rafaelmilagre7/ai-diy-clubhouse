
// Auth
export { default as Login } from './Auth';
export { default as Register } from './Auth';
export { default as ForgotPassword } from './Auth';
export { default as ResetPassword } from './Auth';

// Admin
export { default as AdminDashboard } from './admin/AdminDashboard';
export { default as SolutionEditor } from './admin/SolutionEditor';
export { default as SolutionsList } from './admin/SolutionsList';
export { default as AdminLearning } from './admin/learning';
export { default as CourseDetails } from './admin/learning/[id]';
export { default as ModuleDetails } from './admin/learning/module/[id]';

// Member
export { default as Dashboard } from './member/Dashboard';
export { default as ProfileSettings } from './member/Profile';
export { default as SolutionDetails } from './member/SolutionDetails';
export { default as SolutionImplementation } from './member/SolutionImplementation';
export { default as ImplementationConfirmation } from './member/ImplementationConfirmation';
export { default as ImplementationCompleted } from './member/ImplementationCompleted';
export { default as Achievements } from './member/Achievements';
export { default as Events } from './member/Events';

// Shared
export { default as Error404 } from './NotFound';
