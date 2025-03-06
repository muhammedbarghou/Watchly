import React from 'react';
import styles from './RoomsPage.module.css';

const RoomsPage = () => {
  return (
    <div className={styles.container}>
      <h1>Watchly</h1>
      <div className={styles.nav}>
        <p>Home</p>
        <p>Rooms</p>
        <p>Settings</p>
        <p>Chat</p>
      </div>
      <div className={styles.createRoom}>
        <h2>Create Room</h2>
        <input type="text" placeholder="Room Name" />
        <input type="text" placeholder="Video URL" />
        <input type="password" placeholder="Password (optional)" />
      </div>
      <div className={styles.joinRoom}>
        <h2>Join Room</h2>
        <input type="text" placeholder="Room ID" />
        <input type="password" placeholder="Password (optional)" />
        <button>Join Room</button>
      </div>
    </div>
  );
};

export default RoomsPage;