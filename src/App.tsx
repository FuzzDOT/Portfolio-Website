import { useState, useEffect, useCallback, useRef } from 'react'
import Cursor from './components/Cursor'
import Loader from './components/Loader'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ProjectSequence from './components/ProjectSequence'
import About from './components/About'
import Writing from './components/Writing'
import Experience from './components/Experience'
import Footer from './components/Footer'
import EasterEgg from './components/EasterEgg'
import BlockScreen from './components/BlockScreen';
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

  const noop = useCallback(() => {}, [])

  return (
    <>
      <BlockScreen />
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

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

        <Writing onLinkHover={noop} />

        <Experience />

        <Footer onLinkHover={noop} />
      </div>
    </>
  )
}