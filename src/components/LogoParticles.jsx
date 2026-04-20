/**
 * [WHO]: 核心粒子Logo动画系统 - 从混沌粒子聚合形成Logo
 * [FROM]: 依赖 three, @react-three/fiber, SVGLoader, useStage store
 * [TO]: 展示粒子Logo动画，是网站的核心记忆点
 * [HERE]: src/components/LogoParticles.jsx - 品牌核心视觉
 */
import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { useStage } from '../store/useStage'

// 内联SVG路径（基于LOGO.svg）
const LOGO_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 635.09 141.73">
<g id="LINGX">
  <polygon points="209.73 101.97 209.73 28.32 198.4 28.32 198.4 113.31 256.76 113.31 256.76 101.97 209.73 101.97"/>
  <rect x="283.39" y="28.32" width="11.33" height="85"/>
  <rect x="336.07" y="28.32" width="11.33" height="84.98"/>
  <rect x="393.75" y="28.32" width="11.33" height="84.98"/>
  <polygon points="405.08 113.31 391.69 113.31 336.07 28.32 349.46 28.32 405.08 113.31"/>
  <polygon points="516.75 65.14 474.6 65.14 474.6 76.49 516.75 76.49"/>
  <path d="M505.24 76.49a31.26 31.26 0 1 1-8.63-27.57l8.17-8.17A42.91 42.91 0 0 0 474.6 28.38a42.49 42.49 0 1 0 42.18 48.11"/>
  <polygon points="561.14 28.32 547.65 28.32 575.64 70.81 547.65 113.31 561.14 113.31 589.01 70.81 561.14 28.32"/>
  <polygon points="621.61 28.32 635.09 28.32 607.1 70.81 635.09 113.31 621.61 113.31 593.73 70.81 621.61 28.32"/>
  <rect x="93.67" y="40.41" width="24.09" height="60.94" rx="12.05"/>
  <path d="M103.92 99.21c-22.47 0-40.06-12.45-40.06-28.34s17.59-28.35 40.06-28.35c17.24 0 31.61 7.34 37.36 17.95a.24.24 0 0 0 .45-.15A71.14 71.14 0 0 0 71.26 0C31.9 0 0 31.73 0 70.87s31.9 70.86 71.26 70.86a71.15 71.15 0 0 0 70.43-60.07a.28.28 0 0 0-.53-.18C135.34 92 121.05 99.21 103.92 99.21"/>
</g>
</svg>`

// Vertex Shader - 粒子动画核心
const vertexShader = `
uniform float uProgress;
uniform float uTime;
uniform vec2 uMouse;

attribute vec3 aTargetPosition;
attribute float aRandom;
attribute float aSize;

varying float vAlpha;
varying float vProgress;

void main() {
  vec3 pos = position;
  
  // 初始扰动（漂浮感）
  float floatStrength = 0.15;
  pos.x += sin(uTime * 0.8 + aRandom * 6.28) * floatStrength;
  pos.y += cos(uTime * 0.6 + aRandom * 6.28) * floatStrength;
  pos.z += sin(uTime * 0.5 + aRandom * 3.14) * floatStrength * 0.5;
  
  // 核心：从随机位置插值到Logo目标位置
  float easedProgress = smoothstep(0.0, 1.0, uProgress);
  vec3 finalPos = mix(pos, aTargetPosition, easedProgress);
  
  // 聚合后的呼吸效果（非常轻）
  float breath = sin(uTime * 1.5 + aRandom * 6.28) * 0.02 * easedProgress;
  finalPos += normalize(finalPos) * breath;
  
  // 鼠标轻微扰动（交互）
  vec2 mouseEffect = uMouse - vec2(0.0);
  float dist = length(finalPos.xy - mouseEffect * 2.0);
  float mouseInfluence = smoothstep(3.0, 0.0, dist) * 0.1 * easedProgress;
  finalPos.xy += normalize(finalPos.xy + vec2(0.001)) * mouseInfluence;
  
  vAlpha = easedProgress;
  vProgress = easedProgress;
  
  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // 粒子大小：聚合时变大
  float size = aSize * (1.0 + easedProgress * 1.5);
  gl_PointSize = size * (300.0 / -mvPosition.z);
}
`

// Fragment Shader - 发光粒子效果
const fragmentShader = `
precision mediump float;

varying float vAlpha;
varying float vProgress;

void main() {
  // 圆形粒子
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  
  // 柔和边缘
  float strength = 1.0 - smoothstep(0.0, 0.5, d);
  strength = pow(strength, 1.5);
  
  // 颜色渐变：蓝色 -> 蓝紫色 -> 白色
  vec3 colorA = vec3(0.25, 0.35, 0.65);  // 深蓝
  vec3 colorB = vec3(0.45, 0.55, 0.95);  // 浅蓝
  vec3 colorC = vec3(0.85, 0.80, 1.0);   // 蓝白
  
  vec3 color;
  if (vProgress < 0.5) {
    color = mix(colorA, colorB, vProgress * 2.0);
  } else {
    color = mix(colorB, colorC, (vProgress - 0.5) * 2.0);
  }
  
  // 聚合越完整越亮
  float brightness = 0.4 + vProgress * 0.6;
  
  gl_FragColor = vec4(color * brightness, strength * vAlpha);
}
`

export default function LogoParticles() {
  const pointsRef = useRef()
  const materialRef = useRef()
  const [logoPoints, setLogoPoints] = useState(null)
  const { setReadyToScroll } = useStage()
  
  // 加载SVG并转换为粒子点
  useEffect(() => {
    const loader = new SVGLoader()
    const svgData = loader.parse(LOGO_SVG)
    const paths = svgData.paths
    
    const points = []
    const density = 4 // 采样密度
    
    paths.forEach((path) => {
      const shapes = path.toShapes(true)
      shapes.forEach((shape) => {
        const spacedPoints = shape.getSpacedPoints(150)
        spacedPoints.forEach((point) => {
          // 添加一些随机偏移增加自然感
          const jitter = 0.02
          points.push(
            (point.x / 10) + (Math.random() - 0.5) * jitter,
            (-point.y / 10) + (Math.random() - 0.5) * jitter,
            0
          )
        })
      })
    })
    
    // 补齐到目标数量
    const targetCount = 6000
    while (points.length < targetCount * 3) {
      points.push(0, 0, 0)
    }
    
    // 计算中心并归一化
    const count = Math.min(points.length / 3, targetCount)
    let cx = 0, cy = 0, cz = 0
    for (let i = 0; i < count; i++) {
      cx += points[i * 3]
      cy += points[i * 3 + 1]
      cz += points[i * 3 + 2]
    }
    cx /= count
    cy /= count
    cz /= count
    
    for (let i = 0; i < count * 3; i += 3) {
      points[i] -= cx
      points[i + 1] -= cy
      points[i + 2] -= cz
    }
    
    setLogoPoints(new Float32Array(points.slice(0, targetCount * 3)))
  }, [])
  
  // 创建粒子几何体
  const { geometry, count } = useMemo(() => {
    if (!logoPoints) return { geometry: null, count: 0 }
    
    const particleCount = logoPoints.length / 3
    const positions = new Float32Array(particleCount * 3)
    const targets = new Float32Array(particleCount * 3)
    const randoms = new Float32Array(particleCount)
    const sizes = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      // 初始位置：随机分布在空间中
      positions[i * 3 + 0] = (Math.random() - 0.5) * 8
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
      
      // 目标位置：Logo形状
      targets[i * 3 + 0] = logoPoints[i * 3] || 0
      targets[i * 3 + 1] = logoPoints[i * 3 + 1] || 0
      targets[i * 3 + 2] = logoPoints[i * 3 + 2] || 0
      
      randoms[i] = Math.random()
      sizes[i] = 1.5 + Math.random() * 1.5
    }
    
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aTargetPosition', new THREE.BufferAttribute(targets, 3))
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    
    return { geometry: geo, count: particleCount }
  }, [logoPoints])
  
  // Shader材质
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  }, [])
  
  // 动画循环
  useFrame((state) => {
    if (!material || !geometry) return
    
    const time = state.clock.elapsedTime
    material.uniforms.uTime.value = time
    
    // 聚合约3秒完成
    const targetProgress = 1
    const currentProgress = material.uniforms.uProgress.value
    const speed = 0.004 // 非常慢的速度，更有高级感
    
    if (currentProgress < targetProgress) {
      const newProgress = Math.min(currentProgress + speed, targetProgress)
      material.uniforms.uProgress.value = newProgress
      
      //当聚合完成时，允许滚动
      if (newProgress >= 0.99 && !useStage.getState().readyToScroll) {
        setReadyToScroll(true)
      }
    }
    
    // 轻微相机运动（空间呼吸感）
    const camera = state.camera
    camera.position.x = Math.sin(time * 0.3) * 0.1
    camera.position.y = Math.cos(time * 0.2) * 0.1
    
    // 鼠标交互
    material.uniforms.uMouse.value.x = state.pointer.x * 1.5
    material.uniforms.uMouse.value.y = state.pointer.y * 1.5
  })
  
  if (!geometry) return null
  
  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  )
}