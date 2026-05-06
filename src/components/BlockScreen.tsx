import React, { useEffect, useState } from 'react';
import styles from './BlockScreen.module.css';

const animatedVariants = [
  'fade',
  'slide',
  'zoom',
  'rotate',
  'color',
];

export default function BlockScreen() {
  const [variant, setVariant] = useState(animatedVariants[0]);
  const [show, setShow] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % animatedVariants.length);
      setVariant(animatedVariants[(index + 1) % animatedVariants.length]);
    }, 1800);
    return () => clearInterval(interval);
  }, [index]);

  useEffect(() => {
    const handleResize = () => {
      const aspect = window.innerWidth / window.innerHeight;
      setShow(aspect < 1 || window.innerWidth < 700);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!show) return null;

  return (
    <div className={styles.blockScreen}>
      <div className={styles.content}>
        <h1 className={styles.title}>Sorry, this website is not supported on your device!</h1>
        <p className={styles.subtitle}>
          Please visit on a supported device with a larger screen or switch to landscape mode.<br />
          Thanks for stopping by!
        </p>
        <div className={`${styles.animatedText} ${styles[variant]}`}>
          www.faazmohamed.com
        </div>
      </div>
    </div>
  );
}
