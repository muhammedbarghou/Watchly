import React from 'react';
import logo from '../assets/Watchly.png';
import '../styles/Navbar.css'
function Navbar() {
    return(
        
        <nav className="navbar">
          <div className="navbar-logo">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <ul className="navbar-links">
            <li><a href="/">Home Page</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </nav>
        
    )
}
export default Navbar;