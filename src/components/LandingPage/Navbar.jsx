import React from 'react'
import logo from '../../Imgs/logo.png'
import {useNavigate } from "react-router-dom";



function Navbar() {
  const navigate = useNavigate();
  const handleClick = () => {
      navigate("/Login");
  }
  return (
  <header className="bg-transparent border-b border-none h-1/5 z-10">
    <div className="px-4 mx-auto sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
            <div className="flex items-center flex-shrink-0">
                <img className="w-auto h-8" src={logo} alt="Logo" /> 
            </div>
            <div className="flex items-center justify-end space-x-5">
              <button onClick={handleClick} className='bg-transparent hover:bg-[#370617] text-white font-bold py-3 px-4 h-auto width-auto  rounded transition ease-in duration-200'>
                Log in
              </button>
              
            </div>
        </div>
    </div>
  </header>
  );
}
export default Navbar;
