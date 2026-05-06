import { useRef, useEffect, useState } from 'react'
import { EXPERIENCE, AWARDS, SKILLS } from '../data'
import styles from './Experience.module.css'

export default function Experience() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.05 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={ref} className={`${styles.section} ${visible ? styles.visible : ''}`}>
      <div className={styles.header}>
        <span className={styles.kicker}>Experience & Skills</span>
        <h2 className={styles.heading}>HISTORY</h2>
      </div>

      <div className={styles.grid}>
        {/* Timeline */}
        <div className={styles.timeline}>
          {EXPERIENCE.map((e, i) => (
            <div key={i} className={styles.timelineItem} style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <div className={styles.timePeriod}>{e.period}</div>
                <div className={styles.timeRole}>{e.role}</div>
                <div className={styles.timeCompany}>{e.company}</div>
                <p className={styles.timeDesc}>{e.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: skills + awards */}
        <div className={styles.rightCol}>
          {/* Skills */}
          <div className={styles.skillsBlock}>
            <div className={styles.blockTitle}>Stack</div>
            {Object.entries(SKILLS).map(([cat, items]) => (
              <div key={cat} className={styles.skillGroup}>
                <div className={styles.skillCat}>{cat}</div>
                <div className={styles.skillItems}>
                  {items.map(skill => (
                    <span key={skill} className={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Awards */}
          <div className={styles.awardsBlock}>
            <div className={styles.blockTitle}>Awards & Leadership</div>
            {AWARDS.map((a, i) => (
              <div key={i} className={styles.award}>
                <div className={styles.awardTitle}>{a.title}</div>
                <div className={styles.awardMeta}>{a.org} · {a.year}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
