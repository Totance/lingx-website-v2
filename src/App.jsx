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
  const isScrolling = useRef(false)
  
  // Entrance完成后允许滚动
  useEffect(() => {
    if (entranceComplete) {
      setTimeout(() => setCanScroll(true), 500)
    }
  }, [entranceComplete])
  
  // 监听滚动容器来更新阶段
  useEffect(() => {
    if (!containerRef.current) return
    
    const handleScroll = () => {
      if (!canScroll || !entranceComplete || isScrolling.current) return
      
      const container = containerRef.current
      const scrollTop = container.scrollTop
      const windowHeight = window.innerHeight
      const newStage = Math.round(scrollTop / windowHeight)
      
      if (newStage !== useStage.getState().currentStage && newStage >= 0 && newStage <= 4) {
        useStage.getState().setCurrentStage(newStage)
        useStage.getState().setStageVisible(newStage, true)
      }
    }
    
    const container = containerRef.current
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [canScroll, entranceComplete])
  
  // 滚动处理
  useEffect(() => {
    const handleWheel = (e) => {
      if (!canScroll || !entranceComplete || isScrolling.current) return
      
      const delta = e.deltaY
      const windowHeight = window.innerHeight
      const container = containerRef.current
      const currentScroll = container.scrollTop
      const currentStageLocal = Math.round(currentScroll / windowHeight)
      
      if (delta > 0 && currentStageLocal < 4) {
        // 向下滚动 - 下一阶段
        isScrolling.current = true
        const nextStage = currentStageLocal + 1
        setStageVisible(nextStage, true)
        setCurrentStage(nextStage)
        
        container.scrollTo({
          top: nextStage * windowHeight,
          behavior: 'smooth'
        })
        
        setTimeout(() => { isScrolling.current = false }, 800)
      } else if (delta < 0 && currentStageLocal > 0) {
        // 向上滚动 - 上一阶段
        isScrolling.current = true
        const prevStage = currentStageLocal - 1
        setCurrentStage(prevStage)
        setStageVisible(prevStage, true)
        
        container.scrollTo({
          top: prevStage * windowHeight,
          behavior: 'smooth'
        })
        
        setTimeout(() => { isScrolling.current = false }, 800)
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
          isScrolling.current = true
          const nextStage = currentStage + 1
          setStageVisible(nextStage, true)
          setCurrentStage(nextStage)
          containerRef.current.scrollTo({
            top: nextStage * window.innerHeight,
            behavior: 'smooth'
          })
          setTimeout(() => { isScrolling.current = false }, 800)
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (currentStage > 0) {
          isScrolling.current = true
          const prevStage = currentStage - 1
          setCurrentStage(prevStage)
          setStageVisible(prevStage, true)
          containerRef.current.scrollTo({
            top: prevStage * window.innerHeight,
            behavior: 'smooth'
          })
          setTimeout(() => { isScrolling.current = false }, 800)
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
      const container = containerRef.current
      const windowHeight = window.innerHeight
      const currentScroll = container.scrollTop
      const currentStageLocal = Math.round(currentScroll / windowHeight)
      
      if (diff > threshold && currentStageLocal < 4) {
        // 向上滑动 - 下一阶段
        isScrolling.current = true
        const nextStage = currentStageLocal + 1
        setStageVisible(nextStage, true)
        setCurrentStage(nextStage)
        container.scrollTo({
          top: nextStage * windowHeight,
          behavior: 'smooth'
        })
        setTimeout(() => { isScrolling.current = false }, 800)
      } else if (diff < -threshold && currentStageLocal > 0) {
        // 向下滑动 - 上一阶段
        isScrolling.current = true
        const prevStage = currentStageLocal - 1
        setCurrentStage(prevStage)
        setStageVisible(prevStage, true)
        container.scrollTo({
          top: prevStage * windowHeight,
          behavior: 'smooth'
        })
        setTimeout(() => { isScrolling.current = false }, 800)
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
      isScrolling.current = true
      setStageVisible(1, true)
      setCurrentStage(1)
      containerRef.current.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      })
      setTimeout(() => { isScrolling.current = false }, 800)
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