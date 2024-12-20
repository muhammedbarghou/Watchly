export interface FormData {
  username: string;
  email: string;
  phone: string;
  dob: string;
  password: string;
  confirmPassword: string;
  profilePicture: File | null;
  agreeTerms: boolean;
}

export interface StepState {
  stepsItems: string[];
  currentStep: number;
}

export interface ValidationState {
  length: boolean;
  uppercase?: boolean;
  number?: boolean;
  specialChar?: boolean;
}

export interface FormErrors {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  profilePicture?: string;
}