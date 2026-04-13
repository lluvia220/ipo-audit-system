#!/bin/bash

# IPO审核动态查询系统停止脚本

echo "正在停止IPO审核动态查询系统..."
echo "===================================="

# 停止后端服务
if [ -f backend.pid ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        kill $BACKEND_PID
        echo "✓ 后端服务已停止 (PID: $BACKEND_PID)"
    else
        echo "⚠️  后端服务进程未运行"
    fi
    rm backend.pid
else
    # 如果没有pid文件，尝试通过端口杀死进程
    if lsof -ti:3000 > /dev/null; then
        kill $(lsof -ti:3000)
        echo "✓ 后端服务已停止 (端口3000)"
    else
        echo "⚠️  后端服务未运行或端口3000无进程"
    fi
fi

# 停止前端服务
if [ -f frontend.pid ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        kill $FRONTEND_PID
        echo "✓ 前端服务已停止 (PID: $FRONTEND_PID)"
    else
        echo "⚠️  前端服务进程未运行"
    fi
    rm frontend.pid
else
    # 如果没有pid文件，尝试通过端口杀死进程
    if lsof -ti:8080 > /dev/null; then
        kill $(lsof -ti:8080)
        echo "✓ 前端服务已停止 (端口8080)"
    else
        echo "⚠️  前端服务未运行或端口8080无进程"
    fi
fi

echo ""
echo "===================================="
echo "所有服务已停止"