/**
 * [WHO]: Three.js 3D场景容器
 * [FROM]: 依赖 @react-three/fiber, @react-three/drei, LogoParticles组件
 * [TO]: 渲染整个3D场景到Canvas
 * [HERE]: src/components/Scene.jsx - 3D场景根组件
 */
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import LogoParticles from './LogoParticles'
import WorldFlow from './WorldFlow'

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      }}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: 1
      }}
    >
      <color attach="background" args={['#050A18']} />
      
      {/* 环境光 */}
      <ambientLight intensity={0.3} />
      
      {/* 核心：粒子Logo动画系统 */}
      <LogoParticles />
      
      {/* 背景：缓慢流动的空间 */}
      <WorldFlow />
      
      {/* 相机控制（禁用缩放） */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        enableRotate={false}
      />
    </Canvas>
  )
}