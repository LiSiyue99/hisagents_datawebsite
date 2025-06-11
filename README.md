# HistBench 数据浏览器

一个现代化的 HistBench 历史题目数据集浏览系统，支持多模态文件展示、智能搜索和国际化。

## 🌟 功能特色

### 📊 数据管理
- **完整数据集**：414 道历史题目，包含图片、音频、视频、PDF 等多媒体文件。
- **智能筛选**：按难度级别、题型、是否有媒体文件筛选。
- **全文搜索**：在题目内容和答案中快速搜索。
- **数据统计**：实时显示题目数量、难度分布等统计信息。

### 🎨 用户界面
- **国际化**：支持中英文 (zh/en) 一键切换。
- **现代设计**：基于 shadcn/ui 的精美界面。
- **颜色区分**：难度标签使用不同颜色（绿、蓝、红）进行区分，更加直观。
- **排序优化**：侧边栏"问题索引"与主区域"问题检索"卡片均按题号升序排列，查找更方便。
- **增强型索引**：左侧问题索引面板现在会显示每个问题的难度和题型。
- **响应式布局**：完美适配桌面和移动设备。

### 🔍 题目浏览
- **卡片式展示**：直观的题目卡片布局。
- **详情弹窗**：点击查看完整题目信息。
- **多媒体预览**：支持图片、音频、视频、PDF 文件预览。
- **分页导航**：高效的分页浏览体验。

## 🛠️ 技术栈

### 前端
- **Next.js 14**: React 全栈框架。
- **TypeScript**: 类型安全的 JavaScript。
- **next-intl**: 国际化库。
- **Tailwind CSS**: 原子化 CSS 框架。
- **shadcn/ui**: 现代化组件库。

### 后端
- **FastAPI**: 高性能 Python Web 框架。
- **Pandas**: 数据处理和分析。

## 📁 项目结构

```
hisagents/
├── backend/                 # 后端 API 服务
│   ├── main.py             # FastAPI 应用主文件
│   └── requirements.txt    # Python 依赖
├── frontend/               # Next.js 前端应用
│   ├── src/
│   │   ├── app/           # Next.js App Router 页面
│   │   ├── components/    # React 组件
│   │   └── lib/          # 工具函数
│   └── package.json       # Node.js 依赖
├── data/                   # 数据目录
│   ├── raw/               # 原始数据
│   │   ├── HistBench_complete/   # 完整的多模态文件存储目录（项目运行时唯一使用的媒体目录）
│   │   └── metadata.jsonl        # 问题与媒体文件映射元数据
│   └── processed/         # 处理后的数据
├── scripts/                # 工具脚本
│   └── process_excel.py    # Excel 转 CSV 脚本
├── start_backend.py       # 后端启动脚本
├── start_frontend.sh      # 前端启动脚本
└── README.md              # 项目说明
```

## 🚀 快速开始

### 1. 环境要求
- Python 3.8+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv) (超高速 Python 包管理器)
- npm 或 yarn

### 2. 启动后端服务

**方式一：使用 uv（推荐，最简单）**
```bash
# 安装 uv（如未安装）
curl -Ls https://astral.sh/uv/install.sh | sh

# 直接运行（uv 会自动处理虚拟环境和依赖安装）
uv run python start_backend.py
```
**方式二：传统方式**  
```bash
# 创建虚拟环境
uv venv .venv-backend  

# 激活虚拟环境  
source .venv-backend/bin/activate  # Windows 用 .venv-backend\Scripts\activate  

# 安装依赖
uv pip install -r requirements.txt  

# 启动服务
python start_backend.py
```
后端服务启动后，访问地址为：http://localhost:8000

### 3. 启动前端应用

首次使用请在 frontend 目录下安装依赖：
```bash
cd frontend
npm install   # 或 pnpm install/yarn install
```

然后启动开发服务器：
```bash
npm run dev
```
前端应用将启动在 `http://localhost:3000`