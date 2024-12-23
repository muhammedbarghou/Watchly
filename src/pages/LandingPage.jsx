import React from 'react';
import Navbar from '../components/LandingPage/Navbar.jsx'
import Mainsection from '../components/LandingPage/MainSection.jsx'
import Features from '../components/LandingPage/Features.jsx'




function LandingPage () {        
    return (
    <section className='h-auto w-auto bg-gradient-to-r from-[#03071e] via-[#6a040f] to-[#d00000] overflow-hidden '>
      <Navbar/>
      <Mainsection/>
      <Features/>
    </section>
    )
}
export default LandingPage;