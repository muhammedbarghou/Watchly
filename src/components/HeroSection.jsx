import React from "react";
// import "./HeroSection.css";

function HeroSection() {
  return (
    <section className="hero-section">
      <h1 className="hero-title">Watch Together, Anywhere</h1>
      <p className="hero-subtitle">
        Join millions of people watching their favorite content together. Share moments, react in real-time.
      </p>
      <div className="hero-buttons">
        <button className="hero-button get-started">Get Started</button>
        <button className="hero-button sign-in">Sign In</button>
      </div>
    </section>
  );
}

export default HeroSection;
