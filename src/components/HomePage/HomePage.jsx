import React from 'react';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.container}>
      <h1>Watchly</h1>
      <div className={styles.nav}>
        <p>Rooms</p>
        <p>Settings</p>
        <p>Chat</p>
      </div>
      <div className={styles.roomInfo}>
        <p><strong>John Doe</strong></p>
        <p>Watching in movie-right</p>
      </div>
      <div className={styles.jainRoom}>
        <p><strong>Jain Room</strong></p>
        <p>Jane Smith - online</p>
        <p>Mike Johnson - offline</p>
      </div>
      <div className={styles.side}>
        <p>Side 1 of 5</p>
      </div>
    </div>
  );
};

export default HomePage;