/**
 * [WHO]: 主应用组件，管理整个网站的阶段切换
 * [FROM]: 依赖 Scene 组件、useStage store
 * [TO]: 管理整个界面的渲染和交互
 * [HERE]: src/App.jsx - 应用核心
 */
import { useEffect, useState, useCallback } from 'react'
import Scene from './components/Scene'
import { useStage } from './store/useStage'

export default function App() {
  const { stage, setStage } = useStage()
  const [showScrollHint, setShowScrollHint] = useState(false)
  const [sloganVisible, setSloganVisible] = useState(false)
  const [projectsVisible, setProjectsVisible] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  
  // 自动播放逻辑：粒子Logo完成后显示滚动提示
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowScrollHint(true)
    }, 3000)
    
    // 滚动到第二屏时显示slogan
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      
      if (scrollY > windowHeight * 0.5 && !sloganVisible) {
        setSloganVisible(true)
      }
      
      if (scrollY > windowHeight * 1.5 && !projectsVisible) {
        setProjectsVisible(true)
      }
      
      if (scrollY > windowHeight * 2.5 && !showEnd) {
        setShowEnd(true)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => {
      clearTimeout(timer1)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [sloganVisible, projectsVisible, showEnd])
  
  const handleScroll = useCallback(() => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }, [])
  
  return (
    <div className="app">
      {/* 3D场景 - 全屏 */}
      <div className="scene-container">
        <Scene />
      </div>
      
      {/* 第一屏：Logo + 滚动提示 */}
      <section className="screen screen-1">
        <div className="content">
          {/* 3D场景已经有粒子Logo，这里只需空白，让用户"看" */}
        </div>
        
        {/* 滚动提示 - 只有粒子聚合后才显示 */}
        {showScrollHint && (
          <div 
            className={`scroll-hint ${showScrollHint ? 'visible' : ''}`}
            onClick={handleScroll}
          >
            <span className="scroll-arrow">↓</span>
          </div>
        )}
      </section>
      
      {/* 第二屏：一句话定义 */}
      <section className={`screen screen-2 ${sloganVisible ? 'visible' : ''}`}>
        <div className="slogan-container">
          <h1 className="slogan">
            {sloganVisible && (
              <>
                <span className="word">我</span>
                <span className="word">们</span>
                <span className="word">用</span>
                <span className="word">A</span>
                <span className="word">I</span>
                <span className="word">和</span>
                <span className="word">X</span>
                <span className="word">R</span>
                <br/>
                <span className="word">创</span>
                <span class="word">造</span>
                <span class="word">可</span>
                <span class="word">以</span>
                <span class="word">进</span>
                <span class="word">入</span>
                <span class="word">的</span>
                <span class="word">世</span>
                <span class="word">界</span>
              </>
            )}
          </h1>
        </div>
      </section>
      
      {/* 第三屏：作品展示 */}
      <section className={`screen screen-3 ${projectsVisible ? 'visible' : ''}`}>
        <div className="projects">
          <div className="project project-1">
            <div className="project-name">寻剑</div>
            <div className="project-desc">进入一段神话</div>
          </div>
          <div className="project project-2">
            <div className="project-name">奇幻巴比伦</div>
            <div className="project-desc">让消失的文明再次被看见</div>
          </div>
        </div>
      </section>
      
      {/* 第四屏：结束 */}
      <section className={`screen screen-4 ${showEnd ? 'visible' : ''}`}>
        <div className="end">
          <div className="end-logo">LINGX</div>
          <div className="end-email">CL@offthink.com</div>
        </div>
      </section>
    </div>
  )
}