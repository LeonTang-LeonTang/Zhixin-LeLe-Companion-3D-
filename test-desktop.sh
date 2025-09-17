#!/bin/bash

echo "🧪 测试桌面应用启动..."

# 检查环境
echo "检查环境..."
node --version
npm --version
cargo --version

# 清理并重新构建
echo "🧹 清理旧文件..."
rm -rf dist/
rm -rf node_modules/.vite/

echo "📦 安装依赖..."
npm install

echo "🔨 构建应用..."
npm run build

echo "🎯 启动桌面应用..."
npm run tauri:dev