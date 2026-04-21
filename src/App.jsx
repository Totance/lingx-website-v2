/**
 * [WHO]: 主应用 - 5状态沉浸式体验
 * [FROM]: 依赖 Scene、useStage、GSAP
 * [TO]: 管理整个网站的渲染和交互
 * [HERE]: src/App.jsx - 应用核心
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Scene from './components/Scene'
import { useStage, STAGES } from './store/useStage'

// 各阶段的文案配置
const STAGE_CONTENT = {
  [STAGES.ENTRANCE]: {
    title: '',
    subtitle: ''
  },
  [STAGES.STATEMENT]: {
    title: '我们用AI和XR',
    subtitle: '创造可以进入的世界'
  },
  [STAGES.VISION]: {
    title: '点亮每个人心中的梦境',
    subtitle: 'LIGHT UP YOUR DREAMWORLD'
  },
  [STAGES.WORKS]: {
    projects: [
      { name: '寻剑', desc: '进入一段神话' },
      { name: '奇幻巴比伦', desc: '让消失的文明再次被看见' }
    ]
  },
  [STAGES.CONTACT]: {
    title: 'LINGX',
    email: 'CL@offthink.com'
  }
}

function ScrollHint({ visible, onClick }) {
  return (
    <div 
      className={`scroll-hint ${visible ? 'visible' : ''}`}
      onClick={onClick}
    >
      <div className="scroll-mouse">
        <div className="scroll-wheel"></div>
      </div>
      <span className="scroll-text">向下探索</span>
    </div>
  )
}

function StageContent({ stage, visible }) {
  const content = STAGE_CONTENT[stage]
  const itemRef = useRef(null)
  
  useEffect(() => {
    if (visible && itemRef.current) {
      gsap.fromTo(itemRef.current.children, 
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'power2.out' }
      )
    }
  }, [visible])
  
  if (!visible) return null
  
  switch (stage) {
    case STAGES.STATEMENT:
      return (
        <div className="stage-content statement" ref={itemRef}>
          <h1 className="main-title">{content.title}</h1>
          <p className="sub-title">{content.subtitle}</p>
        </div>
      )
      
    case STAGES.VISION:
      return (
        <div className="stage-content vision" ref={itemRef}>
          <h1 className="main-title">{content.title}</h1>
          <p className="sub-title en">{content.subtitle}</p>
        </div>
      )
      
    case STAGES.WORKS:
      return (
        <div className="stage-content works" ref={itemRef}>
          <div className="projects-grid">
            {content.projects.map((project, i) => (
              <div key={i} className="project-card">
                <div className="project-name">{project.name}</div>
                <div className="project-desc">{project.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )
      
    case STAGES.CONTACT:
      return (
        <div className="stage-content contact" ref={itemRef}>
          <div className="contact-logo">{content.title}</div>
          <a href={`mailto:${content.email}`} className="contact-email">
            {content.email}
          </a>
        </div>
      )
      
    default:
      return null
  }
}

export default function App() {
  const { 
    currentStage, 
    setCurrentStage, 
    entranceComplete,
    readyToScroll,
    setStageVisible,
    stageVisible
  } = useStage()
  
  const [canScroll, setCanScroll] = useState(false)
  const containerRef = useRef(null)
  
  // Entrance完成后允许滚动
  useEffect(() => {
    if (entranceComplete) {
      setTimeout(() => setCanScroll(true), 500)
    }
  }, [entranceComplete])
  
  // 滚动处理
  useEffect(() => {
    const handleWheel = (e) => {
      if (!canScroll || !entranceComplete) return
      
      const delta = e.deltaY
      const windowHeight = window.innerHeight
      
      if (delta > 0 && currentStage < 4) {
        // 向下滚动
        const nextStage = currentStage + 1
        setStageVisible(currentStage, true)
        setCurrentStage(nextStage)
        setStageVisible(nextStage, true)
        
        // 滚动到对应位置
        window.scrollTo({
          top: nextStage * windowHeight,
          behavior: 'smooth'
        })
      } else if (delta < 0 && currentStage > 0) {
        // 向上滚动
        const prevStage = currentStage - 1
        setCurrentStage(prevStage)
        
        window.scrollTo({
          top: prevStage * windowHeight,
          behavior: 'smooth'
        })
      }
    }
    
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [currentStage, canScroll, entranceComplete, setCurrentStage, setStageVisible])
  
  // 键盘导航
  useEffect(() => {
    const handleKey = (e) => {
      if (!canScroll || !entranceComplete) return
      
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        if (currentStage < 4) {
          const nextStage = currentStage + 1
          setStageVisible(nextStage, true)
          setCurrentStage(nextStage)
          window.scrollTo({
            top: nextStage * window.innerHeight,
            behavior: 'smooth'
          })
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (currentStage > 0) {
          const prevStage = currentStage - 1
          setCurrentStage(prevStage)
          window.scrollTo({
            top: prevStage * window.innerHeight,
            behavior: 'smooth'
          })
        }
      }
    }
    
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentStage, canScroll, entranceComplete, setCurrentStage, setStageVisible])
  
  // 移动端触摸手势支持
  useEffect(() => {
    let touchStartY = 0
    let touchEndY = 0
    
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }
    
    const handleTouchEnd = (e) => {
      if (!canScroll || !entranceComplete) return
      touchEndY = e.changedTouches[0].clientY
      const diff = touchStartY - touchEndY
      const threshold = 50
      
      if (diff > threshold && currentStage < 4) {
        // 向上滑动 - 下一阶段
        const nextStage = currentStage + 1
        setStageVisible(nextStage, true)
        setCurrentStage(nextStage)
        window.scrollTo({
          top: nextStage * window.innerHeight,
          behavior: 'smooth'
        })
      } else if (diff < -threshold && currentStage > 0) {
        // 向下滑动 - 上一阶段
        const prevStage = currentStage - 1
        setCurrentStage(prevStage)
        window.scrollTo({
          top: prevStage * window.innerHeight,
          behavior: 'smooth'
        })
      }
    }
    
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [currentStage, canScroll, entranceComplete, setCurrentStage, setStageVisible])
  
  const handleScrollClick = () => {
    if (canScroll && entranceComplete) {
      setStageVisible(1, true)
      setCurrentStage(1)
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      })
    }
  }
  
  return (
    <div className="app" ref={containerRef}>
      {/* 3D场景 - 全屏 */}
      <div className="scene-container">
        <Scene />
      </div>
      
      {/* 5个全屏阶段 */}
      <div className="stages-container">
        {/* Stage 0: Entrance - 只有粒子Logo */}
        <section className={`stage stage-0 ${stageVisible[0] ? 'visible' : ''}`}>
          {!entranceComplete && (
            <div className="loading-indicator">
              <span className="loading-dot"></span>
              <span className="loading-dot"></span>
              <span className="loading-dot"></span>
            </div>
          )}
          <ScrollHint visible={entranceComplete} onClick={handleScrollClick} />
        </section>
        
        {/* Stage 1: Statement */}
        <section className={`stage stage-1 ${stageVisible[1] ? 'visible' : ''}`}>
          <StageContent stage={STAGES.STATEMENT} visible={stageVisible[1]} />
        </section>
        
        {/* Stage 2: Vision */}
        <section className={`stage stage-2 ${stageVisible[2] ? 'visible' : ''}`}>
          <StageContent stage={STAGES.VISION} visible={stageVisible[2]} />
        </section>
        
        {/* Stage 3: Works */}
        <section className={`stage stage-3 ${stageVisible[3] ? 'visible' : ''}`}>
          <StageContent stage={STAGES.WORKS} visible={stageVisible[3]} />
        </section>
        
        {/* Stage 4: Contact */}
        <section className={`stage stage-4 ${stageVisible[4] ? 'visible' : ''}`}>
          <StageContent stage={STAGES.CONTACT} visible={stageVisible[4]} />
        </section>
      </div>
    </div>
  )
}