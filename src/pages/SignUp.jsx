import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validatePassword, validateUsername, validateEmail, validatePhone } from '../utils/validations';
import { StepIndicator } from '../components/FormSteps/StepIndicator';
import { PersonalInfo } from '../components/FormSteps/PersonalInfo';
import { PasswordStep } from '../components/FormSteps/PasswordStep';
import { ProfilePicture } from '../components/FormSteps/ProfilePicture';
import { PrivacyTerms } from '../components/FormSteps/PrivacyTerms';
import { Success } from '../components/FormSteps/Success';
import { ThemeToggle } from '../components/theme/ThemeToggle';
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";



const SignUp = () => {
  const [step, setStep] = useState({
    stepsItems: ["Personal Information", "Password", "Profile Picture", "Terms and Conditions"],
    currentStep: 1
  });
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
    profilePicture: null,
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const navigate = useNavigate();

  const nextStep = () => setStep((prevStep) => ({
    ...prevStep,
    currentStep: (prevStep.currentStep < 5 ? prevStep.currentStep + 1 : prevStep.currentStep)
  }));

  const prevStep = () => setStep((prevStep) => ({
    ...prevStep,
    currentStep: (prevStep.currentStep > 1 ? prevStep.currentStep - 1 : prevStep.currentStep)
  }));

  const handleChange = (input) => (e) => {
    const value = e.target.value;
    console.log(`Handling change for ${input}:`, value);
    
    if (input === 'username') {
      const cleanUsername = value.toLowerCase().replace(/[^a-z]/g, '');
      const usernameValidation = validateUsername(cleanUsername);
      console.log('Username validation:', usernameValidation);
      
      setErrors((prev) => {
        const newErrors = {
          ...prev,
          username: !usernameValidation.length ? 'Username must be between 8 and 15 characters.' : '',
        };
        console.log('New errors after username validation:', newErrors);
        return newErrors;
      });
      
      setFormData((prev) => ({ ...prev, username: cleanUsername }));
      return;
    }
    
    if (input === 'password') {
      setPasswordValidations(validatePassword(value));
    }
    
    if (input === 'email') {
      const isValid = validateEmail(value);
      console.log('Email validation:', isValid);
      setErrors((prev) => {
        const newErrors = {
          ...prev,
          email: !isValid ? 'Invalid email format.' : '',
        };
        console.log('New errors after email validation:', newErrors);
        return newErrors;
      });
    }
    
    if (input === 'phone') {
      const isValid = validatePhone(value);
      console.log('Phone validation:', isValid);
      setErrors((prev) => {
        const newErrors = {
          ...prev,
          phone: !isValid ? 'Phone number must be 10 digits.' : '',
        };
        console.log('New errors after phone validation:', newErrors);
        return newErrors;
      });
    }
    
    setFormData((prev) => ({ ...prev, [input]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, profilePicture: e.target.files[0] }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({ ...prev, agreeTerms: e.target.checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.agreeTerms) {
      alert("You must agree to the terms and conditions.");
      return;
    }
  
    try {
      let profilePictureURL = "";
  
      // If there's a profile picture, upload it to Firebase Storage
      if (formData.profilePicture) {
        const storageRef = ref(storage, `profilePictures/${formData.username}`);
        await uploadBytes(storageRef, formData.profilePicture);
        profilePictureURL = await getDownloadURL(storageRef);
      }
  
      // Add user data to Firestore
      await addDoc(collection(db, "users"), {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        birthday: formData.dob,
        profilePictureURL,
        createdAt: new Date(),
      });
  
      alert("User registered successfully!");
      setStep((prev) => ({ ...prev, currentStep: 5 }));
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to register user.");
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="flex justify-center flex-col items-center h-screen w-screen">
      <nav className='flex justify-between items-center w-full h-16 bg-white dark:bg-gray-950 border-b border-gray-800 dark:border-gray-100 px-4'>
        <button onClick={handleBack} className='bg-[#d00000] text-white text-lg py-2 px-4 rounded-md'>Back</button>
        <ThemeToggle />
      </nav>
      <div className="flex items-center flex-col bg-white h-screen w-full dark:bg-gray-950 relative">
        <StepIndicator stepsItems={step.stepsItems} currentStep={step.currentStep} />
        <main className="flex flex-col justify-center items-center h-full w-full">
          {step.currentStep === 1 && (
            <PersonalInfo
              formData={formData}
              errors={errors}
              handleChange={handleChange}
              nextStep={nextStep}
            />
          )}
          {step.currentStep === 2 && (
            <PasswordStep
              formData={formData}
              errors={errors}
              passwordValidations={passwordValidations}
              handleChange={handleChange}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          )}
          {step.currentStep === 3 && (
            <ProfilePicture
              handleFileChange={handleFileChange}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          )}
          {step.currentStep === 4 && (
            <PrivacyTerms
              formData={formData}
              handleCheckboxChange={handleCheckboxChange}
              handleSubmit={handleSubmit}
              prevStep={prevStep}
            />
          )}
          {step.currentStep === 5 && (
            <Success handleBack={handleBack} />
          )}
        </main>
      </div>
    </div>
  );
};

export default SignUp;