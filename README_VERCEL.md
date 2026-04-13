# IPO审核系统 - Vercel部署完整指南

## 🚀 一键部署到Vercel (免费公网访问)

### 方案A: 前端+后端分别部署

#### 第一步：准备GitHub仓库

```bash
# 初始化Git仓库
cd /Users/zxhome/.openclaw/workspace/agents/agent_d6fc63322e140ed1/ipo-audit-system
git init
git add .
git commit -m "IPO审核系统初始版本"

# 创建GitHub仓库并推送（需要您在GitHub上创建新仓库）
git remote add origin https://github.com/your-username/ipo-audit-system.git
git branch -M main
git push -u origin main
```

#### 第二步：部署前端到Vercel

1. 访问 https://vercel.com
2. 使用GitHub账号登录
3. 点击 "Add New Project"
4. 选择您的GitHub仓库
5. 配置部署设置：

**前端配置**：
```
Root Directory: frontend
Framework Preset: Other
Build Command: (留空)
Output Directory: (留空)
```

6. 点击 "Deploy"
7. 等待部署完成（约2-3分钟）
8. 获得免费域名：`https://your-project.vercel.app`

#### 第三步：部署后端API

**创建单独的后端项目**：

1. 在Vercel中创建新项目
2. 选择同一GitHub仓库
3. 配置后端设置：

**后端配置**：
```
Root Directory: backend
Framework Preset: Node.js
Build Command: npm install
Output Directory: (留空)
```

4. 添加环境变量：
```
PORT: 3000
NODE_ENV: production
```

5. 点击 "Deploy"
6. 获得后端API地址：`https://your-backend.vercel.app`

#### 第四步：更新前端API地址

修改 `frontend/app.js` 中的API地址：

```javascript
// 将所有 localhost:3000 替换为您的Vercel后端地址
const API_BASE = 'https://your-backend.vercel.app';
```

### 方案B: 简化部署（单项目）

如果您希望更简单的部署，可以创建一个简化版本：

#### 创建纯静态版本

由于Vercel免费版主要适合静态网站，我们可以创建一个包含所有数据的静态版本：

```bash
# 创建静态数据文件
cd frontend

# 将API数据嵌入到JavaScript中
```

修改后的系统将不再需要后端API，所有数据都内置在前端代码中。

## 📋 Vercel部署配置文件

### 前端配置
文件位置：`vercel-frontend.json`

### 后端配置
文件位置：`backend/vercel.json`

## 🌐 部署后访问地址

部署完成后，您将获得：

- **前端地址**: `https://ipo-audit-system.vercel.app`
- **后端API**: `https://ipo-audit-api.vercel.app`
- **自动HTTPS**: Vercel自动配置SSL证书
- **全球CDN**: 自动分发到全球节点

## 💡 Vercel优势

- ✅ **完全免费**: 个人项目永久免费
- ✅ **全球CDN**: 访问速度快
- ✅ **自动HTTPS**: 安全加密
- ✅ **一键部署**: 操作简单
- ✅ **自动更新**: 代码推送自动重新部署
- ✅ **自定义域名**: 支持绑定自己的域名

## 🎯 部署后测试

### 1. 测试前端
访问 `https://your-project.vercel.app`，确认页面正常显示。

### 2. 测试API
访问 `https://your-backend.vercel.app/health`，应该返回：
```json
{
  "status": "healthy",
  "timestamp": "..."
}
```

### 3. 测试数据访问
访问 `https://your-backend.vercel.app/api/cases`，确认返回IPO案例数据。

## 🔄 持续更新

当您修改代码后，只需：

```bash
git add .
git commit -m "更新功能描述"
git push
```

Vercel会自动检测到更新并重新部署！

## 📱 分享给他人

部署完成后，直接分享链接：
```
https://your-project.vercel.app
```

任何人都可以访问，无需任何配置！

## 🛠️ 故障排除

### 如果部署失败：

1. **检查Node.js版本**：确保 >= 14.0.0
2. **检查依赖**：运行 `npm install` 确保所有依赖安装
3. **查看Vercel部署日志**：在Vercel控制台查看详细错误信息
4. **检查环境变量**：确保所有必需的环境变量都已配置

### 如果前端无法连接后端：

1. **确认后端已部署**：检查后端URL是否可访问
2. **检查CORS设置**：后端需要配置CORS允许跨域
3. **查看浏览器控制台**：检查具体的错误信息

## 🎉 完成！

现在您拥有了一个完全免费、全球可访问的IPO审核查询系统！

**您的公网地址**: `https://your-project.vercel.app`

**分享给任何人**，他们都能访问您的系统！