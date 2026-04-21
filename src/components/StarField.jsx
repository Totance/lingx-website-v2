/**
 * [WHO]: 沉浸式背景星空系统
 * [FROM]: 依赖 three, @react-three/fiber
 * [TO]: 提供空间沉浸感
 * [HERE]: src/components/StarField.jsx - 氛围背景
 */
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
uniform float uTime;
varying float vAlpha;

void main() {
  vec3 pos = position;
  
  // 缓慢漂浮
  pos.x += sin(uTime * 0.1 + position.y * 0.5) * 0.3;
  pos.y += cos(uTime * 0.08 + position.x * 0.3) * 0.2;
  pos.z += sin(uTime * 0.12 + position.x * 0.4) * 0.2;
  
  float dist = length(pos.xy);
  vAlpha = smoothstep(12.0, 4.0, dist) * 0.2;
  
  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;
  gl_PointSize = 2.5 * (200.0 / -mvPos.z);
}
`

const fragmentShader = `
precision mediump float;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  
  float strength = pow(1.0 - d * 2.0, 2.0);
  vec3 color = vec3(0.4, 0.5, 0.8);
  
  gl_FragColor = vec4(color, strength * vAlpha);
}
`

export default function StarField() {
  const pointsRef = useRef()
  
  const { geometry, material } = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const radius = 4 + Math.random() * 8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i * 3] = radius * Math.cos(theta) * Math.sin(phi)
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6
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
    
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0003
    }
  })
  
  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  )
}