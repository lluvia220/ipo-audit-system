#!/bin/bash

# IPO审核动态查询系统启动脚本

echo "正在启动IPO审核动态查询系统..."
echo "===================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: Python3未安装，请先安装Python3"
    exit 1
fi

# 创建数据库目录
mkdir -p database
mkdir -p backend
mkdir -p frontend

# 安装后端依赖
echo "正在安装后端依赖..."
cd backend
npm install
cd ..

# 启动后端服务
echo "启动后端服务..."
cd backend
nohup node server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# 等待后端服务启动
echo "等待后端服务启动..."
sleep 3

# 检查后端服务是否启动成功
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✓ 后端服务启动成功 (PID: $BACKEND_PID)"
else
    echo "⚠️  后端服务启动失败，请检查 backend.log"
fi

# 启动前端服务
echo "启动前端服务..."
cd frontend
nohup python3 -m http.server 8080 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# 等待前端服务启动
echo "等待前端服务启动..."
sleep 2

echo ""
echo "===================================="
echo "IPO审核动态查询系统启动完成！"
echo "===================================="
echo "🌐 前端访问地址: http://localhost:8080"
echo "🔧 后端API地址: http://localhost:3000"
echo "📋 后端API文档: http://localhost:3000/health"
echo ""
echo "系统包含以下功能："
echo "📊 月度专项报告 - 文字深度分析 + 图表辅助"
echo "📈 周报统计 - 关键词统计 + 图表展示"
echo "📋 案例数据库 - 真实案例 + 检索功能"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "===================================="

# 保存进程ID
echo $BACKEND_PID > backend.pid
echo $FRONTEND_PID > frontend.pid

# 等待用户输入
read -p "按回车键停止服务..." -r
echo "正在停止服务..."

# 停止服务
if [ -f backend.pid ]; then
    kill $(cat backend.pid)
    rm backend.pid
    echo "✓ 后端服务已停止"
fi

if [ -f frontend.pid ]; then
    kill $(cat frontend.pid)
    rm frontend.pid
    echo "✓ 前端服务已停止"
fi

echo "所有服务已停止"