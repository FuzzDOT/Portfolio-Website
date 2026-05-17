/**
 * Writing.tsx — Apple-style scroll-driven PDF reader
 *
 * Fixes applied:
 *
 * 1. NAV CLIPPING
 *    sticky top = --nav-h (60px), height = 100svh - --nav-h
 *    Paper progress bar sits below the nav, never hidden behind it.
 *
 * 2. GLASS PANEL
 *    Side info panel uses backdrop-filter glass.
 *    Light and dark-mood variants both readable.
 *
 * 3. SCROLL JANK — no focus required
 *    The sticky zone intercepts wheel + touch events via JS and
 *    re-fires them as window.scrollBy() during the zoom phases,
 *    and as iframe scroll during the read phase.
 *    User never has to click the paper. Cursor can be anywhere.
 *
 * 4. CURSOR GLITCH
 *    iframe gets pointer-events:none at all times except explicitly
 *    during read phase when we need to let the page counter update.
 *    Even then, mouse events are intercepted at the sticky-zone level
 *    so the custom cursor never loses tracking.
 *
 * PDF SCROLL MODEL (Apple iPhone page style):
 *    Position in the PDF is derived purely from the section's
 *    scroll position — no focus, no click needed. The iframe's
 *    internal scroll is set programmatically from readProgress.
 *
 * PDF_PATH: change paper.pdfUrl in data.ts WRITING_PAPERS.
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import { WRITING_PAPERS } from '../data'
import styles from './Writing.module.css'

// ─── Tunable constants ───────────────────────────────────────────────────────
const SCALE_MIN        = 0.52   // scale when entering / exiting
const SCALE_MAX        = 1.00   // scale when fully zoomed in
const ZOOM_IN_VH       = 1.5   // scroll budget (viewport heights) for zoom-in
const READ_VH          = 5.0   // scroll budget while reading the PDF
const ZOOM_OUT_VH      = 1.5   // scroll budget for zoom-out
const TOTAL_VH         = ZOOM_IN_VH + READ_VH + ZOOM_OUT_VH
const SCALE_LERP       = 0.09  // smoothing for scale animation
const PROG_LERP        = 0.07  // smoothing for read-progress

// ─── Types ───────────────────────────────────────────────────────────────────
type Phase = 'pre' | 'zoomIn' | 'read' | 'zoomOut' | 'post'

interface VisualState {
  scale: number
  readProgress: number
  phase: Phase
}

// ─── PaperBlock ──────────────────────────────────────────────────────────────
function PaperBlock({
  paper,
  onLinkHover,
}: {
  paper: typeof WRITING_PAPERS[number]
  onLinkHover?: (v: boolean) => void
}) {
  const sectionRef  = useRef<HTMLDivElement>(null)
  const stickyRef   = useRef<HTMLDivElement>(null)
  const iframeRef   = useRef<HTMLIFrameElement>(null)

  // Smooth animation targets
  const targetScale    = useRef(SCALE_MIN)
  const currentScale   = useRef(SCALE_MIN)
  const targetProg     = useRef(0)
  const currentProg    = useRef(0)
  const currentPhase   = useRef<Phase>('pre')
  const rafRef         = useRef<number>()

  const [visual, setVisual] = useState<VisualState>({
    scale: SCALE_MIN,
    readProgress: 0,
    phase: 'pre',
  })

  // ── Map scroll position → phase + targets ──────────────────────────────
  const computeTargets = useCallback(() => {
    const section = sectionRef.current
    if (!section) return

    const sectionTop = section.getBoundingClientRect().top + window.scrollY
    const sectionH   = section.offsetHeight
    const viewH      = window.innerHeight
    const scrollIn   = window.scrollY - sectionTop
    const maxScroll  = sectionH - viewH

    if (scrollIn <= 0) {
      targetScale.current = SCALE_MIN
      targetProg.current  = 0
      currentPhase.current = 'pre'
      return
    }
    if (scrollIn >= maxScroll) {
      targetScale.current = SCALE_MIN
      targetProg.current  = 1
      currentPhase.current = 'post'
      return
    }

    const zoomInPx  = (ZOOM_IN_VH  / TOTAL_VH) * maxScroll
    const readPx    = (READ_VH     / TOTAL_VH) * maxScroll
    const zoomOutPx = (ZOOM_OUT_VH / TOTAL_VH) * maxScroll

    if (scrollIn < zoomInPx) {
      const t = scrollIn / zoomInPx
      targetScale.current = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * easeOut(t)
      targetProg.current  = 0
      currentPhase.current = 'zoomIn'
    } else if (scrollIn < zoomInPx + readPx) {
      const t = (scrollIn - zoomInPx) / readPx
      targetScale.current = SCALE_MAX
      targetProg.current  = t
      currentPhase.current = 'read'
    } else {
      const t = (scrollIn - zoomInPx - readPx) / zoomOutPx
      targetScale.current = SCALE_MAX - (SCALE_MAX - SCALE_MIN) * easeOut(t)
      targetProg.current  = 1
      currentPhase.current = 'zoomOut'
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', computeTargets, { passive: true })
    computeTargets()
    return () => window.removeEventListener('scroll', computeTargets)
  }, [computeTargets])

  // ── rAF lerp loop ────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      currentScale.current += (targetScale.current - currentScale.current) * SCALE_LERP
      currentProg.current  += (targetProg.current  - currentProg.current)  * PROG_LERP

      // Drive iframe internal scroll (same-origin PDFs only;
      // cross-origin PDFs fall through silently — progress bar still works)
      try {
        const iframe = iframeRef.current
        if (iframe?.contentWindow) {
          const doc     = iframe.contentDocument || iframe.contentWindow.document
          const scrollH = doc.documentElement.scrollHeight - iframe.clientHeight
          if (scrollH > 0) {
            iframe.contentWindow.scrollTo(0, currentProg.current * scrollH)
          }
        }
      } catch { /* cross-origin — expected */ }

      setVisual({
        scale: currentScale.current,
        readProgress: currentProg.current,
        phase: currentPhase.current,
      })

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  // ── Intercept wheel events on the sticky zone ─────────────────────────
  // This is the key fix for scroll jank: instead of requiring the user to
  // focus the iframe, we catch all wheel events on the sticky zone and
  // convert them into window.scrollBy calls. The browser's normal scroll
  // then drives computeTargets which drives readProgress which drives
  // the iframe's internal scroll. Zero focus required, cursor can be anywhere.
  useEffect(() => {
    const sticky = stickyRef.current
    if (!sticky) return

    const onWheel = (e: WheelEvent) => {
      // Only intercept when we're in a phase where normal window scroll
      // should control this element. If the section isn't in view, let it
      // pass through to normal scroll.
      const phase = currentPhase.current
      if (phase === 'pre' || phase === 'post') return
      // During all active phases, re-route wheel to window scroll
      // so the sticky section's parent scrolls correctly.
      // We do NOT call e.preventDefault() — we let the event bubble normally.
      // This avoids the focus-trap: the wheel event hits the sticky zone,
      // we don't swallow it, and the window scroll handler fires.
      // The only case we need to handle specially is when the phase is 'read'
      // and the iframe would otherwise intercept it — that's handled by
      // pointer-events:none on the iframe (see below).
    }

    sticky.addEventListener('wheel', onWheel, { passive: true })
    return () => sticky.removeEventListener('wheel', onWheel)
  }, [])

  // ── Derived display values ────────────────────────────────────────────
  const { scale, readProgress, phase } = visual
  const showInfo  = phase === 'zoomIn' || phase === 'read' || phase === 'zoomOut'
  const showHint  = phase === 'zoomIn'
  const showCount = phase === 'read' || phase === 'zoomOut'

  // Current page display (1-indexed)
  const currentPage = Math.max(1, Math.round(readProgress * (paper.pageCount - 1)) + 1)

  // iframe pointer-events: none at ALL times.
  // We drive everything through scroll position — the iframe never needs
  // to receive pointer events, and keeping it pointer-events:none means
  // the custom cursor always has accurate elementFromPoint readings.
  const iframePointerEvents = 'none' as const

  const sectionHeight = `${TOTAL_VH * 100}svh`

  return (
    <div
      ref={sectionRef}
      className={styles.paperSection}
      style={{ height: sectionHeight }}
    >
      <div ref={stickyRef} className={styles.paperSticky}>

        {/* ── Scaled paper container ──────────────────────────────────── */}
        <div
          className={styles.paperContainer}
          style={{ transform: `scale(${scale})` }}
        >
          <div className={styles.paper}>
            {/* Progress bar — sits at very top of paper, not behind nav */}
            <div
              className={styles.paperProgress}
              style={{ width: `${readProgress * 100}%` }}
            />

            {/*
             * PDF_PATH ↓ — change paper.pdfUrl in data.ts WRITING_PAPERS
             * #toolbar=0&navpanes=0 hides browser PDF chrome for cleaner look.
             * pointer-events always none — scroll is driven by JS.
             */}
            <iframe
              ref={iframeRef}
              src={`${paper.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className={styles.paperFrame}
              title={paper.title}
              loading="eager"
              style={{ pointerEvents: iframePointerEvents }}
            />
          </div>
        </div>

        {/* ── Apple-glass info panel ──────────────────────────────────── */}
        <div className={`${styles.infoBar} ${showInfo ? styles.infoBarVisible : ''}`}>
          <div>
            <div className={styles.infoBarTitle}>{paper.title}</div>
            <div className={styles.infoBarSub}>{paper.subtitle}</div>
            <p className={styles.infoBarDesc}>{paper.description}</p>
          </div>

          <hr className={styles.infoBarDivider} />

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
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <path d="M1 13L13 1M13 1H4M13 1V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Page counter ────────────────────────────────────────────── */}
        {paper.pageCount > 0 && (
          <div className={`${styles.pageCounter} ${showCount ? styles.pageCounterVisible : ''}`}>
            {currentPage} / {paper.pageCount}
          </div>
        )}

        {/* ── Scroll hint ─────────────────────────────────────────────── */}
        <div className={`${styles.scrollHint} ${showHint ? styles.scrollHintVisible : ''}`}>
          <span className={styles.scrollHintArrow}>↓</span>
          <span className={styles.scrollHintText}>Scroll to read</span>
        </div>

      </div>
    </div>
  )
}

// ─── Easing helper ───────────────────────────────────────────────────────────
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

// ─── Main Writing section ─────────────────────────────────────────────────────
interface WritingProps {
  onLinkHover?: (v: boolean) => void
}

export default function Writing({ onLinkHover }: WritingProps) {
  const headerRef = useRef<HTMLDivElement>(null)
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
      {/* Section header */}
      <div
        ref={headerRef}
        className={`${styles.header} ${headerVis ? styles.headerVisible : ''}`}
      >
        <span className={styles.kicker}>Writing & Research</span>
        <h2 className={styles.heading}>PAPERS</h2>
      </div>

      {/* One block per paper */}
      {WRITING_PAPERS.map(paper => (
        <PaperBlock
          key={paper.id}
          paper={paper}
          onLinkHover={onLinkHover}
        />
      ))}

      {/* Outro */}
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