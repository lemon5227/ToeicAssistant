# 墨韵 · 托业 (ToeicAssistant)

![App Icon](./assets/icon.png)

## 📖 项目简介 (Introduction)

**墨韵 · 托业** 是一款融合了中国传统水墨美学 (Guofeng Aesthetic) 的托业 (TOEIC) 备考辅助应用。本项目旨在摆脱传统英语学习应用枯燥的界面设计，通过“墨韵”、“印章”、“卷轴”等国风元素，为用户营造沉浸、宁静的学习氛围。

> "学而时习之，不亦说乎。"

## ✨ 核心功能 (Features)

*   **词汇研习 (Vocabulary)**: 采用翻转卡片与墨迹特效，提供高频词汇的记忆与自测。
*   **听音辨律 (Listening)**: 内置音频播放器，支持托业听力真题模拟，配合涟漪动画增强视觉反馈。
*   **经史阅览 (Reading)**: 独特的卷轴展开交互，提供舒适的阅读理解训练体验。
*   **金榜夺魁 (Mock Test)**: 全真模拟考试环境，考试结束通过“及第”印章展示成绩与荣誉。
*   **错题拾遗 (Mistake Review)**: 自动记录错题，生成个人专属的错题本（书签交互）。
*   **通关文牒 (User Profile)**: 个人学习数据统计，以通关文牒的形式展示学习进度与成就。

## 🛠️ 技术栈 (Tech Stack)

*   **框架**: [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/) (SDK 50+)
*   **路由**: [Expo Router](https://docs.expo.dev/router/introduction/) (v3)
*   **样式**: [NativeWind](https://www.nativewind.dev/) (TailwindCSS for React Native)
*   **语言**: TypeScript
*   **动画**: React Native Animated API / SVG Animations
*   **构建**: EAS (Expo Application Services)

## 🚀 快速开始 (Getting Started)

### 环境准备

确保你的开发环境已安装：
*   [Node.js](https://nodejs.org/) (推荐 LTS 版本)
*   [Git](https://git-scm.com/)

### 安装依赖

```bash
git clone https://github.com/your-repo/ToeicAssistant.git
cd ToeicAssistant
npm install
# 或使用 yarn
yarn install
```

### 运行开发服务器

```bash
npx expo start
```

*   按 `a` 在 Android 模拟器/设备运行
*   按 `i` 在 iOS 模拟器运行 (需 macOS)
*   按 `w` 在浏览器运行 (Web 版)

### 构建发布 (Build)

**构建 Android APK (用于测试):**
```bash
eas build -p android --profile preview
```

**构建生产版本:**
```bash
eas build -p android --profile production
```

## 📂 项目结构 (Structure)

```
ToeicAssistant/
├── app/                  # Expo Router 页面路由
│   ├── index.tsx         # 首页 (山水背景、功能入口)
│   ├── vocabulary/       # 词汇模块页面
│   ├── listening/        # 听力模块页面
│   ├── reading/          # 阅读模块页面
│   └── ...
├── assets/               # 静态资源 (图片、音频、字体)
├── components/           # 可复用组件
│   └── ui/               # UI 组件 (GuofengComponents.tsx 包含核心国风组件)
├── services/             # 业务逻辑服务 (UserProgressService.ts)
├── constants/            # 常量定义
├── tailwind.config.js    # Tailwind 配置
└── ...
```

## 🎨 界面预览 (Screenshots)

*请在此处添加应用截图*

## 📄 许可证 (License)

MIT License
