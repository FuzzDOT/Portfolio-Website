import { useEffect, useRef, useState } from 'react'
import { PROJECTS } from '../data'
import styles from './ProjectSequence.module.css'

interface ProjectSequenceProps {
  onLinkHover: (v: boolean) => void
}

export default function ProjectSequence({ onLinkHover }: ProjectSequenceProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeSlide, setActiveSlide] = useState(-1) // -1 = intro
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'pre'|'active'|'post'>('pre')
  const animFrameRef = useRef<number>()
  const targetProgress = useRef(0)
  const currentProgress = useRef(0)

  const TOTAL_SLIDES = PROJECTS.length + 1 // +1 for intro
  const SCROLL_PER_SLIDE = 1.0 // 100vh per slide

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const onScroll = () => {
      const rect = section.getBoundingClientRect()
      const sectionTop = window.scrollY + rect.top
      const sectionHeight = section.offsetHeight
      const scrollIn = window.scrollY - sectionTop
      const maxScroll = sectionHeight - window.innerHeight

      if (scrollIn < 0) {
        setPhase('pre')
        targetProgress.current = 0
      } else if (scrollIn > maxScroll) {
        setPhase('post')
        targetProgress.current = 1
      } else {
        setPhase('active')
        targetProgress.current = scrollIn / maxScroll
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Smooth lerp loop
  useEffect(() => {
    const tick = () => {
      currentProgress.current += (targetProgress.current - currentProgress.current) * 0.08
      const p = currentProgress.current
      setProgress(p)

      // Map to slide index
      const totalSegments = TOTAL_SLIDES
      const rawSlide = p * totalSegments
      const slideIdx = Math.floor(rawSlide) - 1 // -1 for intro
      setActiveSlide(Math.max(-1, Math.min(PROJECTS.length - 1, slideIdx)))

      // Draw canvas 3D text
      drawCanvas(p)
      animFrameRef.current = requestAnimationFrame(tick)
    }
    animFrameRef.current = requestAnimationFrame(tick)
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [])

  const drawCanvas = (p: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fix 3: use logical (CSS) dimensions for all draw coordinates.
    // The resize handler already applied ctx.scale(dpr, dpr), so canvas.width
    // is the raw pixel buffer size — using it for coordinates pushes text off-screen.
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    ctx.clearRect(0, 0, W * window.devicePixelRatio, H * window.devicePixelRatio)

    // Get computed colors from CSS
    const style = getComputedStyle(document.documentElement)
    const textColor = style.getPropertyValue('--text').trim() || '#000'
    const mutedColor = style.getPropertyValue('--text-muted').trim() || 'rgba(0,0,0,0.4)'

    // Determine which project we're between
    const totalSegments = TOTAL_SLIDES
    const rawSlide = p * totalSegments
    const slideFloor = Math.floor(rawSlide)
    const t = rawSlide - slideFloor // 0..1 within current slide

    // Slide 0 = intro
    const projIdx = slideFloor - 1

    // Current text
    const currentTitle = projIdx >= 0 && projIdx < PROJECTS.length
      ? PROJECTS[projIdx].titleLines
      : ['SELECTED', 'PROJECTS']

    const nextIdx = projIdx + 1
    const nextTitle = nextIdx >= 0 && nextIdx < PROJECTS.length
      ? PROJECTS[nextIdx].titleLines
      : null

    // 3D perspective text animation
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const fontSize = Math.min(W / (currentTitle[0]?.length * 0.55 || 8), H / (currentTitle.length * 1.4))
    const clampedSize = Math.max(32, Math.min(fontSize, 140))

    // Outgoing text (slides up + fades)
    const outOpacity = t < 0.4 ? 1 : Math.max(0, 1 - (t - 0.4) / 0.3)
    const outY = t < 0.4 ? 0 : -((t - 0.4) / 0.3) * 60

    ctx.globalAlpha = outOpacity
    ctx.font = `900 ${clampedSize}px 'PP Neue Montreal', 'Inter', sans-serif`

    // 3D skew/perspective effect based on scroll
    const skewX = Math.sin(t * Math.PI) * 0.04
    ctx.transform(1, skewX, 0, 1, 0, 0)

    currentTitle.forEach((line, i) => {
      const lineY = H / 2 + (i - (currentTitle.length - 1) / 2) * (clampedSize * 1.05) + outY
      // Shadow / depth layers
      for (let d = 3; d >= 0; d--) {
        ctx.globalAlpha = outOpacity * (0.07 * (4 - d))
        ctx.fillStyle = textColor
        ctx.fillText(line, W / 2 + d * 2, lineY + d * 3)
      }
      ctx.globalAlpha = outOpacity
      ctx.fillStyle = textColor
      ctx.fillText(line, W / 2, lineY)
    })

    ctx.restore()

    // Incoming text (slides up from bottom)
    if (nextTitle && t > 0.55) {
      const inOpacity = Math.min(1, (t - 0.55) / 0.3)
      const inY = (1 - Math.min(1, (t - 0.55) / 0.3)) * 50

      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = inOpacity

      const nextFontSize = Math.min(W / (nextTitle[0]?.length * 0.55 || 8), H / (nextTitle.length * 1.4))
      const nextClamped = Math.max(32, Math.min(nextFontSize, 140))
      ctx.font = `900 ${nextClamped}px 'PP Neue Montreal', 'Inter', sans-serif`

      const skewIn = -Math.sin(t * Math.PI) * 0.03
      ctx.transform(1, skewIn, 0, 1, 0, 0)

      nextTitle.forEach((line, i) => {
        const lineY = H / 2 + (i - (nextTitle.length - 1) / 2) * (nextClamped * 1.05) + inY
        for (let d = 3; d >= 0; d--) {
          ctx.globalAlpha = inOpacity * (0.07 * (4 - d))
          ctx.fillStyle = textColor
          ctx.fillText(line, W / 2 + d * 2, lineY + d * 3)
        }
        ctx.globalAlpha = inOpacity
        ctx.fillStyle = textColor
        ctx.fillText(line, W / 2, lineY)
      })

      // Progress number
      ctx.font = `400 14px 'JetBrains Mono', monospace`
      ctx.fillStyle = mutedColor
      ctx.globalAlpha = inOpacity * 0.6
      ctx.fillText(`0${nextIdx + 1} / 0${PROJECTS.length}`, W / 2, H - 40)

      ctx.restore()
    }

    // Progress number (current)
    if (outOpacity > 0.2 && projIdx >= 0) {
      ctx.save()
      ctx.textAlign = 'center'
      ctx.font = `400 14px 'JetBrains Mono', monospace`
      ctx.fillStyle = mutedColor
      ctx.globalAlpha = outOpacity * 0.6
      ctx.fillText(`0${projIdx + 1} / 0${PROJECTS.length}`, W / 2, H - 40)
      ctx.restore()
    }
  }

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Reset any previous transform, then apply DPR scale
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  const sectionHeight = `${TOTAL_SLIDES * 100}svh`
  const proj = activeSlide >= 0 ? PROJECTS[activeSlide] : null

  // Dot array for nav
  const totalDots = PROJECTS.length + 1
  const activeDot = activeSlide + 1

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      style={{ height: sectionHeight }}
      aria-label="Selected projects"
    >
      {/* Sticky viewport */}
      <div className={`${styles.sticky} ${phase === 'active' ? styles.stickyActive : ''}`}>

        {/* Left: Canvas 3D text */}
        <div className={styles.canvasWrap}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>

        {/* Right: Project info panel */}
        <div className={`${styles.infoPanel} ${proj ? styles.infoPanelVisible : ''}`}>
          {proj && (
            <div key={proj.id} className={styles.infoContent}>
              <div className={styles.infoIndex}>{proj.index} — {proj.category}</div>
              <h3 className={styles.infoTitle}>{proj.title}</h3>
              <p className={styles.infoDesc}>{proj.description}</p>

              {proj.stats && (
                <div className={styles.stats}>
                  {proj.stats.map(s => (
                    <div key={s.label} className={styles.stat}>
                      <div className={styles.statVal}>{s.value}</div>
                      <div className={styles.statLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {proj.details && (
                <ul className={styles.details}>
                  {proj.details.map(d => (
                    <li key={d} className={styles.detailItem}>{d}</li>
                  ))}
                </ul>
              )}

              <div className={styles.tags}>
                {proj.tags.map(t => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>

              <div className={styles.links}>
                {proj.links.map(l => (
                  l.placeholder
                    ? <span key={l.label} className={styles.linkPlaceholder}>{l.label}</span>
                    : <a
                        key={l.label}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                        onMouseEnter={() => onLinkHover(true)}
                        onMouseLeave={() => onLinkHover(false)}
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H4M13 1V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {l.label}
                      </a>
                ))}
              </div>
            </div>
          )}

          {activeSlide === -1 && (
            <div className={styles.infoContent}>
              <div className={styles.infoIndex}>Some selected</div>
              <h3 className={styles.infoTitle} style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}>
                PROJECTS
              </h3>
              <p className={styles.infoDesc}>
                AI systems · ML research · Systems engineering · Web development.
                <br /><br />Scroll down to explore each project.
              </p>
              <div className={styles.scrollHint}>
                <span className={styles.scrollHintArrow}>↓</span>
                <span className={styles.scrollHintText}>Scroll to explore</span>
              </div>
            </div>
          )}
        </div>

        {/* Dot nav */}
        <div className={styles.dots}>
          {Array.from({ length: totalDots }).map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i === activeDot ? styles.dotActive : ''}`}
            />
          ))}
        </div>

        {/* Progress line */}
        <div className={styles.progressLine}>
          <div
            className={styles.progressFill}
            style={{ height: `${progress * 100}%` }}
          />
        </div>
      </div>
    </section>
  )
}
