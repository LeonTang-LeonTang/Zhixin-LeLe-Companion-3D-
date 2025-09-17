#!/bin/bash

echo "🚀 启动小竹子桌面宠物应用..."

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖中..."
    npm install
fi

# 检查是否安装了Tauri CLI
if ! command -v cargo &> /dev/null; then
    echo "❌ 需要安装Rust和Cargo"
    echo "请访问 https://rustup.rs/ 安装Rust"
    exit 1
fi

# 构建前端资源
echo "🔨 构建前端资源..."
npm run build

# 启动桌面应用（不使用开发服务器）
echo "🎯 启动桌面应用..."
npm run tauri:dev