import { useRef, useState, useEffect } from 'react'
import styles from './About.module.css'

interface AboutProps {
  onGifHover: (src?: string) => void
}

export default function About({ onGifHover }: AboutProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) io.observe(sectionRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={`${styles.about} ${visible ? styles.visible : ''}`}>
      <div className={styles.kicker}>About</div>

      <div className={styles.grid}>
        {/* Prose */}
        <div className={styles.proseCol}>
          <p className={styles.prose}>
            <span className={styles.textLine}>
              I'm Faaz, a{' '}
              <span
                className={`${styles.highlight} ${styles.hovGif}`}
                onMouseEnter={() => onGifHover('/assets/picto4.f8e89447.gif')}
                onMouseLeave={() => onGifHover(undefined)}
              >CS & Data Science student</span>
              {' '}at the University of Pittsburgh
            </span>
            <span className={styles.textLine}>
              specializing in AI systems, machine learning research,
            </span>
            <span className={styles.textLine}>
              and{' '}
              <span className={styles.italic}>high-performance</span>
              {' '}software engineering.
            </span>
          </p>

          <p className={styles.prose} style={{ marginTop: '24px' }}>
            <span className={styles.textLine}>
              I founded{' '}
              <span
                className={`${styles.bold} ${styles.hovGif}`}
                onMouseEnter={() => onGifHover('/assets/picto1.cb395c31.gif')}
                onMouseLeave={() => onGifHover(undefined)}
              >
                <a href="https://fuzzdot.github.io/fmStudio/" target="_blank" rel="noreferrer">FM Studio</a>
              </span>
              {' '}and am building
            </span>
            <span className={styles.textLine}>
              <span className={styles.underline}>VERITAS</span>,
              a deterministic AI evaluation engine
            </span>
            <span className={styles.textLine}>
              with cryptographic auditability for high-stakes decisions.
            </span>
          </p>

          <p className={styles.prose} style={{ marginTop: '24px' }}>
            <span className={styles.textLine}>
              In my free time: tennis, pickleball, soccer, reading,
            </span>
            <span className={styles.textLine}>
              filming, editing, and{' '}
              <span
                className={styles.hovGif}
                onMouseEnter={() => onGifHover('/assets/picto2.40854ceb.gif')}
                onMouseLeave={() => onGifHover(undefined)}
              >building things that matter.</span>
            </span>
          </p>
        </div>

        {/* Fix 6: stats box — GPA removed, NSF first, then grad year with live pill */}
        <div className={styles.rightCol}>
          <div className={styles.statsBlock}>
            <div className={styles.statRow}>
              <span className={styles.statBig}>NSF</span>
              <span className={styles.statSub}>Research Fellow 2026</span>
            </div>
            <div className={styles.statRow}>
              <div className={styles.gradRow}>
                <span className={styles.statBig}>2028</span>
                <span className={styles.livePill}>
                  <span className={styles.livePip} />
                  Sophomore
                </span>
              </div>
              <span className={styles.statSub}>Expected graduation · Univ. of Pittsburgh</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statBig}>6+</span>
              <span className={styles.statSub}>Sites shipped</span>
            </div>
          </div>

          <div className={styles.hobbies}>
            {['Code', 'ML Research', 'Books', 'Tennis', 'Pickleball', 'Soccer', 'Filming', 'Editing'].map(h => (
              <div key={h} className={styles.hobby}>{h}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
