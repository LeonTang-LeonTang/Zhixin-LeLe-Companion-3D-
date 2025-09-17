#!/bin/bash

echo "🚀 启动小竹子桌面宠物..."

# 确保在正确的目录
cd "$(dirname "$0")"

# 检查Rust环境
if ! command -v cargo &> /dev/null; then
    echo "❌ 请先安装Rust环境"
    echo "访问 https://rustup.rs/ 安装Rust"
    exit 1
fi

# 检查Node.js环境
if ! command -v npm &> /dev/null; then
    echo "❌ 请先安装Node.js环境"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装Node.js依赖..."
    npm install
fi

# 构建前端
echo "🔨 构建前端..."
npm run build

# 启动桌面应用
echo "🎯 启动桌面应用..."
cd src-tauri
cargo tauri dev