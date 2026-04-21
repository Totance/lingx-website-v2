/**
 * [WHO]: Three.js 场景容器
 * [FROM]: 依赖 @react-three/fiber, THREE, LogoParticles, StarField
 * [TO]: 渲染整个3D场景
 * [HERE]: src/components/Scene.jsx - 3D场景根组件
 */
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import LogoParticles from './LogoParticles'
import StarField from './StarField'
import { useStage, STAGES } from '../store/useStage'

function SceneContent() {
  const { currentStage, entranceComplete, stageVisible } = useStage()
  
  return (
    <>
      <color attach="background" args={['#050A18']} />
      
      {/* 背景星空 */}
      <StarField />
      
      {/* Entrance阶段显示Logo粒子 */}
      {stageVisible[STAGES.ENTRANCE] && (
        <LogoParticles />
      )}
      
      {/* 简单的环境光 */}
      <ambientLight intensity={0.2} />
    </>
  )
}

export default function Scene() {
  const { currentStage } = useStage()
  
  return (
    <Canvas
      camera={{ position: [0, 0, 1.2], fov: 85, near: 0.1, far: 100 }}
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      }}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none'
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x050A18)
      }}
    >
      <SceneContent />
    </Canvas>
  )
}