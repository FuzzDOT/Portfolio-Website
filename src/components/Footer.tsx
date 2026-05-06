import { useRef, useEffect, useState } from 'react'
import styles from './Footer.module.css'

interface FooterProps {
  onLinkHover: (v: boolean) => void
}

export default function Footer({ onLinkHover }: FooterProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  return (
    <footer ref={ref} className={`${styles.footer} ${visible ? styles.visible : ''}`}>
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <div className={styles.kicker}>Contact</div>
          <h2 className={styles.heading}>LET'S<br />BUILD</h2>
          <p className={styles.sub}>
            Drop a line with project details.<br />
            I'll respond fast.
          </p>
        </div>

        <div className={styles.topRight}>
          <div className={styles.contactLinks}>
            <a
              href="mailto:contact@faazmohamed.com"
              className={styles.contactCard}
              onMouseEnter={() => onLinkHover(true)}
              onMouseLeave={() => onLinkHover(false)}
            >
              <span className={styles.cardLabel}>Email</span>
              <span className={styles.cardValue}>contact@faazmohamed.com</span>
              <span className={styles.cardArrow}>↗</span>
            </a>
            <a
              href="https://www.linkedin.com/in/faazmohamed/"
              target="_blank" rel="noreferrer"
              className={styles.contactCard}
              onMouseEnter={() => onLinkHover(true)}
              onMouseLeave={() => onLinkHover(false)}
            >
              <span className={styles.cardLabel}>LinkedIn</span>
              <span className={styles.cardValue}>/in/faazmohamed</span>
              <span className={styles.cardArrow}>↗</span>
            </a>
            <a
              href="https://github.com/FuzzDOT"
              target="_blank" rel="noreferrer"
              className={styles.contactCard}
              onMouseEnter={() => onLinkHover(true)}
              onMouseLeave={() => onLinkHover(false)}
            >
              <span className={styles.cardLabel}>GitHub</span>
              <span className={styles.cardValue}>FuzzDOT</span>
              <span className={styles.cardArrow}>↗</span>
            </a>
            <a
              href="https://www.instagram.com/fuzz_dot/"
              target="_blank" rel="noreferrer"
              className={styles.contactCard}
              onMouseEnter={() => onLinkHover(true)}
              onMouseLeave={() => onLinkHover(false)}
            >
              <span className={styles.cardLabel}>Instagram</span>
              <span className={styles.cardValue}>@fuzz_dot</span>
              <span className={styles.cardArrow}>↗</span>
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomLeft}>
          <span>© Faaz Mohamed 2026</span>
          <span className={styles.sep}>·</span>
          <span>Pittsburgh, PA</span>
          <span className={styles.sep}>·</span>
          <span>Will not need visa sponsorship</span>
        </div>
        <div className={styles.bottomRight}>
          <span className={styles.builtWith}>Built with React + TypeScript</span>
        </div>
      </div>
    </footer>
  )
}
