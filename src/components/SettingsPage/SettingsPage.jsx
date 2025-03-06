import React from 'react';
import styles from './SettingsPage.module.css';

const SettingsPage = () => {
  return (
    <div className={styles.container}>
      <h1>Watchly</h1>
      <div className={styles.settings}>
        <h2>Account</h2>
        <p>Notifications</p>
        <p>Privacy & Security</p>
        <p>Help & Support</p>
        <p>Legal & About</p>
      </div>
      <div className={styles.profile}>
        <h2>Profile Information</h2>
        <p><strong>deep boy</strong></p>
        <p>codersboyw@sysud.com</p>
      </div>
      <div className={styles.form}>
        <input type="text" placeholder="Full Name" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <input type="password" placeholder="Current Password" />
        <input type="password" placeholder="New Password" />
        <input type="password" placeholder="Confirm Password" />
        <button>Save Changes</button>
      </div>
    </div>
  );
};

export default SettingsPage;