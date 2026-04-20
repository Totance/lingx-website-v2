/**
 * [WHO]: 管理网站的阶段状态
 * [FROM]: 依赖 zustand
 * [TO]: 被 Scene、App 组件使用
 * [HERE]: src/store/useStage.js - 状态管理
 */
import { create } from 'zustand'

export const useStage = create((set) => ({
  stage: 0, // 0: 粒子聚合中 1: Logo完成等待滚动 2: slogan显示 3: 项目显示 4: 结束
  setStage: (v) => set({ stage: v }),
  
  // 动画进度（0-1）
  animationProgress: 0,
  setAnimationProgress: (v) => set({ animationProgress: v }),
  
  // 是否准备好滚动
  readyToScroll: false,
  setReadyToScroll: (v) => set({ readyToScroll: v }),
}))