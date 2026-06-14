# 天气查询应用

基于 Vue 3 的天气查询 Web 应用，支持城市搜索、5天预报、城市列表管理、拖拽排序、深色模式等功能。

## 技术栈

- Vue 3 + Vite
- Pinia（状态管理）
- Vue Router（路由）
- ECharts（数据可视化）
- OpenWeatherMap API

## 功能特性

- 🔍 城市天气搜索（支持英文城市名）
- 📅 当前天气 + 5天天气预报
- 📌 我的城市列表（增删改查）
- 🖱️ 拖拽排序
- 📊 详情页温度趋势图表（ECharts）
- 🌙 深色/浅色主题切换
- 💾 localStorage 数据持久化
- 📱 响应式布局（PC + 移动端）

## 运行步骤

1. 安装依赖
npm install
2. 启动项目
npm run dev
3. 浏览器打开 http://localhost:5173

## 使用说明
搜索城市请输入英文名（如 Beijing、Shanghai）

点击城市卡片查看详情（含温度趋势图表）

按住左侧 ⋮⋮ 图标拖拽排序城市列表

点击右上角 🌓 切换深色模式

## 项目结构

src/
├── views/          # 页面组件
│   ├── HomeView.vue    # 首页
│   └── CityDetail.vue  # 详情页
├── stores/         # Pinia 状态管理
│   └── cityStore.js
├── utils/          # 工具函数
│   └── weatherApi.js   # API 封装
├── router/         # 路由配置
├── App.vue
└── main.js

## API

使用 OpenWeatherMap 免费天气 API

## 作者

刘雨鑫
