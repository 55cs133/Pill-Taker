import React from 'react';

import googleImage from '@/assets/google.png';
import styles from '@/components/GoogleButton/GoogleButton.module.css';

export function GoogleButton({ onClick }) {
  return (
    <button className={styles.button} onClick={onClick}>
      <span>
        Se connecter à Google
      </span>
      <img src={googleImage} alt="google icon" className={styles.logo} />
    </button>
  );
}
