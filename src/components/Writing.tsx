/**
 * Writing.tsx — Apple-style scroll-driven PDF reader
 *
 * Info panel behaviour:
 *   • Slides in from the right when the section first becomes active
 *   • Auto-hides after AUTO_HIDE_MS milliseconds ← change this freely
 *   • A minimal tab with an animated chevron stays visible at the right edge
 *   • Clicking the tab toggles the panel open/closed with a spring animation
 *   • Manual open resets the auto-hide timer
 *
 * PDF rendering: pdfjs-dist renders pages to <canvas> elements.
 * Install: npm install pdfjs-dist
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { WRITING_PAPERS } from '../data'
import styles from './Writing.module.css'

// ── pdf.js worker ─────────────────────────────────────────────────────────
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href

// ─── ↓↓↓ TUNE THIS to change how long the card stays open on first load ↓↓↓
const AUTO_HIDE_MS = 3500  // milliseconds before the panel auto-collapses
// ─── ↑↑↑ ─────────────────────────────────────────────────────────────────

// Animation / scroll constants
const SCALE_MIN   = 0.52
const SCALE_MAX   = 1.00
const ZOOM_IN_VH  = 1.5
const READ_VH     = 5.0
const ZOOM_OUT_VH = 1.5
const TOTAL_VH    = ZOOM_IN_VH + READ_VH + ZOOM_OUT_VH
const SCALE_LERP  = 0.09
const PROG_LERP   = 0.07

type Phase = 'pre' | 'zoomIn' | 'read' | 'zoomOut' | 'post'

function easeOut(t: number) { return 1 - Math.pow(1 - t, 3) }

// ─── usePdfCanvases ──────────────────────────────────────────────────────
function usePdfCanvases(pdfUrl: string) {
  const [canvases, setCanvases]   = useState<HTMLCanvasElement[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setCanvases([])
    setPageCount(0)

    ;(async () => {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise
        if (cancelled) return
        setPageCount(pdf.numPages)

        const out: HTMLCanvasElement[] = []
        const viewportW = window.innerWidth

        for (let p = 1; p <= pdf.numPages; p++) {
          if (cancelled) return
          const page   = await pdf.getPage(p)
          const baseVp = page.getViewport({ scale: 1 })
          const scale  = viewportW / baseVp.width
          const vp     = page.getViewport({ scale })

          const canvas  = document.createElement('canvas')
          const dpr     = window.devicePixelRatio || 1
          canvas.width  = vp.width  * dpr
          canvas.height = vp.height * dpr
          canvas.style.cssText = `width:${vp.width}px;height:${vp.height}px;display:block;`

          const ctx = canvas.getContext('2d')!
          ctx.scale(dpr, dpr)
          await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise
          if (cancelled) return
          out.push(canvas)
        }

        if (!cancelled) { setCanvases(out); setLoading(false) }
      } catch (e) {
        console.error('[Writing] pdfjs error', e)
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [pdfUrl])

  return { canvases, pageCount, loading }
}

// ─── PaperBlock ──────────────────────────────────────────────────────────
function PaperBlock({
  paper,
  onLinkHover,
}: {
  paper: typeof WRITING_PAPERS[number]
  onLinkHover?: (v: boolean) => void
}) {
  const sectionRef   = useRef<HTMLDivElement>(null)
  const scrollDivRef = useRef<HTMLDivElement | null>(null)

  // Scroll animation
  const tgtScale = useRef(SCALE_MIN)
  const curScale = useRef(SCALE_MIN)
  const tgtProg  = useRef(0)
  const curProg  = useRef(0)
  const phaseRef = useRef<Phase>('pre')
  const rafRef   = useRef<number>()

  const [scale, setScale]               = useState(SCALE_MIN)
  const [readProgress, setReadProgress] = useState(0)
  const [phase, setPhase]               = useState<Phase>('pre')

  // Panel visibility state
  // panelActive: section is in scroll range (panel should exist in DOM)
  // panelOpen: card is slid out (vs collapsed to tab only)
  const [panelActive, setPanelActive]   = useState(false)
  const [panelOpen, setPanelOpen]       = useState(false)
  const autoHideTimer = useRef<ReturnType<typeof setTimeout>>()
  const hasAutoShown  = useRef(false) // only auto-show once per page load

  const { canvases, pageCount, loading } = usePdfCanvases(paper.pdfUrl)

  // Attach canvases to scroll div
  const attachRef = useCallback((node: HTMLDivElement | null) => {
    scrollDivRef.current = node
    if (!node) return
    node.innerHTML = ''
    canvases.forEach(c => node.appendChild(c))
  }, [canvases])

  // ── Scroll → targets ──────────────────────────────────────────────
  const computeTargets = useCallback(() => {
    const section = sectionRef.current
    if (!section) return
    const top       = section.getBoundingClientRect().top + window.scrollY
    const maxScroll = section.offsetHeight - window.innerHeight
    const scrollIn  = window.scrollY - top

    const isActive = scrollIn > 0 && scrollIn < maxScroll
    setPanelActive(isActive)

    // Auto-show panel once when section first enters view
    if (isActive && !hasAutoShown.current) {
      hasAutoShown.current = true
      setPanelOpen(true)
      // Schedule auto-hide
      clearTimeout(autoHideTimer.current)
      autoHideTimer.current = setTimeout(() => {
        setPanelOpen(false)
      }, AUTO_HIDE_MS)
    }

    if (scrollIn <= 0) {
      tgtScale.current = SCALE_MIN; tgtProg.current = 0
      phaseRef.current = 'pre'; return
    }
    if (scrollIn >= maxScroll) {
      tgtScale.current = SCALE_MIN; tgtProg.current = 1
      phaseRef.current = 'post'; return
    }

    const ziPx = (ZOOM_IN_VH  / TOTAL_VH) * maxScroll
    const rdPx = (READ_VH     / TOTAL_VH) * maxScroll
    const zoPx = (ZOOM_OUT_VH / TOTAL_VH) * maxScroll

    if (scrollIn < ziPx) {
      tgtScale.current = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * easeOut(scrollIn / ziPx)
      tgtProg.current  = 0
      phaseRef.current = 'zoomIn'
    } else if (scrollIn < ziPx + rdPx) {
      tgtScale.current = SCALE_MAX
      tgtProg.current  = (scrollIn - ziPx) / rdPx
      phaseRef.current = 'read'
    } else {
      tgtScale.current = SCALE_MAX - (SCALE_MAX - SCALE_MIN) * easeOut((scrollIn - ziPx - rdPx) / zoPx)
      tgtProg.current  = 1
      phaseRef.current = 'zoomOut'
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', computeTargets, { passive: true })
    computeTargets()
    return () => {
      window.removeEventListener('scroll', computeTargets)
      clearTimeout(autoHideTimer.current)
    }
  }, [computeTargets])

  // ── rAF lerp loop ─────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      curScale.current += (tgtScale.current - curScale.current) * SCALE_LERP
      curProg.current  += (tgtProg.current  - curProg.current)  * PROG_LERP

      const div = scrollDivRef.current
      if (div) {
        const max = div.scrollHeight - div.clientHeight
        if (max > 0) div.scrollTop = curProg.current * max
      }

      setScale(curScale.current)
      setReadProgress(curProg.current)
      setPhase(phaseRef.current)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  // ── Toggle handler ────────────────────────────────────────────────
  const handleToggle = useCallback(() => {
    setPanelOpen(prev => {
      const next = !prev
      // If reopening manually, restart auto-hide timer
      if (next) {
        clearTimeout(autoHideTimer.current)
        autoHideTimer.current = setTimeout(() => {
          setPanelOpen(false)
        }, AUTO_HIDE_MS)
      }
      return next
    })
  }, [])

  // ── Derived ───────────────────────────────────────────────────────
  const totalPages  = pageCount || paper.pageCount
  const currentPage = Math.max(1, Math.round(readProgress * (totalPages - 1)) + 1)
  const showHint    = phase === 'zoomIn'
  const showCount   = (phase === 'read' || phase === 'zoomOut') && totalPages > 0

  // CSS class composition for the panel
  const panelClass = [
    styles.infoPanel,
    panelActive ? styles.infoPanelVisible : '',
    panelOpen   ? '' : styles.infoPanelCollapsed,
  ].join(' ')

  return (
    <div
      ref={sectionRef}
      className={styles.paperSection}
      style={{ height: `${TOTAL_VH * 100}svh` }}
    >
      <div className={styles.paperSticky}>

        {/* ── Scaled paper ──────────────────────────────────────────── */}
        <div
          className={styles.paperContainer}
          style={{ transform: `scale(${scale})` }}
        >
          <div className={styles.paper}>
            <div
              className={styles.paperProgress}
              style={{ width: `${readProgress * 100}%` }}
            />
            {loading && (
              <div className={styles.pdfLoading}>
                <span className={styles.pdfLoadingText}>Loading…</span>
              </div>
            )}
            <div
              ref={attachRef}
              className={styles.pdfScrollContainer}
              style={{
                opacity: loading ? 0 : 1,
                transition: 'opacity 0.4s',
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* ── Slide-out info panel (tab + card) ─────────────────────── */}
        <div className={panelClass}>
          {/* Animated toggle tab */}
          <button
            className={styles.infoToggleTab}
            onClick={handleToggle}
            aria-label={panelOpen ? 'Hide paper info' : 'Show paper info'}
          >
            <span className={styles.infoToggleArrow} />
          </button>

          {/* Glass card */}
          <div className={styles.infoBar}>
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
        </div>

        {/* ── Page counter ──────────────────────────────────────────── */}
        {totalPages > 0 && (
          <div className={`${styles.pageCounter} ${showCount ? styles.pageCounterVisible : ''}`}>
            {currentPage} / {totalPages}
          </div>
        )}

        {/* ── Scroll hint ───────────────────────────────────────────── */}
        <div className={`${styles.scrollHint} ${showHint ? styles.scrollHintVisible : ''}`}>
          <span className={styles.scrollHintArrow}>↓</span>
          <span className={styles.scrollHintText}>Scroll to read</span>
        </div>

      </div>
    </div>
  )
}

// ─── Writing section ──────────────────────────────────────────────────────
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
      <div
        ref={headerRef}
        className={`${styles.header} ${headerVis ? styles.headerVisible : ''}`}
      >
        <span className={styles.kicker}>Writing & Research</span>
        <h2 className={styles.heading}>PAPERS</h2>
      </div>

      {WRITING_PAPERS.map(paper => (
        <PaperBlock key={paper.id} paper={paper} onLinkHover={onLinkHover} />
      ))}

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