@echo off
echo 🚀 启动小竹子桌面宠物应用...

REM 检查是否安装了依赖
if not exist "node_modules" (
    echo 📦 安装依赖中...
    npm install
)

REM 检查是否安装了Rust
where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 需要安装Rust和Cargo
    echo 请访问 https://rustup.rs/ 安装Rust
    pause
    exit /b 1
)

REM 构建前端资源
echo 🔨 构建前端资源...
npm run build

REM 启动桌面应用
echo 🎯 启动桌面应用...
npm run tauri:dev

pause