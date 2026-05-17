/**
 * Writing.tsx — Apple-style scroll-driven PDF reader
 *
 * PDF RENDERING: pdfjs-dist renders each page to a <canvas>.
 * Pages live in a tall <div> whose scrollTop we control directly — no iframe,
 * no cross-origin issues, no focus required, cursor always tracked correctly.
 *
 * INSTALL FIRST:  npm install pdfjs-dist
 *
 * Worker note: the workerSrc line below uses Vite's import.meta.url to
 * resolve the worker file from node_modules automatically. If you get a
 * worker 404, change workerSrc to:
 *   '/node_modules/pdfjs-dist/build/pdf.worker.min.mjs'
 *
 * PDF_PATH: set paper.pdfUrl in data.ts → WRITING_PAPERS.
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { WRITING_PAPERS } from '../data'
import styles from './Writing.module.css'

// ── pdf.js worker (Vite-friendly) ─────────────────────────────────────────
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href

// ─── Constants ───────────────────────────────────────────────────────────
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

// ─── Hook: load + render all PDF pages to canvases ───────────────────────
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
          const page = await pdf.getPage(p)
          const baseVp = page.getViewport({ scale: 1 })
          const scale  = viewportW / baseVp.width
          const vp     = page.getViewport({ scale })

          const canvas = document.createElement('canvas')
          const dpr    = window.devicePixelRatio || 1
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

  // Raw animation targets (mutated in scroll handler, read in rAF)
  const tgtScale = useRef(SCALE_MIN)
  const curScale = useRef(SCALE_MIN)
  const tgtProg  = useRef(0)
  const curProg  = useRef(0)
  const phaseRef = useRef<Phase>('pre')
  const rafRef   = useRef<number>()

  // React state — only for rendering, not for animation math
  const [scale, setScale]               = useState(SCALE_MIN)
  const [readProgress, setReadProgress] = useState(0)
  const [phase, setPhase]               = useState<Phase>('pre')

  const { canvases, pageCount, loading } = usePdfCanvases(paper.pdfUrl)

  // Attach rendered canvases into the scroll div when they arrive
  const attachRef = useCallback((node: HTMLDivElement | null) => {
    scrollDivRef.current = node
    if (!node) return
    node.innerHTML = ''
    canvases.forEach(c => node.appendChild(c))
  }, [canvases])

  // ── Scroll → animation targets ────────────────────────────────────
  const computeTargets = useCallback(() => {
    const section = sectionRef.current
    if (!section) return
    const top       = section.getBoundingClientRect().top + window.scrollY
    const maxScroll = section.offsetHeight - window.innerHeight
    const scrollIn  = window.scrollY - top

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
    return () => window.removeEventListener('scroll', computeTargets)
  }, [computeTargets])

  // ── rAF lerp loop ─────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      curScale.current += (tgtScale.current - curScale.current) * SCALE_LERP
      curProg.current  += (tgtProg.current  - curProg.current)  * PROG_LERP

      // Drive the scroll div — this is what actually scrolls the PDF content
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

  // ── Derived display values ────────────────────────────────────────
  const totalPages  = pageCount || paper.pageCount
  const currentPage = Math.max(1, Math.round(readProgress * (totalPages - 1)) + 1)
  const showInfo    = phase !== 'pre' && phase !== 'post'
  const showHint    = phase === 'zoomIn'
  const showCount   = (phase === 'read' || phase === 'zoomOut') && totalPages > 0

  return (
    <div
      ref={sectionRef}
      className={styles.paperSection}
      style={{ height: `${TOTAL_VH * 100}svh` }}
    >
      <div className={styles.paperSticky}>

        {/* Scaled paper */}
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

            {/*
             * pdfScrollContainer: overflow:hidden so no native scrollbar,
             * pointerEvents:none so the cursor is never captured by canvas elements.
             * We set scrollTop in the rAF loop — no user interaction needed.
             */}
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

        {/* Apple-glass info panel */}
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

        {/* Page counter */}
        {totalPages > 0 && (
          <div className={`${styles.pageCounter} ${showCount ? styles.pageCounterVisible : ''}`}>
            {currentPage} / {totalPages}
          </div>
        )}

        {/* Scroll hint */}
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