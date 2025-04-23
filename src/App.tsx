
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { onboardingRoutes } from './routes/onboarding.routes';
import { AuthProvider } from './contexts/auth';
import ErrorBoundary from './components/ErrorBoundary';
import RootRedirect from './components/routing/RootRedirect';
import { LoggingProvider } from './hooks/useLogging.tsx';
import Dashboard from './pages/member/Dashboard';
import MemberLayout from './components/layout/MemberLayout';

// Placeholder para página de login
const Login = () => <div className="p-8">Login - Página em construção</div>;

function App() {
  return (
    <ErrorBoundary>
      <LoggingProvider>
        <AuthProvider>
          <Routes>
            {/* Rota raiz - redireciona com base no estado de autenticação */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Rotas de autenticação */}
            <Route path="/login" element={<Login />} />
            
            {/* Rotas de onboarding */}
            {onboardingRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
            
            {/* Rotas principais */}
            <Route 
              path="/dashboard" 
              element={
                <MemberLayout>
                  <Dashboard />
                </MemberLayout>
              } 
            />
          </Routes>
          
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </LoggingProvider>
    </ErrorBoundary>
  );
}

export default App;
