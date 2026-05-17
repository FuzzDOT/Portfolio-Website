/**
 * Cursor.tsx
 *
 * Fix: the rAF animation loop was inside the same useEffect as the
 * mousemove listener, which had [visible] as a dependency. Every time
 * visibility changed (e.g. moving onto the iframe area) the effect
 * tore down and re-mounted, causing a single frame where the ring
 * jumped back to 0,0 and the native cursor briefly showed.
 *
 * Solution: two separate effects.
 *   1. Event-listener effect — no dependencies, runs once on mount.
 *      Updates pos.current and isLinkRef.current via elementFromPoint.
 *   2. rAF effect — no dependencies, runs once on mount.
 *      Reads pos.current and ring.current each frame.
 *      Never torn down except on unmount.
 */

import { useEffect, useRef, useState } from 'react'
import styles from './Cursor.module.css'

interface CursorProps {
  gifSrc?: string
}

export default function Cursor({ gifSrc }: CursorProps) {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  const pos  = useRef({ x: -200, y: -200 })
  const ring = useRef({ x: -200, y: -200 })
  const rafRef = useRef<number>()

  const [visible, setVisible]   = useState(false)
  const isLinkRef  = useRef(false)
  const [isLink, setIsLink]      = useState(false)

  // ── Effect 1: event listeners (mount/unmount only) ──────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      setVisible(true)

      // Detect interactive element under cursor.
      // elementFromPoint is accurate even over iframes with pointer-events:none.
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      const over = !!(el?.closest('a, button, [role="button"]'))
      if (over !== isLinkRef.current) {
        isLinkRef.current = over
        setIsLink(over)
      }
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, []) // ← no dependencies — never re-runs, never drops

  // ── Effect 2: rAF loop (mount/unmount only) ──────────────────────────────
  useEffect(() => {
    const animate = () => {
      // Smooth ring follows dot
      ring.current.x += (pos.current.x - ring.current.x) * 0.12
      ring.current.y += (pos.current.y - ring.current.y) * 0.12

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ring.current.x}px, ${ring.current.y}px)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, []) // ← no dependencies — runs forever, never re-registers

  const hasGif   = !!gifSrc
  const showLink = isLink && !hasGif

  return (
    <div className={styles.cursorRoot} style={{ opacity: visible ? 1 : 0 }}>
      <div
        ref={dotRef}
        className={`
          ${styles.dot}
          ${hasGif    ? styles.dotHidden : ''}
          ${showLink  ? styles.dotLink   : ''}
        `}
      />
      <div
        ref={ringRef}
        className={`
          ${styles.ring}
          ${hasGif   ? styles.ringGif  : ''}
          ${showLink ? styles.ringLink : ''}
        `}
      >
        {hasGif && (
          <img src={gifSrc} alt="" className={styles.gif} />
        )}
        {showLink && (
          <span className={styles.viewText}>VIEW</span>
        )}
      </div>
    </div>
  )
}