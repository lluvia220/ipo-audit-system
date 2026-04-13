# 🚀 IPO审核系统 - Vercel一键部署指南

## 立即开始的5个简单步骤

### 步骤1：准备GitHub仓库（2分钟）

```bash
# 进入项目目录
cd /Users/zxhome/.openclaw/workspace/agents/agent_d6fc63322e140ed1/ipo-audit-system

# 初始化Git
git init
git add .
git commit -m "IPO审核系统初始版本"

# 添加远程仓库（替换成您的GitHub仓库地址）
git remote add origin https://github.com/your-username/ipo-audit-system.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

### 步骤2：登录Vercel（1分钟）

1. 访问 https://vercel.com
2. 点击 "Sign Up" 或 "Login"
3. 选择 "Continue with GitHub"
4. 授权Vercel访问您的GitHub

### 步骤3：部署前端（2分钟）

1. 在Vercel控制台点击 "Add New Project"
2. 选择您的 `ipo-audit-system` 仓库
3. 配置前端部署：

**Project Settings**:
```
Project Name: ipo-audit-frontend
Framework Preset: Other
Root Directory: frontend
Build Command: (留空)
Output Directory: (留空)
```

4. 点击 "Deploy"
5. 等待2-3分钟
6. 获得前端URL：`https://ipo-audit-frontend.vercel.app`

### 步骤4：部署后端（2分钟）

1. 再次点击 "Add New Project"
2. 选择同一仓库
3. 配置后端部署：

**Project Settings**:
```
Project Name: ipo-audit-backend
Framework Preset: Node.js
Root Directory: backend
Build Command: npm install
Output Directory: (留空)
```

4. 添加环境变量：
```
NODE_ENV = production
PORT = 3000
```

5. 点击 "Deploy"
6. 等待2-3分钟
7. 获得后端URL：`https://ipo-audit-backend.vercel.app`

### 步骤5：连接前后端（1分钟）

修改 `frontend/app.js` 中的API地址：

找到所有 `localhost:3000` 替换为 `https://ipo-audit-backend.vercel.app`

示例：
```javascript
// 原来的代码
fetch('/api/cases')

// 修改为
fetch('https://ipo-audit-backend.vercel.app/api/cases')
```

或者更好的方式，在文件开头添加：
```javascript
const API_BASE = 'https://ipo-audit-backend.vercel.app';

// 然后所有API调用改为：
fetch(`${API_BASE}/api/cases`)
```

## 🎉 完成！

现在您的系统已经部署到云端，拥有以下访问地址：

### 公网访问地址
- **前端**: `https://ipo-audit-frontend.vercel.app`
- **后端API**: `https://ipo-audit-backend.vercel.app`

### 立即分享
将 `https://ipo-audit-frontend.vercel.app` 分享给任何人，他们都能访问！

## 🔄 更新系统

当您修改代码后，只需：

```bash
git add .
git commit -m "功能更新描述"
git push
```

Vercel会自动重新部署！

## 💡 Vercel免费额度

- ✅ 100GB带宽/月
- ✅ 无限项目
- ✅ 自动HTTPS
- ✅ 全球CDN
- ✅ 自定义域名
- ✅ 持续部署

完全足够个人和小团队使用！

## 🆘 遇到问题？

### 常见问题1：部署失败
**解决方案**：检查Vercel控制台的部署日志，查看具体错误信息

### 常见问题2：前端无法连接后端
**解决方案**：确保修改了 `frontend/app.js` 中的API地址

### 常见问题3：数据库问题
**解决方案**：Vercel是Serverless平台，需要使用外部数据库服务（如MongoDB Atlas免费版）

## 🚀 立即开始！

现在就开始吧，8分钟后您就拥有了一个全球可访问的IPO审核查询系统！

有任何问题随时问我！