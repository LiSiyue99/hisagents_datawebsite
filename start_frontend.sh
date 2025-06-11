#!/bin/bash

echo "🎯 HistBench前端启动器"
echo "=================================================="

# 进入前端目录
cd frontend

# 检查node_modules是否存在
if [ ! -d "node_modules" ]; then
    echo "🔧 安装Node.js依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
fi

echo "🚀 启动HistBench前端服务..."
echo "📖 前端地址: http://localhost:3000"
echo "🔗 确保后端服务正在运行: http://localhost:8000"
echo ""

# 启动开发服务器
npm run dev 