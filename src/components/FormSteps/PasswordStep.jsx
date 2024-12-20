import React from 'react';
import { Lock } from 'lucide-react';

export const PasswordStep = ({
  formData,
  errors,
  passwordValidations,
  handleChange,
  prevStep,
  nextStep,
}) => (
  <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="flex flex-col justify-center items-center h-full w-full p-5">
    <h2 className="w-full text-center text-[#1f0909] font-bold text-xl md:text-2xl capitalize mb-5 dark:text-white">
      Step 2: Set Password
    </h2>
    <div className="w-full md:w-2/3 lg:w-1/3 flex flex-col gap-5 items-center">
      <div id='password' className="relative w-full">
        <Lock className='absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400'/>
        <input 
          type="password" 
          value={formData.password} 
          onChange={handleChange("password")} 
          placeholder="Enter your password" 
          className="w-full pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-red-500 rounded"
        />
      </div>
      <div id='confirmPassword' className="relative w-full">
        <Lock className='absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400'/>
        <input 
          type="password" 
          value={formData.confirmPassword} 
          onChange={handleChange("confirmPassword")} 
          placeholder="Confirm your password" 
          className="w-full pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-red-500 rounded"
        />
      </div>
      <div className="w-full md:w-[500px] h-auto text-base leading-5 flex flex-col gap-4">
        <div className={`rounded-md p-4 ${
          Object.values(passwordValidations).every(Boolean) 
            ? 'bg-green-100' 
            : 'bg-red-100'
        } transition-colors duration-300`}>
          <div className="flex flex-col ml-5">
            <p className={`${
              Object.values(passwordValidations).every(Boolean)
                ? 'text-green-700'
                : 'text-red-800'
            } text-sm leading-5 font-bold`}>
              {Object.values(passwordValidations).every(Boolean)
                ? "Your password is strong!"
                : "Your password isn't strong enough"}
            </p>
            <div className="mt-2 text-sm leading-5">
              <ul className="pl-5 mt-1 list-square" role="list">
                <li className={passwordValidations.length ? 'text-green-700' : 'text-red-600'}>
                  Password must be longer than 8 characters.
                </li>
                <li className={passwordValidations.uppercase ? 'text-green-700' : 'text-red-600'}>
                  Must contain at least one uppercase letter.
                </li>
                <li className={passwordValidations.number ? 'text-green-700' : 'text-red-600'}>
                  Must include at least one number.
                </li>
                <li className={passwordValidations.specialChar ? 'text-green-700' : 'text-red-600'}>
                  Must have at least one special character.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="flex justify-center items-center gap-2.5 w-full mt-5">
      <button
        onClick={(e) => { e.preventDefault(); prevStep(); }}
        className="inline-block hover:bg-[#6A040F] rounded-md bg-red-600 text-white text-center text-base md:text-lg py-3 md:py-4 px-6 md:px-8 w-28 md:w-32 transition-all duration-500 cursor-pointer m-1"
        type="button"
      >
        <span className="relative inline-block transition-all duration-500">Back</span>
      </button>
      <button
        type="submit"
        className="inline-block rounded-md bg-red-600 text-white text-center text-base md:text-lg py-3 md:py-4 px-6 md:px-8 w-28 md:w-32 transition-all duration-500 cursor-pointer m-1 disabled:opacity-50 hover:bg-[#6A040F]"
        disabled={
          !formData.password ||
          !formData.confirmPassword ||
          formData.password !== formData.confirmPassword ||
          !Object.values(passwordValidations).every(Boolean)
        }
      >
        <span className="relative inline-block transition-all duration-500">Next</span>
      </button>
    </div>
  </form>
);