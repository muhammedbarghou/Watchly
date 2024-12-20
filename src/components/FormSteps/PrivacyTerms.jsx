import React from 'react';

export const PrivacyTerms = ({
  formData,
  handleCheckboxChange,
  handleSubmit,
  prevStep,
}) => (
  <form className="flex flex-col justify-center items-center h-full w-full p-5">
    <h2 className="w-full text-center text-[#1f0909] font-bold text-2xl capitalize mb-5 dark:text-white">
      Step 4: Agree to Privacy Terms
    </h2>
    <div className="w-[60%] flex flex-row items-center justify-center py-8">
      <label className="flex items-center cursor-pointer relative" htmlFor="check-2">
        <input 
          type="checkbox"
          checked={formData.agreeTerms}
          onChange={handleCheckboxChange}
          className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800 dark:border-slate-600 dark:checked:bg-slate-600 dark:checked:border-slate-600"
          id="check-2" 
        />
        <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"
            stroke="currentColor" strokeWidth="1">
            <path fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd">
            </path>
          </svg>
        </span>
      </label>
      <label className="cursor-pointer ml-2 text-slate-600 text-sm dark:text-slate-200" htmlFor="check-2">
        I agree to the privacy terms
      </label>              
    </div>
    <div className="flex justify-center items-center gap-2.5 w-full mt-5">
      <button
        onClick={prevStep}
        className="inline-block hover:bg-[#6A040F] rounded-md bg-red-600 text-white text-center text-lg py-4 px-8 w-32 transition-all duration-500 cursor-pointer m-1"
        type="button"
      >
        <span className="relative inline-block transition-all duration-500">Back</span>
      </button>
      <button
        onClick={handleSubmit}
        className="inline-block rounded-md bg-red-600 text-white text-center text-lg py-4 px-8 w-32 transition-all duration-500 cursor-pointer m-1 disabled:opacity-50 hover:bg-[#6A040F]"
        type="button"
        disabled={!formData.agreeTerms}
      >
        <span className="relative inline-block transition-all duration-500">Submit</span>
      </button>
    </div>
  </form>
);