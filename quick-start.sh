#!/bin/bash

echo "🚀 快速启动桌面应用..."

# 确保在正确目录
cd "$(dirname "$0")"

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 直接启动（跳过TypeScript检查）
echo "🎯 启动应用..."
npm run tauri:dev -- --skip-build