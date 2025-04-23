
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { onboardingRoutes } from './routes/onboarding.routes';
import { AuthProvider } from './contexts/auth';
import ErrorBoundary from './components/ErrorBoundary';
import RootRedirect from './components/routing/RootRedirect';

// Importando rota de dashboard (placeholder)
const Dashboard = () => <div className="p-8">Dashboard - Página em construção</div>;
const Login = () => <div className="p-8">Login - Página em construção</div>;

function App() {
  return (
    <ErrorBoundary>
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
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
