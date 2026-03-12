# AI Novel Movie

AI 小说转电影工作台。项目提供从小说文本到剧本、角色资产和分镜脚本的完整四步流程，并支持项目持久化、步骤锁定和镜头级人工微调。

## 当前能力

- 项目管理首页：创建、打开、删除项目，直接从卡片进入编辑流程
- 项目设定：支持标题、语言、视觉风格、画幅、自定义提示词、叙事节奏和 AI 约束参数
- 小说转剧本：调用 DeepSeek 将原文拆分成结构化场景，并支持手工补改
- 角色设计：根据剧本提取角色，分别维护角色定位、外貌描述、背景故事
- 分镜脚本：生成镜头清单，支持镜头类型、运镜、时长、台词、提示词编辑
- 工作流锁定：剧本、角色、分镜可逐步锁定，防止误改，并控制后续步骤可进入状态
- 分镜校验：锁定前校验画面描述、台词、提示词和总时长偏差
- 项目保存：通过本地后端保存项目状态，重新进入项目可恢复进度
- 自动化验证：仓库内置 Playwright/Python 脚本用于 PRD 流程回归和 DeepSeek 联调检查

## 技术栈

- 前端：React 18 + TypeScript + Vite + Tailwind CSS
- 后端：Express
- AI：DeepSeek Chat Completions API
- 自动化测试：Python + Playwright

## 目录结构

```text
.
├── client/                 # Vite 前端
│   ├── src/components/     # 通用 UI 与导航组件
│   ├── src/pages/          # 四步工作流页面
│   ├── src/types/          # 核心类型定义
│   └── src/utils/api.ts    # DeepSeek API 封装
├── server/                 # Express 后端与项目 CRUD API
├── tests/                  # Playwright/Python 自动化脚本
├── DEVELOPMENT.md          # 开发和接口联调说明
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd client && npm install
cd ../server && npm install
```

### 2. 配置 DeepSeek Key

在 `client` 目录创建 `.env` 文件，或直接参考 `client/.env.example`：

```bash
VITE_DEEPSEEK_API_KEY=your_real_deepseek_api_key
```

前端会在 [`client/src/utils/api.ts`](client/src/utils/api.ts) 中读取该变量。修改后需要重启前端开发服务。

### 3. 启动服务

先启动后端：

```bash
cd server
npm start
```

默认地址为 `http://127.0.0.1:4000`。

再启动前端：

```bash
cd client
npm run dev
```

默认开发地址通常为 `http://127.0.0.1:5173`。

### 4. 生产构建

```bash
cd client
npm run build
```

## 使用流程

1. 在首页创建项目，系统会直接进入编辑器。
2. 在项目设定页完成标题、风格和比例等基础配置后进入下一步。
3. 在“小说转剧本”中粘贴原文并生成场景，确认无误后锁定剧本。
4. 在“角色设计”中抽取并完善角色信息，确认后锁定角色。
5. 在“分镜脚本”中生成镜头列表，补充时长、台词和提示词，通过校验后锁定分镜。
6. 点击顶部“保存”将项目状态写入后端。

## 自动化测试

仓库包含以下脚本：

- `tests/prd_ui_automation.py`：验证首页项目管理与基础流程门禁
- `tests/prd_requirement_audit.py`：对照 PRD 做 API/UI 审计
- `tests/e2e_step2_deepseek_smoke.py`：验证 Step2 与 DeepSeek 联调

运行这些脚本前，需要：

- 前后端服务已启动
- 本机已安装 Python 3
- 已安装 Playwright 及浏览器，例如 `python3 -m pip install playwright` 和 `python3 -m playwright install`

测试运行产物会输出到 `test-artifacts/`，该目录已配置为本地生成、不纳入 Git。

## 开发说明

- 更详细的本地开发和接口联调说明见 [DEVELOPMENT.md](DEVELOPMENT.md)
- `client/.env.example` 只保留占位符，不要把真实 API Key 提交到仓库
- 当前后端主要用于项目数据持久化，AI 生成逻辑在前端直接调用 DeepSeek
