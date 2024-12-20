export interface AuthFormData {
  email: string;
  password: string;
}

export interface FeatureItemProps {
  text: string;
}

export interface SocialButtonProps {
  provider: 'google' | 'facebook';
  children: React.ReactNode;
}