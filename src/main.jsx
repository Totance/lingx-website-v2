/**
 * [WHO]: 入口文件，启动React应用
 * [FROM]: 依赖 index.html 和 App 组件
 * [TO]: 渲染整个应用到 root 元素
 * [HERE]: 项目根目录，应用的启动点
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)