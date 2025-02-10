import React from "react";
// import "./FeatureCard.css";

function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card">
      <div className="icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
}

export default FeatureCard;
