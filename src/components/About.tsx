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
          {/* Paragraph 1 — who / angle */}
          <p className={styles.prose}>
            <span className={styles.textLine}>
              I'm Faaz, a{' '}
              <span
                className={`${styles.highlight} ${styles.hovGif}`}
                onMouseEnter={() => onGifHover('/picto4.f8e89447.gif')}
                onMouseLeave={() => onGifHover(undefined)}
              >CS & Data Science student</span>
              {' '}at the University of Pittsburgh.
            </span>
            <span className={styles.textLine}>
              I build{' '}
              <span className={styles.italic}>ML systems</span>
              {' '}and study whether they actually do
            </span>
            <span className={styles.textLine}>
              what they claim to — through{' '}
              <span className={styles.bold}>interpretability</span>,{' '}
              <span className={styles.bold}>eval infrastructure</span>,
            </span>
            <span className={styles.textLine}>
              and systems engineering that makes AI behavior{' '}
              <span className={styles.underline}>verifiable</span>.
            </span>
          </p>

          {/* Paragraph 2 — what / projects */}
          <p className={styles.prose} style={{ marginTop: '24px' }}>
            <span className={styles.textLine}>
              I founded{' '}
              <span
                className={`${styles.bold} ${styles.hovGif}`}
                onMouseEnter={() => onGifHover('/picto1.cb395c31.gif')}
                onMouseLeave={() => onGifHover(undefined)}
              >
                <a href="https://labs.faazmohamed.com/" target="_blank" rel="noreferrer">Adventura Labs</a>
              </span>
              {' '}and built{' '}
              <span className={styles.underline}>VERITAS</span>:
            </span>
            <span className={styles.textLine}>
              a deterministic AI evaluation engine with cryptographic
            </span>
            <span className={styles.textLine}>
              audit trails — because high-stakes AI decisions
            </span>
            <span className={styles.textLine}>
              should be{' '}
              <span className={styles.italic}>reproducible, not just plausible</span>.
            </span>
          </p>

          {/* Paragraph 3 — the thread */}
          <p className={styles.prose} style={{ marginTop: '24px' }}>
            <span className={styles.textLine}>
              VexDB, LUMEN, VERITAS —
            </span>
            <span className={styles.textLine}>
              they're{' '}
              <span
                className={styles.hovGif}
                onMouseEnter={() => onGifHover('/picto2.40854ceb.gif')}
                onMouseLeave={() => onGifHover(undefined)}
              >the same question from different angles</span>:
            </span>
            <span className={styles.textLine}>
              can you build a system whose behavior you can
            </span>
            <span className={styles.textLine}>
              <span className={styles.italic}>actually</span>{' '}
              understand and trust?
            </span>
          </p>
        </div>

        {/* Stats + hobbies */}
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
              <span className={styles.statBig}>11+</span>
              <span className={styles.statSub}>Projects shipped</span>
            </div>
          </div>

          <div className={styles.hobbies}>
            {['Code', 'ML Research', 'Books', 'Football', 'Soccer', 'Badminton', 'Pickleball', 'Cinematography'].map(h => (
              <div key={h} className={styles.hobby}>{h}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}