import { useEffect, useState } from 'react'
import styles from './EasterEgg.module.css'

interface EasterEggProps {
  type: 'konami' | 'logo' | null
  onClose: () => void
}

const KONAMI_MSG = [
  '↑↑↓↓←→←→BA',
  'You found the Konami Code!',
  '🎮 +30 lives granted',
  '(just kidding, but nice moves)',
]

const LOGO_MESSAGES = [
  'nice click',
  'still going?',
  'persistence noted',
  'ok you found it...',
  '✨ SECRET UNLOCKED ✨',
  'you broke the site (just kidding)',
]

export default function EasterEgg({ type, onClose }: EasterEggProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (type) {
      setShow(true)
      const t = setTimeout(() => { setShow(false); setTimeout(onClose, 400) }, 3500)
      return () => clearTimeout(t)
    }
  }, [type, onClose])

  if (!type) return null

  return (
    <div className={`${styles.overlay} ${show ? styles.overlayShow : ''}`} onClick={() => { setShow(false); setTimeout(onClose, 400) }}>
      <div className={styles.modal}>
        {type === 'konami' && (
          <>
            <div className={styles.code}>{KONAMI_MSG[0]}</div>
            <div className={styles.title}>{KONAMI_MSG[1]}</div>
            <div className={styles.sub}>{KONAMI_MSG[2]}</div>
            <div className={styles.tiny}>{KONAMI_MSG[3]}</div>
          </>
        )}
        {type === 'logo' && (
          <>
            <div className={styles.emoji}>🎯</div>
            <div className={styles.title}>Easter egg found!</div>
            <div className={styles.sub}>You clicked the logo enough times.</div>
            <div className={styles.tiny}>Try the Konami code too: ↑↑↓↓←→←→BA</div>
          </>
        )}
        <div className={styles.dismiss}>click to dismiss</div>
      </div>
    </div>
  )
}
