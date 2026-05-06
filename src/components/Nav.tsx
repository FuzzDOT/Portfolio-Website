import { useState, useEffect } from 'react'
import { MOODS, type Mood } from '../data'
import styles from './Nav.module.css'

interface NavProps {
  mood: Mood
  onMoodChange: (m: Mood) => void
  logoClickCount: number
  onLogoClick: () => void
}

const MOOD_LABELS: Record<Mood, string> = {
  light: '☀ light',
  dark: '● dark',
  blue: '◈ blue',
  green: '◉ green',
  red: '⬟ red',
  gold: '◆ gold',
}

export default function Nav({ mood, onMoodChange, logoClickCount, onLogoClick }: NavProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const cycleMood = () => {
    const idx = MOODS.indexOf(mood)
    onMoodChange(MOODS[(idx + 1) % MOODS.length])
  }

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <button
        className={styles.logo}
        onClick={onLogoClick}
        title={logoClickCount >= 5 ? '🤫 Keep going...' : 'Home'}
        aria-label="Back to top"
      >
        <LogoSVG />
      </button>

      <div className={styles.center}>
        <button
          className={styles.moodBtn}
          onClick={cycleMood}
          aria-label="Change the mood"
        >
          <span className={styles.moodDot} />
          <span>{MOOD_LABELS[mood]}</span>
        </button>
      </div>

      <div className={styles.right}>
        <a href="mailto:contact@faazmohamed.com" className={styles.contactBtn}>
          CONTACT
        </a>
      </div>
    </nav>
  )
}

function LogoSVG() {
  return (
    // Fix 2: viewBox wide enough to contain "FM" at fontSize 26 — roughly 38x28
    <svg width="38" height="28" viewBox="0 0 38 28" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <text x="0" y="24" fontFamily="serif" fontSize="26" fontWeight="900" fill="currentColor" letterSpacing="-1">FM</text>
    </svg>
  )
}
