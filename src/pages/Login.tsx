
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { FcGoogle } from "react-icons/fc";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const { signIn, signInAsMember, signInAsAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [authDetails, setAuthDetails] = useState<{provider: string, redirectUrl: string} | null>(null);
  const [authProviders, setAuthProviders] = useState<string[]>([]);

  // Capture current URL for debugging
  useEffect(() => {
    setCurrentUrl(window.location.href);
    
    // Check which authentication providers are configured
    const checkAuthProviders = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error) {
          setAuthProviders(["email"]);
        }
      } catch (err) {
        console.error("Error checking authentication providers:", err);
      }
    };
    
    checkAuthProviders();
  }, []);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAuthDetails({
        provider: 'google',
        redirectUrl: `${window.location.origin}`
      });
      await signIn();
    } catch (err) {
      console.error("Error logging in:", err);
      setError("An error occurred during login. Please check if Supabase settings are correct.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUserLogin = async (loginFn: () => Promise<void>, userType: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await loginFn();
    } catch (err: any) {
      console.error(`Error logging in as ${userType}:`, err);
      setError(err?.message || `An error occurred logging in as ${userType}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            className="mx-auto h-20 w-auto"
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            DIY Platform
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Implement AI solutions with autonomy and success
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {authDetails && (
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              <p><strong>Login attempt:</strong> {authDetails.provider}</p>
              <p><strong>Redirect URL:</strong> {authDetails.redirectUrl}</p>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <Button 
              onClick={handleSignIn} 
              disabled={isLoading}
              className="group relative w-full flex justify-center py-6 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-viverblue shadow"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FcGoogle className="h-5 w-5" />
              </span>
              {isLoading ? "Loading..." : "Sign in with Google"}
            </Button>
            
            {/* Test login buttons */}
            <Button 
              className="w-full py-6 text-base bg-blue-600 hover:bg-blue-700"
              onClick={() => handleTestUserLogin(signInAsMember, "member")}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Login as Member (Test)"}
            </Button>
            
            <Button 
              className="w-full py-6 text-base bg-purple-600 hover:bg-purple-700"
              onClick={() => handleTestUserLogin(signInAsAdmin, "admin")}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Login as Admin (Test)"}
            </Button>
            
            <div className="text-center mt-2">
              <Link 
                to="/" 
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to home page
              </Link>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mt-8">
            <p>
              Exclusive access for VIVER DE IA Club members.
            </p>
            <p className="mt-2">
              Not a member yet?{" "}
              <a
                href="https://viverdeia.ai"
                className="font-medium text-viverblue hover:text-viverblue-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn about the Club
              </a>
            </p>
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-4">
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="font-medium">Configuration information:</p>
              <p className="break-all mt-1">
                Current URL: {currentUrl}
              </p>
              <p className="break-all mt-1">
                Origin: {window.location.origin}
              </p>
              <p className="mt-1 text-xs">
                ⚠️ Add these URLs as Redirect URLs in Supabase
              </p>
              <p className="mt-2 text-xs">
                Active authentication providers: {authProviders.join(', ') || 'None detected'}
              </p>
            </div>
            <p className="mt-4">
              For testing purposes, disable email confirmation in Supabase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
