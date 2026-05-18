import { useState, useEffect, useRef } from 'react'
import { HELLO_GIFS } from '../data'
import styles from './Hero.module.css'

interface HeroProps {
  onGifChange: (src?: string) => void
  onLinkHover: (v: boolean) => void
}

const DATE_STR = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })

export default function Hero({ onGifChange, onLinkHover }: HeroProps) {
  const [currentGif, setCurrentGif] = useState(0)
  const [gifVisible, setGifVisible] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Fix 3: slowed from 350ms -> 1400ms
  const startGifCycle = () => {
    setGifVisible(true)
    setCurrentGif(Math.floor(Math.random() * HELLO_GIFS.length))
    intervalRef.current = setInterval(() => {
      setCurrentGif(i => (i + 1) % HELLO_GIFS.length)
    }, 1400)
  }

  const stopGifCycle = () => {
    setGifVisible(false)
    clearInterval(intervalRef.current)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  return (
    <section className={`${styles.hero} ${mounted ? styles.mounted : ''}`}>
      {/* Fix 1: cornerTL (2007) and cornerTR (GPA) removed */}
      <div className={styles.cornerBL}>
        <nav className={styles.social}>
          <a href="https://www.instagram.com/fuzz_dot/" target="_blank" rel="noreferrer"
             onMouseEnter={() => onLinkHover(true)} onMouseLeave={() => onLinkHover(false)}>
            Instagram
          </a>
          <a href="https://www.linkedin.com/in/faazmohamed/" target="_blank" rel="noreferrer"
             onMouseEnter={() => onLinkHover(true)} onMouseLeave={() => onLinkHover(false)}>
            LinkedIn
          </a>
          <a href="https://github.com/FuzzDOT" target="_blank" rel="noreferrer"
             onMouseEnter={() => onLinkHover(true)} onMouseLeave={() => onLinkHover(false)}>
            GitHub
          </a>
        </nav>
      </div>
      <div className={styles.cornerBR}>
        <span className={styles.cornerNum}>{DATE_STR}</span>
      </div>

      <div className={styles.headingWrap}>
        <h1 className={styles.heading}>
          <span className={styles.line}><span className={styles.lineInner}>CS &</span></span>
          <span className={styles.line}><span className={styles.lineInner}>ML</span></span>
          <span className={styles.line}><span className={styles.lineInner}>ENGINEER</span></span>
        </h1>

        <div className={styles.subtitleRow}>
          <div className={styles.subtitleLeft}>
            <span className={styles.nameTag}>Faaz Mohamed</span>
            <span className={styles.subtitleText}>
              CS & Data Science @ Pitt · NSF Research Fellow · ML Systems Engineer 
            </span>
          </div>

          <div
            className={styles.hiZone}
            onMouseEnter={startGifCycle}
            onMouseLeave={stopGifCycle}
          >
            <div className={styles.hiInner}>
              <div className={styles.hiDot} />
              <span className={styles.hiText}>I'M FAAZ</span>
            </div>
            <div className={`${styles.gifCarousel} ${gifVisible ? styles.gifCarouselVisible : ''}`}>
              {HELLO_GIFS.map((g, i) => (
                <img
                  key={g.src}
                  src={g.src}
                  alt={g.alt}
                  className={`${styles.gif} ${i === currentGif ? styles.gifActive : ''}`}
                  loading="lazy"
                />
              ))}
            </div>
          </div>

          <div className={styles.subtitleRight}>
            <div className={styles.stackLine}>ML</div>
            <div className={styles.stackLine}>& WEB</div>
            <div className={styles.stackLine}>DEV</div>
            <p className={styles.tagline}>
              Low level systems and ML researcher building deterministic AI,
              multimodal systems, and production grade web platforms.
            </p>
          </div>
        </div>
      </div>
      {/* Fix 4: picto row removed entirely */}
    </section>
  )
}
