#!/bin/bash

# IPO审核动态查询系统共享访问启动脚本

echo "🚀 启动IPO审核动态查询系统 - 共享访问模式"
echo "================================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: Python3未安装，请先安装Python3"
    exit 1
fi

# 创建数据库目录
mkdir -p database
mkdir -p backend
mkdir -p frontend

# 安装后端依赖
echo "📦 正在安装后端依赖..."
cd backend
npm install
cd ..

# 启动后端服务 (支持共享访问)
echo "🖥️  启动后端服务..."
cd backend
nohup python3 ../share-backend.py > ../backend_share.log 2>&1 &
BACKEND_PID=$!
cd ..

# 等待后端服务启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 检查后端服务是否启动成功
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ 后端服务启动成功 (PID: $BACKEND_PID)"
else
    echo "⚠️  后端服务启动失败，请检查 backend_share.log"
fi

# 启动前端服务 (支持共享访问)
echo "🌐 启动前端服务..."
cd frontend
nohup python3 ../share-server.py > ../frontend_share.log 2>&1 &
FRONTEND_PID=$!
cd ..

# 等待前端服务启动
echo "⏳ 等待前端服务启动..."
sleep 2

# 显示访问地址
echo ""
echo "================================================"
echo "🎉 IPO审核动态查询系统启动成功!"
echo "================================================"
echo "🏠 本地访问地址:"
echo "   http://localhost:8080"
echo ""
echo "🌍 局域网共享访问地址:"
echo "   http://192.168.50.158:8080"
echo "   http://ZouXiongdeMac-mini.local:8080"
echo ""
echo "🔧 API服务地址:"
echo "   http://192.168.50.158:3000"
echo "   http://localhost:3000/health"
echo ""
echo "💡 提示: 同一局域网内的设备都可以通过上述地址访问"
echo "💡 提示: 如果无法访问，请检查防火墙设置"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "================================================"

# 保存进程ID
echo $BACKEND_PID > backend_share.pid
echo $FRONTEND_PID > frontend_share.pid

# 等待用户输入
read -p "按回车键停止服务..." -r
echo "🛑 正在停止服务..."

# 停止服务
if [ -f backend_share.pid ]; then
    kill $(cat backend_share.pid)
    rm backend_share.pid
    echo "✅ 后端服务已停止"
fi

if [ -f frontend_share.pid ]; then
    kill $(cat frontend_share.pid)
    rm frontend_share.pid
    echo "✅ 前端服务已停止"
fi

echo "🏁 所有服务已停止"