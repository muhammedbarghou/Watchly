import React from "react";
import FeatureCard from "./FeatureCard";
// import "./FeaturesSection.css";

function FeaturesSection() {
  return (
    <section className="features-section">
      <h2 className="section-title">Why Choose Watchly?</h2>
      <div className="features">
        <FeatureCard
          icon="📺"
          title="Watch Together"
          description="Synchronize your viewing experience with friends and family in real-time."
        />
        <FeatureCard
          icon="💬"
          title="Live Chat"
          description="React and chat with your viewing partners as the story unfolds."
        />
        <FeatureCard
          icon="👥"
          title="Private Rooms"
          description="Create private viewing rooms and invite your friends to join."
        />
        <FeatureCard
          icon="🌍"
          title="Watch Anywhere"
          description="Join from any device, anywhere in the world."
        />
      </div>
    </section>
  );
}

export default FeaturesSection;

// const ListStagiaire = () => {
//   const stagiaires = useSelector((state)=> state)
//   return(
//     <div className={styles.conteiner}>
//         {stagiaires.map((stagiaire, key) => <Stagiare key={key} image={stagiaire.image} nom={stagiaire.nom} /> )}
//     </div>

//   )
// }

