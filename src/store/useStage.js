/**
 * [WHO]: 管理网站的5个沉浸式阶段状态
 * [FROM]: 依赖 zustand
 * [TO]: 被 Scene、App、所有组件使用
 * [HERE]: src/store/useStage.js - 状态管理核心
 */
import { create } from 'zustand'

export const STAGES = {
  ENTRANCE: 0,    // Logo粒子聚合/光扫/雾化显现
  STATEMENT: 1,   // 一句话定义
  VISION: 2,      // 愿景
  WORKS: 3,       // 作品展示
  CONTACT: 4      // 联系
}

export const useStage = create((set) => ({
  // 当前阶段 (0-4)
  currentStage: STAGES.ENTRANCE,
  setCurrentStage: (stage) => set({ currentStage: stage }),
  
  // 上一阶段
  prevStage: STAGES.ENTRANCE,
  setPrevStage: (stage) => set({ prevStage: stage }),
  
  // 阶段切换中
  isTransitioning: false,
  setIsTransitioning: (v) => set({ isTransitioning: v }),
  
  // Entrance动画专用
  entranceType: 0, // 0:粒子聚合 1:光扫 2:雾化
  setEntranceType: (v) => set({ entranceType: v }),
  
  // Entrance动画进度 (0-1)
  entranceProgress: 0,
  setEntranceProgress: (v) => set({ entranceProgress: v }),
  
  // Entrance完成标志
  entranceComplete: false,
  setEntranceComplete: (v) => set({ entranceComplete: v }),
  
  // 各阶段可见性
  stageVisible: {
    [STAGES.ENTRANCE]: true,
    [STAGES.STATEMENT]: false,
    [STAGES.VISION]: false,
    [STAGES.WORKS]: false,
    [STAGES.CONTACT]: false
  },
  setStageVisible: (stage, visible) => set((state) => ({
    stageVisible: { ...state.stageVisible, [stage]: visible }
  })),
  
  // 滚动位置
  scrollY: 0,
  setScrollY: (y) => set({ scrollY: y }),
  
  // 是否准备好滚动（Entrance完成后）
  readyToScroll: false,
  setReadyToScroll: (v) => set({ readyToScroll: v }),
}))