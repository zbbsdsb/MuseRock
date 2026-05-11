# MuseRock 项目长期记忆

## 项目基本信息

- **项目名**：MuseRock — AI 创意协作平台（为创作者：写作、设计、研究、音乐）
- **仓库**：github.com/zbbsdsb/muserock
- **技术栈**：React 19 + TypeScript（前端）、NestJS（后端 BFF）、Firebase Auth + OasisBio OAuth
- **许可证**：GPL-3.0
- **部署定位**：本地优先创作工具，预留云端支持

## AI 连接架构（2026-05-11）

MuseRock 支持 **Local / Cloud** 双模式，通过 Settings 面板切换：
- **Local 模式**：API Key 存 localStorage，前端直连 Gemini/OpenAI/Anthropic API
- **Cloud 模式**（默认）：API Key AES-256-GCM 加密存后端 SQLite，前端调 `/ai/*` 代理端点
- 抽象层文件：`apps/web/src/services/ai-provider.ts`（工厂函数 `createAIService` / `createApiKeyService`）
- 后端代理：`apps/api/src/ai/ai-proxy.controller.ts`（POST /ai/generate, /ai/inspiration, /ai/source-assets）
- Key 管理：`apps/api/src/api-keys/api-keys.service.ts`（AES-256-GCM 加密）

## 架构现状（2026-05-11 更新）

### 后端 apps/api（NestJS，端口 3001）
- **已实现**：AI 代理端点 + 三个提供商（Gemini/OpenAI/Anthropic）✅
- **已实现**：API Key 加密存储 + CRUD 端点 ✅
- **已实现**：5层记忆体系（working/episodic/contextual/knowledge/compliance）✅ 但为纯内存 Map，无 PostgreSQL/pgvector 持久化
- **已实现**：AI Service + ModelAdapterFactory（OpenAI/Gemini/Anthropic 适配器）✅
- **已实现**：Prompt Registry 服务 ✅
- **已实现**：ApprenticeService（学徒系统，任务队列 maxConcurrent=3）✅
- **已实现**：MCP Gateway（JSON-RPC，5个 handler：memory/apprentice/bio/content/prompt）✅
- **已实现**：OasisBio OAuth 2.0 + PKCE ✅
- **已实现**：ObservabilityService（Prometheus metrics）✅
- **已实现**：ComplianceService ✅ 但 OWASP 检查均为 mock 硬编码
- **已实现**：TypeORM + SQLite（开发用）✅
- **未实现**：PostgreSQL + pgvector（规划 P2，当前为 SQLite）
- **未实现**：Redis 缓存（规划中）
- **未实现**：Temporal 工作流（规划 P3）

### 前端 apps/web（React 19 + Vite，端口 3000）
- **已实现**：AI 双模式（Local/Cloud）✅ 含设置面板切换
- **已实现**：写作编辑器（The Cloister）✅ 单 textarea，无富文本
- **已实现**：Muse Engine 面板（AI 灵感 / Asset Sourcing）✅ 三个提供商均可工作
- **已实现**：导出功能（Markdown/Word/PDF）✅
- **已实现**：Firebase Google OAuth + OasisBio OAuth ✅
- **已实现**：Zustand store（app/ai/auth/theme）✅
- **已实现**：MuseDashboard、MuseSphere 组件 ✅
- **未实现**：灵感地形图（InspirationMap.tsx）
- **未实现**：MotivationGarden.tsx（动机花园）
- **未实现**：反事实风格切换台

### 进度对比路线图
| 阶段 | 计划 | 实际状态 |
|------|------|----------|
| P0 仓库可审阅化 | 第1-2周 | ✅ 90%（差 CI pipeline） |
| P1 安全架构+BFF | 第3-6周 | ✅ 90%（API Key 双模式已完成，差暗色主题完善） |
| P2 MuseSoda 记忆引擎 | 第7-12周 | ⚠️ 35%（架构搭好但无 pgvector，纯 SQLite） |
| P3 学徒系统+MCP | 第13-18周 | ⚠️ 30%（框架搭好，无 Temporal，前端 UI 缺失） |
| P4 合规+观测 | 第19-26周 | ⚠️ 20%（Prometheus 接入，但 OWASP 检查全 mock） |

## 关键优化点

1. ~~内存层无持久化（重启即丢）→ 接 PostgreSQL/pgvector~~（仍待做）
2. ~~前端 API Key 存 localStorage → 已改为双模式架构~~ ✅ 已解决
3. ~~web/services/ai.ts OpenAI/Anthropic 为 stub → 已全部可用~~ ✅ 已解决
4. ComplianceService OWASP 检查全部 mock → 接真实扫描工具
5. processJobs 用 while(true) 轮询 → 改用事件驱动或 Bull/BullMQ
6. ~~缺 .env.example 文件 → 影响贡献者上手~~ ✅ 已解决
7. 前端暗色主题（store 有 theme 但未完全应用）
8. 灵感地形图/动机花园 UI 组件未建
9. 缺 GitHub Actions CI
