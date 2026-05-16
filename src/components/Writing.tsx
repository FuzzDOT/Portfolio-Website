/**
 * Writing.tsx
 *
 * Apple-style scroll-driven PDF reader.
 *
 * Scroll behaviour per paper:
 *   Phase 1 — ZOOM IN:   paper starts at 50% scale, lerps to 100% as user scrolls
 *   Phase 2 — READ:      paper is at 100%, iframe scrolls through PDF pages
 *   Phase 3 — ZOOM OUT:  paper lerps back to 50% as user scrolls past the last page
 *
 * The section height for each paper is:
 *   zoomInVh + readVh + zoomOutVh   (all configurable below)
 *
 * PDF URL:
 *   Set pdfUrl in data.ts WRITING_PAPERS. The iframe src is that URL.
 *   The PDF renders at full viewport width — not shrunk to fit the screen vertically.
 *
 * To add a new paper, push a new entry to WRITING_PAPERS in data.ts.
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import { WRITING_PAPERS } from '../data'
import styles from './Writing.module.css'

// ─── Config ────────────────────────────────────────────────────────────────
const SCALE_MIN = 0.50   // paper scale when entering / exiting
const SCALE_MAX = 1.00   // paper scale when fully zoomed in
const ZOOM_IN_VH  = 1.5  // scroll budget (in viewport heights) for zoom-in phase
const READ_VH     = 4.0  // scroll budget while reading (controls PDF page scroll speed)
const ZOOM_OUT_VH = 1.5  // scroll budget for zoom-out phase
const TOTAL_VH_PER_PAPER = ZOOM_IN_VH + READ_VH + ZOOM_OUT_VH
const LERP_K = 0.10      // smoothing factor for scale animation

interface PaperScrollState {
  scale: number        // current visual scale (lerped)
  readProgress: number // 0→1 within the READ phase (drives iframe scroll)
  phase: 'pre' | 'zoomIn' | 'read' | 'zoomOut' | 'post'
}

// ─── Single paper block ─────────────────────────────────────────────────────
function PaperBlock({
  paper,
  onLinkHover,
}: {
  paper: typeof WRITING_PAPERS[number]
  onLinkHover?: (v: boolean) => void
}) {
  const sectionRef  = useRef<HTMLDivElement>(null)
  const iframeRef   = useRef<HTMLIFrameElement>(null)

  const targetScale       = useRef(SCALE_MIN)
  const currentScale      = useRef(SCALE_MIN)
  const targetReadProg    = useRef(0)
  const currentReadProg   = useRef(0)
  const rafRef            = useRef<number>()

  const [state, setState] = useState<PaperScrollState>({
    scale: SCALE_MIN,
    readProgress: 0,
    phase: 'pre',
  })

  // Track scroll and map to phases
  const onScroll = useCallback(() => {
    const section = sectionRef.current
    if (!section) return

    const rect        = section.getBoundingClientRect()
    const sectionTop  = window.scrollY + rect.top
    const sectionH    = section.offsetHeight
    const viewH       = window.innerHeight
    const scrollIn    = window.scrollY - sectionTop   // px scrolled into section
    const maxScroll   = sectionH - viewH

    if (scrollIn <= 0) {
      targetScale.current    = SCALE_MIN
      targetReadProg.current = 0
      setState(s => ({ ...s, phase: 'pre' }))
      return
    }
    if (scrollIn >= maxScroll) {
      targetScale.current    = SCALE_MIN
      targetReadProg.current = 1
      setState(s => ({ ...s, phase: 'post' }))
      return
    }

    const totalPx    = maxScroll
    const zoomInPx   = (ZOOM_IN_VH  / TOTAL_VH_PER_PAPER) * totalPx
    const readPx     = (READ_VH     / TOTAL_VH_PER_PAPER) * totalPx
    const zoomOutPx  = (ZOOM_OUT_VH / TOTAL_VH_PER_PAPER) * totalPx

    if (scrollIn < zoomInPx) {
      // ZOOM IN phase
      const t = scrollIn / zoomInPx
      targetScale.current    = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * t
      targetReadProg.current = 0
      setState(s => ({ ...s, phase: 'zoomIn' }))
    } else if (scrollIn < zoomInPx + readPx) {
      // READ phase
      const t = (scrollIn - zoomInPx) / readPx
      targetScale.current    = SCALE_MAX
      targetReadProg.current = t
      setState(s => ({ ...s, phase: 'read', readProgress: t }))
    } else {
      // ZOOM OUT phase
      const t = (scrollIn - zoomInPx - readPx) / zoomOutPx
      targetScale.current    = SCALE_MAX - (SCALE_MAX - SCALE_MIN) * t
      targetReadProg.current = 1
      setState(s => ({ ...s, phase: 'zoomOut' }))
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  // rAF lerp loop
  useEffect(() => {
    const tick = () => {
      currentScale.current    += (targetScale.current    - currentScale.current)    * LERP_K
      currentReadProg.current += (targetReadProg.current - currentReadProg.current) * LERP_K

      setState(s => ({
        ...s,
        scale: currentScale.current,
        readProgress: currentReadProg.current,
      }))

      // Drive iframe scroll position
      try {
        const iframe = iframeRef.current
        if (iframe && iframe.contentWindow) {
          const doc       = iframe.contentDocument || iframe.contentWindow.document
          const scrollH   = doc.documentElement.scrollHeight - iframe.clientHeight
          if (scrollH > 0) {
            iframe.contentWindow.scrollTo({ top: currentReadProg.current * scrollH })
          }
        }
      } catch {
        // cross-origin PDF — browser will block scroll, that's fine
        // the visual zoom + progress bar still work
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const sectionH = `${TOTAL_VH_PER_PAPER * 100}svh`
  const showInfo = state.phase === 'read' || state.phase === 'zoomIn' || state.phase === 'zoomOut'
  const showHint = state.phase === 'zoomIn'

  return (
    <div
      ref={sectionRef}
      className={styles.paperSection}
      style={{ height: sectionH }}
    >
      <div className={styles.paperSticky}>
        {/* ── Paper ─────────────────────────────────────────────────────── */}
        <div
          className={styles.paperContainer}
          style={{ transform: `scale(${state.scale})` }}
        >
          <div
            className={styles.paper}
            style={{
              /*
               * Full viewport width. Height = viewport height so the iframe
               * fills the screen. The iframe internally scrolls through PDF pages.
               */
              height: '100svh',
            }}
          >
            {/* Progress bar */}
            <div
              className={styles.paperProgress}
              style={{ width: `${state.readProgress * 100}%` }}
            />

            {/*
             * PDF_PATH: The iframe src comes from paper.pdfUrl in data.ts.
             * Change the pdfUrl field in WRITING_PAPERS when you have the final file.
             *
             * The #toolbar=0&navpanes=0&scrollbar=0 params hide the browser PDF UI
             * for a cleaner look. Remove them if you prefer native PDF controls.
             */}
            <iframe
              ref={iframeRef}
              src={`${paper.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className={styles.paperFrame}
              title={paper.title}
              loading="eager"
            />
          </div>
        </div>

        {/* ── Side info panel ───────────────────────────────────────────── */}
        <div className={`${styles.infoBar} ${showInfo ? styles.infoBarVisible : ''}`}>
          <div>
            <div className={styles.infoBarTitle}>{paper.title}</div>
            <div className={styles.infoBarSub}>{paper.subtitle}</div>
            <p className={styles.infoBarDesc}>{paper.description}</p>
          </div>

          <div className={styles.infoBarTags}>
            {paper.tags.map(t => (
              <span key={t} className={styles.infoBarTag}>{t}</span>
            ))}
          </div>

          <div className={styles.infoBarLinks}>
            {paper.links.map(l => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className={styles.infoBarLink}
                onMouseEnter={() => onLinkHover?.(true)}
                onMouseLeave={() => onLinkHover?.(false)}
              >
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <path d="M1 13L13 1M13 1H4M13 1V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Scroll hint ───────────────────────────────────────────────── */}
        <div className={`${styles.scrollHint} ${showHint ? styles.scrollHintVisible : ''}`}>
          <span className={styles.scrollHintArrow}>↓</span>
          <span className={styles.scrollHintText}>Scroll to read</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Writing section ────────────────────────────────────────────────────
interface WritingProps {
  onLinkHover?: (v: boolean) => void
}

export default function Writing({ onLinkHover }: WritingProps) {
  const headerRef  = useRef<HTMLDivElement>(null)
  const [headerVis, setHeaderVis] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setHeaderVis(true) },
      { threshold: 0.1 }
    )
    if (headerRef.current) io.observe(headerRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <section className={styles.section} aria-label="Writing & Research">
      {/* ── Section header ────────────────────────────────────────────── */}
      <div
        ref={headerRef}
        className={`${styles.header} ${headerVis ? styles.headerVisible : ''}`}
      >
        <span className={styles.kicker}>Writing & Research</span>
        <h2 className={styles.heading}>PAPERS</h2>
      </div>

      {/* ── One PaperBlock per published paper ────────────────────────── */}
      {WRITING_PAPERS.map(paper => (
        <PaperBlock
          key={paper.id}
          paper={paper}
          onLinkHover={onLinkHover}
        />
      ))}

      {/* ── Outro ─────────────────────────────────────────────────────── */}
      <div className={styles.outro}>
        <div>
          <div className={styles.outroText}>More coming soon.</div>
          <div className={styles.outroSub}>
            Interpretability post in progress — mechanistic analysis of a 10M parameter transformer.
          </div>
        </div>
      </div>
    </section>
  )
}
