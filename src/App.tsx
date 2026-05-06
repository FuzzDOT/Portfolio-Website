import { useState, useEffect, useCallback, useRef } from 'react'
import Cursor from './components/Cursor'
import Loader from './components/Loader'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ProjectSequence from './components/ProjectSequence'
import About from './components/About'
import Experience from './components/Experience'
import Footer from './components/Footer'
import EasterEgg from './components/EasterEgg'
import { MOODS, EASTER_EGGS, type Mood } from './data'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [mood, setMood] = useState<Mood>('light')
  const [cursorGif, setCursorGif] = useState<string | undefined>()
  const [logoClickCount, setLogoClickCount] = useState(0)
  const [easterEgg, setEasterEgg] = useState<'konami' | 'logo' | null>(null)

  const konamiBuffer = useRef<string[]>([])
  const KONAMI = EASTER_EGGS.KONAMI

  // Persist mood
  useEffect(() => {
    const saved = localStorage.getItem('fm-mood') as Mood | null
    if (saved && MOODS.includes(saved)) setMood(saved)
  }, [])

  const handleMoodChange = useCallback((m: Mood) => {
    setMood(m)
    localStorage.setItem('fm-mood', m)
  }, [])

  // Apply mood to DOM
  useEffect(() => {
    if (mood === 'light') document.documentElement.removeAttribute('data-mood')
    else document.documentElement.setAttribute('data-mood', mood)
  }, [mood])

  // Konami code listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      konamiBuffer.current = [...konamiBuffer.current, e.key].slice(-KONAMI.length)
      if (konamiBuffer.current.join(',') === KONAMI.join(',')) {
        setEasterEgg('konami')
        konamiBuffer.current = []
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleLogoClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const count = logoClickCount + 1
    setLogoClickCount(count)
    if (count >= EASTER_EGGS.SECRET_CLICK_COUNT) {
      setEasterEgg('logo')
      setLogoClickCount(0)
    }
  }, [logoClickCount])

  // Fix 5: Cursor manages its own link-hover state internally via elementFromPoint.
  // Hero/Footer onLinkHover props are no longer needed for cursor — kept as no-ops
  // so we don't have to refactor those component signatures.
  const noop = useCallback(() => {}, [])

  return (
    <>
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      {/* Fix 5: only pass gifSrc — Cursor detects links itself */}
      <Cursor gifSrc={cursorGif} />

      {easterEgg && (
        <EasterEgg
          type={easterEgg}
          onClose={() => setEasterEgg(null)}
        />
      )}

      <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.5s' }}>
        <Nav
          mood={mood}
          onMoodChange={handleMoodChange}
          logoClickCount={logoClickCount}
          onLogoClick={handleLogoClick}
        />

        <Hero
          onGifChange={setCursorGif}
          onLinkHover={noop}
        />

        <About onGifHover={setCursorGif} />

        <ProjectSequence onLinkHover={noop} />

        <Experience />

        <Footer onLinkHover={noop} />
      </div>
    </>
  )
}
