# 🐼 知心乐乐 - 3D桌面陪伴应用

<div align="center">

![知心乐乐](https://img.shields.io/badge/知心乐乐-3D桌面宠物-brightgreen)
![Tauri](https://img.shields.io/badge/Tauri-2.0-blue)
![React](https://img.shields.io/badge/React-19.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![License](https://img.shields.io/badge/License-MIT-green)

**一个基于Tauri + React的智能3D桌面陪伴应用**

[🚀 快速开始](#-快速开始) • [✨ 功能特色](#-功能特色) • [🛠️ 技术栈](#️-技术栈) • [📱 使用说明](#-使用说明)

</div>

## 📸 应用预览

> 🖥️ **真正的桌面应用程序** - 不是网页，是原生桌面应用！

- 🐼 可爱的3D桌面宠物角色
- 🎯 可拖拽到屏幕任意位置
- 💬 智能AI对话陪伴
- 🧘 心理健康功能
- 🎨 现代化玻璃拟态UI

## ✨ 功能特色

### 🎯 桌面宠物核心功能
- **🖥️ 纯桌面应用**：基于Tauri的原生桌面程序
- **🐼 3D角色**：可爱的乐乐陪伴角色
- **🎯 自由拖拽**：可移动到屏幕任意位置
- **🎭 状态切换**：多种表情和动作状态
- **💭 智能字幕**：实时显示状态和对话

### 🧠 AI智能功能
- **💬 智能对话**：基于腾讯云LLM的自然语言交互
- **🧘 心理陪伴**：专业的心理健康支持
- **🎵 情绪调节**：音乐治疗和冥想引导
- **📝 情绪日记**：记录和分析心理状态
- **⏰ 健康提醒**：定时关怀和健康建议

### 🎨 用户体验
- **🌟 现代UI**：玻璃拟态设计风格
- **🎬 流畅动画**：Framer Motion驱动的动画效果
- **🖱️ 直观交互**：右键菜单、拖拽操作
- **📱 响应式**：适配不同屏幕尺寸
- **🎯 个性化**：可自定义心情和功能

## 🛠️ 技术栈

### 前端技术
- **⚛️ React 19.1** - 现代化前端框架
- **📘 TypeScript 5.8** - 类型安全的JavaScript
- **⚡ Vite 7.0** - 快速构建工具
- **🎬 Framer Motion** - 流畅动画库
- **🎨 CSS3** - 现代化样式设计

### 桌面应用
- **🦀 Tauri 2.0** - Rust驱动的桌面应用框架
- **🔧 Rust** - 高性能系统编程语言
- **🖥️ 跨平台** - Windows, macOS, Linux支持

### AI集成
- **🧠 腾讯云ADP** - 智能体开发平台
- **💬 LLM对话** - 大语言模型集成
- **🔍 RAG检索** - 检索增强生成
- **🔄 Workflow** - 自动化工作流

## 🚀 快速开始

### 📋 系统要求
- **Node.js 16+** - JavaScript运行环境
- **Rust 1.70+** - 桌面应用编译环境
- **操作系统**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)

### 🔧 环境安装

#### 1. 安装Node.js
```bash
# 访问 https://nodejs.org/ 下载安装
# 或使用包管理器
brew install node  # macOS
```

#### 2. 安装Rust
```bash
# 访问 https://rustup.rs/ 安装
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 🎯 启动应用

#### 方式一：一键启动（推荐）
```bash
# 克隆仓库
git clone https://github.com/LeonTang-LeonTang/Zhixin-LeLe-Companion-3D-.git
cd Zhixin-LeLe-Companion-3D-

# 一键启动
./启动应用.sh
```

#### 方式二：手动启动
```bash
# 安装依赖
npm install

# 启动桌面应用
npm run quick
# 或
npm run app
```

#### 方式三：开发模式
```bash
# 开发模式启动
npm run tauri:dev
```

### 📦 构建发布版本
```bash
# 构建应用安装包
npm run tauri:build
```

## 📱 使用说明

### 🎮 基本操作
1. **🖱️ 左键点击** - 切换角色状态
2. **🖱️ 右键点击** - 打开功能菜单
3. **🎯 拖拽移动** - 移动角色到任意位置
4. **💬 双击角色** - 打开AI对话窗口

### 🧘 心理健康功能
1. **💬 心理陪伴对话** - 与乐乐进行心理健康相关对话
2. **🧘 冥想引导** - 跟随引导进行正念冥想
3. **🌬️ 呼吸练习** - 深呼吸练习缓解压力
4. **😊 心情记录** - 记录和分析情绪变化
5. **📝 情绪日记** - 写下想法释放压力

### ⚙️ 个性化设置
- **🎭 心情设置** - 选择当前心情状态
- **🔄 自动陪伴** - 开启/关闭自动状态变化
- **🎵 治愈音乐** - 播放舒缓背景音乐
- **⏰ 健康提醒** - 设置定时关怀提醒

## 🏗️ 项目结构

```
Zhixin-LeLe-Companion-3D/
├── src/                          # 前端源码
│   ├── components/              # React组件
│   ├── services/               # 服务层
│   ├── enterprise/             # 企业功能
│   ├── assets/                 # 静态资源
│   └── App.tsx                 # 主应用组件
├── src-tauri/                   # Tauri桌面应用
│   ├── src/                    # Rust源码
│   ├── icons/                  # 应用图标
│   └── tauri.conf.json         # Tauri配置
├── public/                      # 公共资源
├── 启动应用.sh                   # 一键启动脚本
└── README.md                    # 项目说明
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. **Fork** 本仓库
2. **创建** 功能分支 (`git checkout -b feature/AmazingFeature`)
3. **提交** 更改 (`git commit -m 'Add some AmazingFeature'`)
4. **推送** 到分支 (`git push origin feature/AmazingFeature`)
5. **打开** Pull Request

## 🐛 问题反馈

遇到问题？请通过以下方式反馈：

- 📝 [提交Issue](https://github.com/LeonTang-LeonTang/Zhixin-LeLe-Companion-3D-/issues)
- 💬 [讨论区](https://github.com/LeonTang-LeonTang/Zhixin-LeLe-Companion-3D-/discussions)

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- 🦀 [Tauri](https://tauri.app/) - 优秀的桌面应用框架
- ⚛️ [React](https://reactjs.org/) - 强大的前端框架
- 🎬 [Framer Motion](https://www.framer.com/motion/) - 流畅的动画库
- 🧠 [腾讯云ADP](https://cloud.tencent.com/) - AI智能体平台

---

<div align="center">

**🌟 如果这个项目对你有帮助，请给个Star支持一下！🌟**

Made with ❤️ by [LeonTang](https://github.com/LeonTang-LeonTang)

</div>