#!/usr/bin/env python3

import http.server
import socketserver
import socket
import os

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

PORT = 8080
Handler = MyHTTPRequestHandler

# 监听所有网络接口
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"🌐 IPO审核系统共享服务器启动成功!")
    print(f"🏠 本地访问: http://localhost:{PORT}")
    print(f"🌍 局域网访问: http://192.168.50.158:{PORT}")
    print(f"🌍 或者: http://{socket.gethostname()}:{PORT}")
    print(f"✨ 服务已开启，可在局域网内共享访问")
    print("-" * 50)
    httpd.serve_forever()