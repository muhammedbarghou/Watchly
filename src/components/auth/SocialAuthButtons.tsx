import { Facebook } from 'lucide-react';
import { Button } from '../ui/button';

interface SocialAuthButtonsProps {
  onGoogleClick: () => Promise<void>;
  onFacebookClick: () => Promise<void>;
  disabled: boolean;
}

export function SocialAuthButtons({ onGoogleClick, onFacebookClick }: SocialAuthButtonsProps) {
  return (
    <div className="space-y-3">
      <Button 
        variant="secondary" 
        className="w-full"
        onClick={onGoogleClick}
      >
        <img 
          src="https://www.google.com/favicon.ico" 
          alt="Google" 
          className="w-5 h-5 mr-2"
        />
        Continue with Google
      </Button>

      <Button 
        variant="secondary" 
        className="w-full"
        onClick={onFacebookClick}
      >
        <Facebook className="w-5 h-5 mr-2" />
        Continue with Facebook
      </Button>

    </div>
  );
}