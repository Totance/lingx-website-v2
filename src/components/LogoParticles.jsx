/**
 * [WHO]: Logo粒子动画系统 - 支持3种随机入场效果
 * [FROM]: 依赖 three, @react-three/fiber, useStage store
 * [TO]: 展示品牌核心记忆点 - 粒子聚合/光扫/雾化
 * [HERE]: src/components/LogoParticles.jsx - 品牌核心视觉
 */
import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStage, STAGES } from '../store/useStage'

// LOGO.svg路径数据 - LINGX文字
const LOGO_POINTS = []
// 手动构建LINGX文字的粒子点
const buildLogoPoints = () => {
  const points = []
  const scale = 0.08
  
  // L - 左侧大L
  for (let i = 0; i < 40; i++) points.push(-2.8 + Math.random() * 0.3, 0.8 + Math.random() * 0.1, 0) // 上横
  for (let i = 0; i < 60; i++) points.push(-2.8 + Math.random() * 0.2, -0.8 + Math.random() * 1.6, 0) // 竖
  
  // I - 短竖
  for (let i = 0; i < 40; i++) points.push(-1.8 + Math.random() * 0.3, 0.8 + Math.random() * 0.1, 0)
  for (let i = 0; i < 80; i++) points.push(-1.8 + Math.random() * 0.2, -0.8 + Math.random() * 1.6, 0)
  
  // N - 竖-斜-竖
  for (let i = 0; i < 30; i++) points.push(-1.2 + Math.random() * 0.2, 0.8 + Math.random() * 0.1, 0)
  for (let i = 0; i < 70; i++) points.push(-1.2 + Math.random() * 0.2, -0.8 + Math.random() * 1.6, 0)
  for (let i = 0; i < 50; i++) { // 斜线
    const t = Math.random()
    points.push(-1.2 + t * 0.6, 0.8 - t * 1.6, 0)
  }
  for (let i = 0; i < 30; i++) points.push(-0.6 + Math.random() * 0.2, 0.8 + Math.random() * 0.1, 0)
  for (let i = 0; i < 70; i++) points.push(-0.6 + Math.random() * 0.2, -0.8 + Math.random() * 1.6, 0)
  
  // G -弧形
  for (let i = 0; i < 80; i++) {
    const angle = -Math.PI * 0.3 + Math.random() * Math.PI * 1.3
    const r = 0.5 + Math.random() * 0.2
    points.push(0.3 + Math.cos(angle) * r, Math.sin(angle) * r * 1.2, 0)
  }
  for (let i = 0; i < 40; i++) points.push(0.3 + Math.random() * 0.8, -0.3 + Math.random() * 0.2, 0) // 横
  
  // X - 叉
  for (let i = 0; i < 50; i++) { // 左上到右下
    const t = Math.random()
    points.push(1.2 + t * 0.8 - 0.4, 0.8 - t * 1.6, 0)
  }
  for (let i = 0; i < 50; i++) { // 右上到左下
    const t = Math.random()
    points.push(2.0 - t * 0.8 + 0.4, 0.8 - t * 1.6, 0)
  }
  
  return points.map(p => p * scale)
}

// Shader: 粒子聚合效果
const vertexShaderParticles = `
uniform float uProgress;
uniform float uTime;
uniform float uEntranceType;

attribute vec3 aTarget;
attribute float aRandom;

varying float vAlpha;
varying float vProgress;

void main() {
  vec3 pos = position;
  float progress = smoothstep(0.0, 1.0, uProgress);
  
  // 类型0: 粒子聚合 - 从随机位置飞向目标
  vec3 target0 = mix(pos, aTarget, progress);
  
  // 类型1: 光扫 - 从左到右扫描
  vec3 target1 = aTarget;
  float sweep = smoothstep(0.0, 1.0, uProgress * 1.5 - aRandom * 0.5);
  target1.x = mix(-10.0, target1.x, sweep);
  
  // 类型2: 雾化 - 从中心扩散
  vec3 target2 = aTarget;
  float expand = smoothstep(0.0, 1.0, uProgress * 1.2 + aRandom * 0.3);
  target2 = mix(vec3(0.0), target2, expand);
  
  vec3 finalPos;
  if (uEntranceType < 0.5) finalPos = target0;
  else if (uEntranceType < 1.5) finalPos = target1;
  else finalPos = target2;
  
  // 完成后微动
  float floatAmt = sin(uTime * 1.5 + aRandom * 6.28) * 0.015 * progress;
  finalPos.y += floatAmt;
  
  vAlpha = progress;
  vProgress = uProgress;
  
  vec4 mvPos = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPos;
  gl_PointSize = (2.0 + aRandom * 2.0) * (300.0 / -mvPos.z);
}
`

const fragmentShaderParticles = `
precision mediump float;
varying float vAlpha;
varying float vProgress;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  
  float strength = pow(1.0 - d * 2.0, 1.5);
  
  // 蓝紫渐变
  vec3 color = mix(
    vec3(0.2, 0.3, 0.6),
    vec3(0.6, 0.7, 1.0),
    vProgress
  );
  
  // 完成后更亮
  float brightness = 0.5 + vProgress * 0.5;
  
  gl_FragColor = vec4(color * brightness, strength * vAlpha);
}
`

export default function LogoParticles() {
  const pointsRef = useRef()
  const materialRef = useRef()
  const { 
    entranceType, 
    setEntranceType,
    entranceProgress, 
    setEntranceProgress,
    setEntranceComplete,
    setReadyToScroll
  } = useStage()
  
  // 随机选择入场效果
  useEffect(() => {
    const randomType = Math.floor(Math.random() * 3)
    setEntranceType(randomType)
  }, [setEntranceType])
  
  // 构建粒子几何体
  const { geometry, material } = useMemo(() => {
    const basePoints = buildLogoPoints()
    const particleCount = 4000
    const positions = new Float32Array(particleCount * 3)
    const targets = new Float32Array(particleCount * 3)
    const randoms = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      const pointIndex = (i % (basePoints.length / 3)) * 3
      
      // 初始位置：根据入场类型
      let startX, startY, startZ
      const type = entranceType
      
      if (type === 0) {
        // 粒子聚合：随机分布
        startX = (Math.random() - 0.5) * 15
        startY = (Math.random() - 0.5) * 15
        startZ = (Math.random() - 0.5) * 8
      } else if (type === 1) {
        // 光扫：从左侧
        startX = -10 + Math.random() * 2
        startY = (Math.random() - 0.5) * 10
        startZ = (Math.random() - 0.5) * 5
      } else {
        // 雾化：从中心
        startX = (Math.random() - 0.5) * 2
        startY = (Math.random() - 0.5) * 2
        startZ = (Math.random() - 0.5) * 2
      }
      
      positions[i * 3] = startX
      positions[i * 3 + 1] = startY
      positions[i * 3 + 2] = startZ
      
      // 目标位置
      targets[i * 3] = basePoints[pointIndex] || 0
      targets[i * 3 + 1] = basePoints[pointIndex + 1] || 0
      targets[i * 3 + 2] = basePoints[pointIndex + 2] || 0
      
      randoms[i] = Math.random()
    }
    
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3))
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
    
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uEntranceType: { value: entranceType }
      },
      vertexShader: vertexShaderParticles,
      fragmentShader: fragmentShaderParticles,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    
    return { geometry: geo, material: mat }
  }, [entranceType])
  
  // 动画循环
  useFrame((state, delta) => {
    if (!material) return
    
    material.uniforms.uTime.value = state.clock.elapsedTime
    
    // 动画进度 - 4秒完成
    const duration = 4000
    const elapsed = state.clock.elapsedTime * 1000
    const newProgress = Math.min(elapsed / duration, 1)
    
    setEntranceProgress(newProgress)
    material.uniforms.uProgress.value = newProgress
    
    // 完成时触发
    if (newProgress >= 0.98 && !useStage.getState().entranceComplete) {
      setEntranceComplete(true)
      setReadyToScroll(true)
    }
  })
  
  if (!geometry) return null
  
  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  )
}