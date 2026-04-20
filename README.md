# LINGX 零想官网极限版

> 基于「零想官网极限版.docx」需求创建的React + Three.js粒子Logo动画网站

## 技术栈

- **React 19** + Vite 8
- **Three.js** + @react-three/fiber + @react-three/drei
- **Zustand** 状态管理
- **GLSL Shaders** 粒子动画

## 设计原则

根据「极限版」要求：

- **信息密度**：整个网站不超过120字
- **动效密度**：一个可交互的情绪装置
- **节奏**：慢 → 更慢 → 突然出现 → 再慢
- **留白**：大部分时间屏幕上什么都没有
- **极致克制**：无边框、无卡片、无UI感

## 页面结构

1. **进入页面** - 粒子→聚合→LOGO，带呼吸效果
2. **一句话页面** - "我们用AI和XR，创造可以进入的世界"
3. **作品页面** - 寻剑、奇幻巴比伦
4. **结束页面** - LINGX + 邮箱

## 核心效果

### 粒子Logo动画
- 从随机分布的混沌粒子
- 插值聚合形成LINGX Logo
- 聚合完成后有呼吸效果
- 鼠标交互轻微扰动

### 空间呼吸
- 3D场景整体轻微呼吸运动
- 背景粒子缓慢流动
- 相机轻微漂浮

## 运行

```bash
# 进入目录
cd lingx-website

# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建
pnpm run build
```

## 项目结构

```
src/
├── App.jsx              # 主应用 - 阶段管理
├── main.jsx             # 入口
├── index.css            # 全局样式
├── components/
│   ├── Scene.jsx        # Three.js场景容器
│   ├── LogoParticles.jsx # 核心粒子Logo动画
│   └── WorldFlow.jsx    # 背景空间流动
└── store/
    └── useStage.js      # 状态管理
```