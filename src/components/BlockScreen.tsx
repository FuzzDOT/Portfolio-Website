import React, { useEffect, useState, useCallback } from 'react';
import styles from './BlockScreen.module.css';

const URL = 'https://www.faazmohamed.com';

type ShareState = 'idle' | 'copied' | 'shared';

export default function BlockScreen() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shareState, setShareState] = useState<ShareState>('idle');
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    );
  }, []);

  useEffect(() => {
    const check = () => {
      const aspect = window.innerWidth / window.innerHeight;
      setShow(aspect < 1 || window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (show) {
      const t = setTimeout(() => setMounted(true), 40);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [show]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(URL);
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2200);
    } catch {
      // fallback
      const el = document.createElement('input');
      el.value = URL;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2200);
    }
  }, []);

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: 'Faaz Mohamed — CS & AI Engineer',
        text: 'Check out my portfolio',
        url: URL,
      });
      setShareState('shared');
      setTimeout(() => setShareState('idle'), 2200);
    } catch {
      // user cancelled — do nothing
    }
  }, []);

  if (!show) return null;

  return (
    <div className={`${styles.blockScreen} ${mounted ? styles.blockScreenVisible : ''}`}>
      {/* Grain */}
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.inner}>
        {/* FM wordmark */}
        <div className={styles.wordmark}>FM</div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Heading */}
        <h1 className={styles.heading}>
          Desktop<br />only.
        </h1>

        {/* Body */}
        <p className={styles.body}>
          This portfolio is designed for a larger screen.
          Send it to yourself and revisit on desktop.
        </p>

        {/* URL tag */}
        <div className={styles.urlTag}>
          <span className={styles.urlDot} />
          <span className={styles.urlText}>faazmohamed.com</span>
        </div>

        {/* Share actions */}
        <div className={styles.actions}>
          {canNativeShare && (
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleNativeShare}
              aria-label="Share this page"
            >
              <ShareIcon />
              {shareState === 'shared' ? 'Shared!' : 'Share'}
            </button>
          )}
          <button
            className={`${styles.btn} ${shareState === 'copied' ? styles.btnSuccess : styles.btnSecondary}`}
            onClick={handleCopy}
            aria-label="Copy link"
          >
            {shareState === 'copied' ? <CheckIcon /> : <CopyIcon />}
            {shareState === 'copied' ? 'Copied!' : 'Copy link'}
          </button>
        </div>

        {/* Bottom meta */}
        <div className={styles.meta}>
          CS & Data Science · Pitt · AI Systems
        </div>
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 1L13 5M13 5L9 9M13 5H5C3.34 5 2 6.34 2 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="4" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 4V2.5A1.5 1.5 0 0 1 5.5 1H11.5A1.5 1.5 0 0 1 13 2.5V8.5A1.5 1.5 0 0 1 11.5 10H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
