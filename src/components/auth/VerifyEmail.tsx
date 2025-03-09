import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';

export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, error, clearError } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  
  useEffect(() => {
    clearError();
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get('oobCode');
    
    if (!oobCode) {
      setVerifying(false);
      return;
    }
    
    async function verifyEmailWithCode() {
      try {
        await verifyEmail(oobCode);
        setVerified(true);
      } catch (error) {
        console.error('Error verifying email:', error);
      } finally {
        setVerifying(false);
      }
    }
    
    verifyEmailWithCode();
  }, [location, verifyEmail, clearError]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-md p-6 space-y-6 bg-gray-900 rounded-lg border border-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
          
          {verifying && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-netflix-red" />
              <p>Verifying your email address...</p>
            </div>
          )}
          
          {!verifying && verified && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <Alert className="bg-green-900/30 border-green-700">
                <AlertTitle className="text-green-400">Success!</AlertTitle>
                <AlertDescription className="text-green-300">
                  Your email has been successfully verified. You can now sign in to your account.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-netflix-red hover:bg-netflix-red/90"
              >
                Sign In
              </Button>
            </div>
          )}
          
          {!verifying && !verified && (
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <Alert variant="destructive">
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>
                  {error || "We couldn't verify your email address. The link may be invalid or expired."}
                </AlertDescription>
              </Alert>
              <div className="space-y-2 w-full">
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-netflix-red hover:bg-netflix-red/90"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                  variant="outline" 
                  className="w-full border-white/20 hover:bg-white/10"
                >
                  Create a new account
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}