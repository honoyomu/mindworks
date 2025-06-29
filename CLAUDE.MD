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
  - **大文件存储**：使用浏览器 IndexedDB 存储图片和文件内容
  - **数据库存储**：只存储文件 ID 和元数据，避免 500 错误
  - **AI 分析要求**：
    - 图片必须转换为 base64 格式发送给 AI
    - 仅文件名不足以生成准确的标签
    - 必须让 AI "看到"实际图片内容
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
- **重要限制**：InsForge API 对请求大小有限制，大文件会导致 500 错误
- **CORS 处理**：必须配置 Vite 代理以避免跨域问题：

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'https://insforge-backend-740c116fd723.herokuapp.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      secure: true
    }
  }
}
```

**重要提示**：
- 使用单一的 `/api` 代理规则，不要分别为 `/api/database` 和 `/api/project` 创建规则
- 这样可以确保所有 API 请求都被正确代理
- 修改代理配置后必须重启开发服务器

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
- **开发时测试检查清单**：
  - ✅ 先用独立的 Node.js 脚本测试所有 API 端点
  - ✅ 确认代理配置正确（检查浏览器开发者工具的 Network 标签）
  - ✅ 验证 API 响应格式与前端代码期望一致
  - ✅ 测试错误处理（网络错误、认证失败、服务器错误）

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
   - ❌ **不要尝试通过 InsForge 上传大文件**：会导致 500 错误
   - ✅ **正确做法**：使用 IndexedDB 存储文件内容，InsForge 只存文件 ID
   - ✅ **数据分离**：媒体文件和结构化数据分开处理
   - ✅ **大小限制**：base64 编码的图片不要直接存储在 InsForge 数据库中

3. **LLM 响应处理**：
   - 始终假设 LLM 可能返回 Markdown 格式的 JSON
   - 实现健壮的 JSON 提取和解析逻辑
   - 提供合理的降级处理

4. **错误处理**：
   - 为每种错误类型提供明确的用户提示
   - 区分网络错误、认证错误和服务器错误
   - 实现重试机制和加载状态

## 常见问题解决

### InsForge 500 错误
- **错误**: 上传图片时返回 500 Internal Server Error
- **原因**: base64 编码的图片数据太大，超过了 InsForge API 的请求大小限制
- **解决**:
  1. 使用 IndexedDB 存储图片的 base64 数据
  2. InsForge 数据库只存储文件 ID 引用
  3. 前端从 IndexedDB 加载图片数据进行显示

### 图片标签生成不准确
- **错误**: 上传图片后生成的标签不能很好地代表图片内容
- **原因**: 只传递了文件名给 AI，而不是图片的实际内容
- **解决**:
  1. 将图片转换为 base64 格式
  2. 使用支持视觉分析的模型（如 gpt-4o）
  3. 通过正确的消息格式发送图片内容
  4. 确保 AI 能"看到"图片而不只是文件名

### Vite 代理配置错误
- **错误**: 404 错误，API 请求失败但后台显示成功
- **原因**: 代理路径配置错误或过于具体
- **解决**: 
  1. 使用单一的 `/api` 代理规则而不是多个具体路径
  2. 确保 `rewrite` 函数正确移除 `/api` 前缀
  3. 修改后必须重启开发服务器

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

### IndexedDB 文件存储
- **存储方式**：使用浏览器 IndexedDB API 存储大文件
- **文件 ID 格式**：`type_timestamp_randomString` (如: `img_1234567890_abc123`)
- **数据库设计**：
  - InsForge 数据库：只存储文件 ID、标题、标签等元数据
  - IndexedDB：存储实际的文件内容（base64 或 blob URL）
- **清理策略**：删除记录时同时清理 IndexedDB 中的文件数据

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
- **模型选择策略**:
  - **图片分析**: 必须使用支持视觉的模型（如 `gpt-4o`、`gpt-4-vision-preview`）
  - **文本处理**: 可以使用更经济的模型（如 `gpt-4o-mini`）
  - **重要**: 图片内容必须转换为 base64 并通过正确的消息格式发送
- **集成方式**: 直接在前端调用，所有 endpoints 写在前端代码中
- **Documentation**: Implementation 前，用 context7 的 MCP 进行查询相关的 documentation

### 图片内容分析实现
**关键步骤**：
1. **读取图片文件为 base64**：
```javascript
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};
```

2. **发送图片到 AI 分析**：
```javascript
messages: [{
  role: 'user',
  content: [
    {
      type: 'text',
      text: '分析图片的提示词...'
    },
    {
      type: 'image_url',
      image_url: {
        url: `data:image/jpeg;base64,${imageBase64}`
      }
    }
  ]
}]
```

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

## UI/UX 设计规范

### 响应式设计原则
- **移动端优先**：所有组件必须在移动设备上正常工作
- **断点使用**：
  - `xs: 475px` - 大手机
  - `sm: 640px` - 平板
  - `md: 768px` - 小笔记本
  - `lg: 1024px` - 桌面
  - `xl: 1280px` - 大屏幕
- **触摸友好**：移动端按钮最小高度 44px，适当的点击区域

### 视觉设计系统
- **配色方案**：
  - 主色：Indigo-Purple 渐变 (`from-indigo-500 to-purple-600`)
  - 背景：灰白渐变 (`from-gray-50 via-white to-indigo-50`)
  - 强调色：使用渐变效果增强视觉层次
- **间距规范**：
  - 移动端：`p-4 gap-4`
  - 桌面端：`p-6 gap-6` 或 `p-8 gap-8`
  - 使用响应式类：`p-4 sm:p-6`
- **圆角和阴影**：
  - 卡片：`rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg`
  - 按钮：`rounded-lg` 带悬停效果
  - 输入框：`rounded-lg` 带聚焦环

### 动画和过渡
- **基础过渡**：`transition-all duration-200` 或 `duration-300`
- **悬停效果**：
  - 卡片：`hover:shadow-xl`
  - 按钮：`hover:-translate-y-0.5`
  - 图标：`group-hover:scale-110`
- **加载动画**：
  - 使用骨架屏代替简单的 spinner
  - 渐进式内容加载：`fade-in` 配合 `animation-delay`
- **交互反馈**：所有可交互元素都需要视觉反馈

### 组件设计模式
- **卡片组件**：
  ```jsx
  <div className="card p-4 sm:p-6 group hover:shadow-xl transition-all duration-300">
  ```
- **按钮组件**：
  ```jsx
  <button className="btn-primary w-full sm:w-auto">
  ```
- **输入框组件**：
  ```jsx
  <input className="input-field" />
  ```
- **响应式文字**：
  ```jsx
  <h2 className="text-base sm:text-lg md:text-xl">
  ```

### 移动端特殊处理
- **导航栏**：简化 logo，隐藏次要信息
- **内容优先级**：移动端调整布局顺序（如搜索框在上）
- **触摸操作**：
  - 删除按钮在移动端始终可见
  - 增大点击区域：`p-1.5 sm:p-2`
- **性能优化**：
  - 移动端限制显示项目数量（如标签最多显示3个）
  - 图片使用响应式尺寸

### 可访问性要求
- 所有交互元素添加 `title` 属性
- 使用语义化 HTML
- 保持足够的颜色对比度
- 键盘导航支持

### 开发时的 UI 检查清单
- [ ] 在 320px 宽度测试（最小手机）
- [ ] 在平板设备测试（768px）
- [ ] 检查所有悬停效果
- [ ] 验证加载状态
- [ ] 测试长文本换行
- [ ] 确保触摸目标足够大
- [ ] 检查动画性能

## 性能优化
- 使用 React.lazy() 进行代码分割
- 实施图片懒加载
- 优化 Tailwind CSS 的生产构建（移除未使用的样式）
- 使用 CSS 动画而非 JavaScript 动画
- 避免在移动端使用复杂的动画效果
