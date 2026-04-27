# MuseRock 全局规则（目标零人工干预 · 强制生效）
## 一、项目计划与需求拆解
1.  所有需求自动按 5 阶段执行：基线修复 → BFF 与身份网关 → MuseSoda/学徒/OasisBio → MCP 与可观测 → 合规与开源治理，周期严格遵循 18–22 周 Beta、22–26 周 GA。
2.  里程碑自动拆分为原子任务，包含产出物、验收标准、依赖、负责人角色，自动生成周迭代计划。
3.  缺失文件导致返工自动增加 10%–20% 缓冲，进度自动更新，不允许人工排期干预。

## 二、文档规范（全程英文）
1.  PRD、API 契约、架构文档、ADR、操作手册、SDK 文档一律使用正式技术英文。
2.  代码实现前必须先生成 OpenAPI 3.1 契约，代码变更同步更新文档。
3.  自动生成 Mermaid 架构图、TS SDK 文档、合规检查清单，统一存入 docs 目录。

## 三、代码与架构强制约束
1.  严格遵守 monorepo 结构：apps/、packages/、infra/、.trae/，禁止随意创建目录。
2.  前端必须拆分 App.tsx 为 editor/muse/assets/settings/auth 模块；禁止 localStorage 存令牌，强制 httpOnly cookie。
3.  所有 LLM 调用、密钥、OAuth 交换只能在服务端 apps/api 中实现，前端不可接触任何机密。
4.  MuseSoda 必须实现 5 层记忆体系 + pgvector，所有读写经过 ACL 与敏感等级过滤。
5.  学徒工作流基于 Temporal，必须声明 budget/timeout/reviewMode，按负载分队列。

## 四、安全与合规（零泄露）
1.  前端代码禁止出现任何 provider secret、client secret、token 交换逻辑，否则直接拒绝生成。
2.  所有凭据使用 KMS/信封加密存储，自动记录审计日志。
3.  OasisBio/医疗数据默认标记 sensitivity=restricted，未脱敏不可进入检索与模型输入。
4.  新接口自动做 OWASP Top10 检查，自动修复常见漏洞。
5.  敏感数据在发送给第三方模型前必须脱敏。

## 五、测试与质量门禁
1.  自动生成 Vitest 单元测试，领域逻辑覆盖率 ≥90%，PR 自动运行。
2.  自动生成 Playwright E2E 用例，覆盖核心流程，必须通过才可合并。
3.  自动生成 k6 压测脚本，记忆查询/学徒创建等接口 P95 <450ms、失败率 <1%。
4.  LLM 输出自动校验事实性与 JSON Schema，不达标禁止发布。

## 六、MCP 与插件规范
1.  MCP 网关遵循 JSON-RPC 标准，暴露 search_memory、create_apprentice_job、fetch_bio_asset 等能力。
2.  插件自动校验清单与权限，拒绝越权插件。
3.  Trae 与外部 IDE 共用同一套 MCP 接口，统一 OAuth 2.1 鉴权。

## 七、CI/CD 与部署（GitOps 全自动）
1.  自动生成 GitHub Actions 流水线：PR 校验 → 镜像构建 → SBOM → 漏洞扫描 → GitOps 发布。
2.  自动生成 Helm + Argo CD 配置，staging → 灰度 → 生产渐进式发布。
3.  SLO 熔断自动触发回滚，无需人工操作。
4.  自动生成英文故障手册，支持自动恢复。

## 八、Trae 智能体分工
1.  6 个智能体权限严格隔离：frontend-refactor、api-contract-guardian、memory-engineer、apprentice-orchestrator、platform-release、qa-regression。
2.  智能体仅通过 MCP 只读访问资源，禁止越权。
3.  自动根据 package.json 更新技能栈，保持与技术栈一致。

## 九、强制执行机制
1.  所有规则在代码生成/PR 阶段拦截，不合规自动拒绝并给出修复指引。
2.  自动生成里程碑合规报告，标记未达标项。
3.  安全、架构、合规核心规则不允许人工绕过，例外必须自动生成审批单并审计留痕。