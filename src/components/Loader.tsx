import { useEffect, useRef, useState } from 'react'
import styles from './Loader.module.css'

interface LoaderProps {
  onComplete: () => void
}

export default function Loader({ onComplete }: LoaderProps) {
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    let current = 0
    intervalRef.current = setInterval(() => {
      const step = current < 40 ? 2 : current < 75 ? 4 : current < 90 ? 6 : 8
      current = Math.min(current + step, 100)
      setPct(current)
      if (current >= 100) {
        clearInterval(intervalRef.current)
        setTimeout(() => {
          setDone(true)
          setTimeout(onComplete, 800)
        }, 300)
      }
    }, 40)
    return () => clearInterval(intervalRef.current)
  }, [onComplete])

  // Format: always 3 chars wide, right-aligned
  const pctStr = String(pct).padStart(3, ' ')

  return (
    <div className={`${styles.loader} ${done ? styles.loaderExit : ''}`}>
      <div className={styles.inner}>
        {/* Fix 2: wider viewBox so FM text isn't clipped */}
        <div className={styles.logo}>
          <svg viewBox="0 0 200 36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <text x="100" y="30" fontFamily="serif" fontSize="32" fontWeight="700" letterSpacing="-1" textAnchor="middle">FM</text>
          </svg>
        </div>
        {/* Fix 1: bar and percent are siblings in a centered column — no width mismatch */}
        <div className={styles.barWrap}>
          <div className={styles.bar}>
            <div className={styles.fill} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.percent}>[{pctStr}%]</div>
        </div>
      </div>
    </div>
  )
}
