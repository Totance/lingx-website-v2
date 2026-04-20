/**
 * [WHO]: 背景空间流动效果 - 提供沉浸式空间感
 * [FROM]: 依赖 three, @react-three/fiber
 * [TO]: 作为背景，增强网站的"空间体验"感
 * [HERE]: src/components/WorldFlow.jsx - 氛围背景层
 */
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
uniform float uTime;
varying float vAlpha;

void main() {
  vec3 pos = position;
  
  // 缓慢流动
  float wave = sin(pos.x * 0.5 + uTime * 0.2) * cos(pos.y * 0.5 + uTime * 0.15);
  pos.z += wave * 0.3;
  pos.x += sin(uTime * 0.1 + pos.y * 0.3) * 0.2;
  
  // 距离中心的距离决定透明度
  float dist = length(pos.xy);
  vAlpha = smoothstep(8.0, 2.0, dist) * 0.15;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = 3.0 * (200.0 / -mvPosition.z);
}
`

const fragmentShader = `
precision mediump float;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  
  float strength = 1.0 - smoothstep(0.0, 0.5, d);
  vec3 color = vec3(0.3, 0.4, 0.7);
  
  gl_FragColor = vec4(color, strength * vAlpha);
}
`

export default function WorldFlow() {
  const pointsRef = useRef()
  
  const { geometry, material } = useMemo(() => {
    const count = 1500
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // 分布在更大的空间中
      const radius = 3 + Math.random() * 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i * 3 + 0] = radius * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(theta)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    
    return { geometry: geo, material: mat }
  }, [])
  
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    
    // 整体缓慢旋转
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005
      pointsRef.current.rotation.x += 0.0002
    }
  })
  
  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  )
}