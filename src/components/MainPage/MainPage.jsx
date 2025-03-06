import React from 'react';
import styles from './MainPage.module.css';

const MainPage = () => {
  return (
    <div className={styles.container}>
      <h1>Watchly</h1>
      <h2>Why Choose Watchly?</h2>
      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>Watch Together</h3>
          <p>Synchronize your viewing experience with friends and family in real time.</p>
        </div>
        <div className={styles.feature}>
          <h3>Live Chat</h3>
          <p>React and chat with your viewing partners as the story unfolds.</p>
        </div>
        <div className={styles.feature}>
          <h3>Private Rooms</h3>
          <p>Create private viewing rooms and invite your friends to join.</p>
        </div>
        <div className={styles.feature}>
          <h3>Watch Anywhere</h3>
          <p>Join from any device, anywhere in the world.</p>
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.links}>
          <div>
            <h4>Company</h4>
            <p>About</p>
            <p>Careers</p>
            <p>Press</p>
          </div>
          <div>
            <h4>Support</h4>
            <p>Help Center</p>
            <p>Contact</p>
            <p>Terms</p>
          </div>
          <div>
            <h4>Social</h4>
            <p>Twitter</p>
            <p>Instagram</p>
            <p>Facebook</p>
          </div>
          <div>
            <h4>Legal</h4>
            <p>Privacy</p>
            <p>Terms of Service</p>
            <p>Cookie Preferences</p>
          </div>
        </div>
        <p>© 2023 Watchly. All rights reserved.</p>
      </div>
    </div>
  );
};

export default MainPage;