import React from 'react';
import { FolderUp } from 'lucide-react';

export const ProfilePicture = ({
  handleFileChange,
  prevStep,
  nextStep,
}) => (
  <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="flex flex-col justify-center items-center h-full w-full p-5">
    <h2 className="w-full text-center text-[#1f0909] font-bold text-xl md:text-2xl capitalize mb-5 dark:text-white">
      Step 3: Upload Profile Picture
    </h2>
    <div className="flex items-center justify-center w-full px-4 md:px-0">
      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full md:w-2/3 lg:w-1/3 h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-500">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <FolderUp className='w-10 h-10'/>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            SVG, PNG, JPG or GIF (MAX. 800x400px)
          </p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
      </label>
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
        className="inline-block rounded-md bg-red-600 text-white text-center text-base md:text-lg py-3 md:py-4 px-6 md:px-8 w-28 md:w-32 transition-all duration-500 cursor-pointer m-1 hover:bg-[#6A040F]"
      >
        <span className="relative inline-block transition-all duration-500">Next</span>
      </button>
    </div>
  </form>
);