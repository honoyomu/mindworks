# 项目开发指南

## 技术栈要求

### 前端开发
- **框架**: React 18
- **样式**: Tailwind CSS v3（避免使用 v4，因为有兼容性问题）
- **构建工具**: Vite 5.x（与 Node.js 18 兼容）
- **路由**: React Router v6 或 v7
- **设计要求**: 
  - 现代化、美观的模块化界面
  - 完全响应式设计（移动端优先）
  - 使用 Tailwind CSS 的实用类进行样式设计

### 后端服务
- **优先使用 InsForge**：提供完整的认证和数据库功能
- **API 集成**：直接从前端调用 InsForge API，无需搭建独立后端
- **文件存储策略**：
  - **InsForge 仅用于数据存储**：文本、数字、JSON 等结构化数据
  - **图片/文件存储**：使用本地 public 目录，不通过 InsForge 上传
  - **图片处理**：前端直接处理图片，存储到 `public/uploads/` 目录
- **认证凭据**：
  - 检查项目根目录是否已有 `.env` 文件
  - 如果已存在，直接使用其中的配置
  - 不要创建空的 `.env` 文件覆盖已有配置

## 开发流程

### 1. 项目初始化
```bash
# 重要：在当前目录初始化项目，不要创建新的子目录
npm create vite@latest . -- --template react
npm install -D tailwindcss@3.4.17 postcss autoprefixer
npm install axios react-router-dom
```

**注意事项**：
- 始终检查当前目录是否已有 `.env` 文件和其他配置
- 如果存在 `.env` 文件，确保新项目能够使用这些配置
- 不要在子目录中重复创建空的配置文件

### 2. InsForge 集成
- 每次涉及后端功能时，必须先调用 `mcp__insforge__get-instructions` 工具
- 使用 `mcp__insforge__get_project_metadata` 获取数据库结构
- 遵循 InsForge 的 API 文档进行开发
- **CORS 处理**：必须配置 Vite 代理以避免跨域问题：

```javascript
// vite.config.js
server: {
  proxy: {
    '/api/database': {
      target: 'https://insforge-backend-740c116fd723.herokuapp.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      secure: true
    },
    '/api/project': {
      target: 'https://insforge-backend-740c116fd723.herokuapp.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      secure: true
    }
  }
}
```

- API 调用时使用环境感知的 BASE_URL：

```javascript
const API_BASE_URL = import.meta.env.DEV ? '/api' : 
  'https://insforge-backend-740c116fd723.herokuapp.com'
```

### 3. 测试要求
- 开发过程中使用 curl 或测试脚本验证 API 功能
- 完成后运行完整测试套件
- 确保所有连接正常，无 bug
- 确保 `npm run dev` 可以运行
- 如果有 AI 相关功能，也需要测试确保可以运行

## 环境配置

### Node.js 版本管理
- 推荐 Node.js 18.x（稳定且兼容性好）
- 如遇版本问题，使用 nvm 切换版本

### 依赖版本锁定
```json
{
  "devDependencies": {
    "vite": "5.4.11",
    "tailwindcss": "3.4.17",
    "@vitejs/plugin-react": "^4.3.4"
  }
}
```

### PostCSS 配置
```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### API 集成防错措施

1. **CORS 问题预防**：
   - 本地开发必须配置 Vite 代理
   - 生产环境使用直接 API 调用
   - 使用环境变量区分开发/生产环境

2. **文件上传错误预防**：
   - ❌ **不要尝试通过 InsForge 上传文件**：会导致 500 错误
   - ✅ **正确做法**：文件存本地，路径存 InsForge
   - ✅ **数据分离**：媒体文件和结构化数据分开处理

3. **LLM 响应处理**：
   - 始终假设 LLM 可能返回 Markdown 格式的 JSON
   - 实现健壮的 JSON 提取和解析逻辑
   - 提供合理的降级处理

4. **错误处理**：
   - 为每种错误类型提供明确的用户提示
   - 区分网络错误、认证错误和服务器错误
   - 实现重试机制和加载状态

## 常见问题解决

### Tailwind CSS v4 兼容性问题
- **错误**: "trying to use tailwindcss directly as a PostCSS plugin"
- **解决**: 降级到 v3: `npm install -D tailwindcss@3.4.17`

### Vite + Node.js 版本冲突
- **错误**: "crypto.hash is not a function"
- **解决**: 使用 Vite 5.x 配合 Node.js 18

### 依赖安装最佳实践
- 使用 `npm ci` 而非 `npm install`（严格按照 lock 文件）
- 定期更新 `package-lock.json`
- 避免使用 `^` 前缀，使用精确版本号

## 文件存储最佳实践

### 本地文件存储
- **图片存储位置**：`public/uploads/images/`
- **文档存储位置**：`public/uploads/documents/`
- **音频/视频**：`public/uploads/media/`
- **文件命名规范**：使用时间戳 + 随机字符串确保唯一性

## 项目结构建议
```
src/
├── api/          # API 服务封装
├── components/   # React 组件
├── contexts/     # React Context（如认证）
├── data/         # 静态数据和配置
├── pages/        # 页面组件
├── utils/        # 工具函数
└── App.jsx       # 主应用组件
```

```
// 创建 uploads 目录结构
public/
├── uploads/
│   ├── images/     # 图片文件
│   ├── documents/  # PDF、Word 等文档
│   └── media/      # 音频、视频文件
└── assets/         # 静态资源（CSS、JS等）
```

## AI 能力集成

### LLM 服务配置
- **默认提供商**: OpenRouter
- **首选模型**: OpenAI GPT-4o
- **集成方式**: 直接在前端调用，所有 endpoints 写在前端代码中
- **Documentation**: Implementation 前，用 context7 的 MCP 进行查询相关的 documentation

### JSON 响应处理
OpenRouter 可能返回 Markdown 格式的 JSON，必须处理：

```javascript
// 提取 Markdown 代码块中的 JSON
const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/) || 
  result.match(/```\s*([\s\S]*?)\s*```/)
const jsonString = jsonMatch ? jsonMatch[1] : result

try {
  return JSON.parse(jsonString.trim())
} catch (e) {
  // 提供合理的默认值
  return { title: 'Default Title', tags: ['tag'] }
}
```

### API 请求格式
明确要求返回纯 JSON，不要 Markdown 格式：

```javascript
messages: [{
  role: 'system',
  content: 'Return ONLY valid JSON without markdown formatting or code blocks.'
}]
```

## 性能优化
- 使用 React.lazy() 进行代码分割
- 实施图片懒加载
- 优化 Tailwind CSS 的生产构建（移除未使用的样式）