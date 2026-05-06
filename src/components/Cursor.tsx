import { useEffect, useRef, useState } from 'react'
import styles from './Cursor.module.css'

interface CursorProps {
  gifSrc?: string
  isHoveringLink?: boolean
}

export default function Cursor({ gifSrc }: CursorProps) {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const ring = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const rafRef = useRef<number>()
  const [visible, setVisible] = useState(false)
  // Fix 5: track link state internally via elementFromPoint — never stale
  const isLinkRef = useRef(false)
  const [isLink, setIsLink] = useState(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)

      // Fix 5: precise per-move detection — no reliance on mouseover/mouseout bubbling
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      const overLink = !!(el?.closest('a, button, [role="button"]'))
      if (overLink !== isLinkRef.current) {
        isLinkRef.current = overLink
        setIsLink(overLink)
      }
    }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12
      ring.current.y += (pos.current.y - ring.current.y) * 0.12

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [visible])

  const hasGif = !!gifSrc
  // Fix 5: when a gif is active, never show link state
  const showLink = isLink && !hasGif

  return (
    <div className={styles.cursorRoot} style={{ opacity: visible ? 1 : 0 }}>
      <div
        ref={dotRef}
        className={`${styles.dot} ${hasGif ? styles.dotHidden : ''} ${showLink ? styles.dotLink : ''}`}
      />
      <div
        ref={ringRef}
        className={`${styles.ring} ${hasGif ? styles.ringGif : ''} ${showLink ? styles.ringLink : ''}`}
      >
        {hasGif && (
          <img src={gifSrc} alt="cursor gif" className={styles.gif} />
        )}
        {showLink && !hasGif && (
          <span className={styles.viewText}>VIEW</span>
        )}
      </div>
    </div>
  )
}
