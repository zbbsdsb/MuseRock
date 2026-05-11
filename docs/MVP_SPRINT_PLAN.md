# MuseRock — MVP 冲刺计划

> **日期**: 2026-05-12
> **目标**: 扎实稳步推进至 MVP（最小可用产品）
> **执行者**: Trae (AI 编码代理)
> **原则**: 每阶段完成后再进入下一阶段，不准跳步

---

## MVP 验收标准

MuseRock MVP 是一个可用的 AI 创意写作平台，用户能够：

1. **注册/登录** — Firebase + OasisBio 认证 ✅
2. **写作** — The Cloister 编辑器，可输入文字 ✅
3. **AI 灵感** — 连接 Gemini/OpenAI/Anthropic，获取灵感 ✅
4. **导出** — 导出为 Markdown/Word/PDF ✅
5. **项目管理** — 创建/打开/编辑项目 ✅ (有 MuseDashboard)
6. **暗色主题** — 亮色/暗色/系统三种模式，切换流畅无视觉错误 ⚠️
7. **双模式 AI** — Local (直连) / Cloud (代理) 切换 ✅
8. **CI 通过** — GitHub Actions CI 绿灯 ✅ (ci.yml 存在)
9. **基础测试** — 前端+后端至少有 smoke test，CI 不失败 ⚠️

**MVP 不强制要求**（Post-MVP）:
- 记忆系统持久化（当前 in-memory，重启丢失）→ Post-MVP P2
- InspirationMap（灵感地形图）→ Post-MVP P2
- MotivationGarden（动机花园）→ Post-MVP P3
- 真实 OWASP 检查（当前 mock）→ Post-MVP P4

---

## 当前完成度评估（2026-05-12 审计结果）

| 区域 | 完成度 | 说明 |
|------|--------|------|
| 前端核心功能 | 85% | 写作/AI/导出/项目管理均有，暗色主题有小问题 |
| 后端核心功能 | 75% | AI代理/API Key加密/Auth 均可用，但有一些 bug |
| 测试 | 40% | 前端有 3 个测试文件，后端无测试 |
| CI/CD | 80% | ci.yml 存在且脚本正确，但后端测试步骤会失败（无测试） |
| 暗色主题 | 70% | 逻辑存在，但 `.dark .bg-brand-black/5` 等覆盖可能有问题 |
| 代码质量 | 60% | `auth.service.ts` setInterval 泄漏，API dev 无热重载 |

**总体完成度**: ~72%（距离 MVP 还差 ~28%）

---

## 冲刺阶段（共 4 个阶段，预计 ~10 小时）

```
Phase 1: 关键 Bug 修复（~2h）→ 必须先完成
Phase 2: 测试基础（~3h）→ 让 CI 真正通过
Phase 3: 暗色主题完善（~2h）→ MVP 验收必需
Phase 4: 稳定化与文档（~3h）→ MVP 发布准备
```

---

## Phase 1: 关键 Bug 修复（~2h，必须先完成）

> 这些 bug 虽然不阻塞核心功能，但会导致内存泄漏或开发体验差，必须优先修复。

### Task 1-1: 修复 `auth.service.ts` setInterval 泄漏 🔴 HIGH

**问题**: `apps/api/src/auth/auth.service.ts` 第 21 行 `setInterval(() => this.cleanupExpiredStates(), 5 * 60 * 1000)` 没有保存 interval ID，也没有在模块销毁时清除。

**修复步骤**:
1. 在 `AuthService` 类中添加私有属性 `private cleanupTimer: NodeJS.Timeout;`
2. 在构造函数中保存 interval ID: `this.cleanupTimer = setInterval(...)`
3. 实现 `OnModuleDestroy` 接口:
   ```typescript
   import { Injectable, OnModuleDestroy } from '@nestjs/common';
   
   @Injectable()
   export class AuthService implements OnModuleDestroy {
     // ...
     onModuleDestroy() {
       clearInterval(this.cleanupTimer);
     }
   }
   ```

**验收标准**:
- `auth.service.ts` 有 `OnModuleDestroy` 实现
- `setInterval` 返回的 ID 被保存并在模块销毁时清除
- 运行 `cd apps/api && npm run typecheck` 无错误

---

### Task 1-2: 修复 API dev 脚本（添加热重载）🟡 MEDIUM

**问题**: `apps/api/package.json` 第 9 行 `"dev": "tsc && node dist/main.js"` 每次修改都需要手动重启。

**修复步骤**:
1. 在 `apps/api/package.json` 添加 `tsx` 依赖（已在根 `package.json` devDependencies 中，但需要本地安装）:
   ```bash
   cd apps/api && npm install --save-dev tsx
   ```
2. 修改 `dev` 脚本为:
   ```json
   "dev": "tsx watch src/main.ts"
   ```
3. 验证: `cd apps/api && npm run dev` 启动后，修改任意 `.ts` 文件，服务器自动重启。

**验收标准**:
- `apps/api/package.json` 的 `dev` 脚本使用 `tsx watch`
- `tsx` 在 `apps/api/package.json` devDependencies 中
- 手动验证热重载工作

---

### Task 1-3: 修复暗色主题 CSS 覆盖问题 🟡 MEDIUM

**问题**: `apps/web/src/index.css` 中:
- `.dark .bg-brand-black/5` 设置了 `background-color: var(--color-brand-text-dark)` 又设 `opacity: 0.05`，这会让文字颜色作为背景色，不符合预期。
- 预期行为: hover 时应该是半透明的浅色背景，而不是用文字颜色。

**修复步骤**:
1. 修改 `.dark .bg-brand-black/5`:
   ```css
   .dark .bg-brand-black\/5 {
     background-color: rgba(229, 229, 229, 0.05);
   }
   ```
2. 修改 `.dark .bg-brand-black/10`:
   ```css
   .dark .bg-brand-black\/10 {
     background-color: rgba(229, 229, 229, 0.1);
   }
   ```
3. 修改 `.dark .hover\:bg-brand-black\/5:hover`:
   ```css
   .dark .hover\:bg-brand-black\/5:hover {
     background-color: rgba(229, 229, 229, 0.08);
   }
   ```
4. 修改 `.dark .hover\:bg-brand-black\/10:hover`:
   ```css
   .dark .hover\:bg-brand-black\/10:hover {
     background-color: rgba(229, 229, 229, 0.15);
   }
   ```
5. 在浏览器中手动验证: 切换暗色模式，hover 在按钮/卡片上，效果应该是 subtle 的浅色背景，而不是全透明或错误颜色。

**验收标准**:
- 暗色模式下 hover 效果正确（subtle 浅色背景）
- 亮色模式无回归
- 在 Chrome/Firefox 中手动验证

---

## Phase 2: 测试基础（~3h，让 CI 真正通过）

> CI 已配置，但后端无测试，`test-api` 步骤会失败（虽然当前 `test` 脚本是 `vitest --run`，如果没有测试文件可能会报错或pass）。需要添加基础测试 scaffolding。

### Task 2-1: 添加后端测试 scaffolding 🟡 MEDIUM

**问题**: `apps/api/src/` 没有 `__tests__/` 目录，也没有任何 `.test.ts` 文件。`npm run test` 可能返回 0（如果没有测试文件，vitest 默认 pass），但这是不健康的。

**修复步骤**:
1. 创建 `apps/api/src/__tests__/app.e2e-spec.ts`（NestJS 标准的 e2e 测试）:
   ```typescript
   import { Test, TestingModule } from '@nestjs/testing';
   import { INestApplication } from '@nestjs/common';
   import * as request from 'supertest';
   import { AppModule } from './app.module';
   
   describe('AppController (e2e)', () => {
     let app: INestApplication;
   
     beforeAll(async () => {
       const moduleFixture: TestingModule = await Test.createTestingModule({
         imports: [AppModule],
       }).compile();
   
       app = moduleFixture.createNestApplication();
       await app.init();
     });
   
     it('/ (GET) - health check', () => {
       return request(app.getHttpServer())
         .get('/health')
         .expect(200);
     });
   
     afterAll(async () => {
       await app.close();
     });
   });
   ```
   **注意**: 需要先检查是否有 `/health` 端点。如果没有，先创建一个简单的 health controller，或者测试其他存在的端点。

2. 创建 `apps/api/src/__tests__/memory.service.spec.ts`（单元测试示例）:
   ```typescript
   import { Test, TestingModule } from '@nestjs/testing';
   import { MemoryService } from '../memory/memory.service';
   import { WorkingMemory } from '../memory/layers/working.memory';
   
   describe('MemoryService', () => {
     let service: MemoryService;
   
     beforeEach(async () => {
       const module: TestingModule = await Test.createTestingModule({
         providers: [
           MemoryService,
           { provide: WorkingMemory, useValue: { store: jest.fn(), retrieve: jest.fn() } },
           // ... 其他依赖
         ],
       }).compile();
   
       service = module.get<MemoryService>(MemoryService);
     });
   
     it('should be defined', () => {
       expect(service).toBeDefined();
     });
   });
   ```

3. 确保 `apps/api/package.json` 有 `@nestjs/testing` 和 `supertest` 依赖（已在 devDependencies 中）。

**验收标准**:
- `cd apps/api && npm run test` 运行并显示至少 1 个通过的测试
- `cd apps/api && npm run test:watch` 可以启动 watch 模式
- 在 CI 中 `test-api` 步骤会真正运行测试

---

### Task 2-2: 添加/完善前端测试 🟢 LOW

**问题**: 前端已有 3 个测试文件（`ai.store.test.ts`, `app.store.test.ts`, `auth.store.test.ts`），但需要验证它们是否真正测试了核心功能。

**步骤**:
1. 运行 `cd apps/web && npm run test` 查看现有测试是否通过。
2. 如果有失败，修复。
3. 可选: 添加 `App.test.tsx`（smoke test，验证 App 组件能挂载）:
   ```typescript
   import { render, screen } from '@testing-library/react';
   import App from '../App';
   
   test('renders App without crashing', () => {
     render(<App />);
     // 检查是否有预期的元素
   });
   ```
   **注意**: 这可能需要 mock Firebase 和其他依赖，比较复杂。如果不容易实现，可以跳过。

**验收标准**:
- 前端测试全部通过
- `cd apps/web && npm run test` 返回 0

---

## Phase 3: 暗色主题完善（~2h，MVP 验收必需）

> Phase 1 的 Task 1-3 已经修复了 CSS 覆盖问题。这个阶段专注于手动验证和修复任何剩余的暗色主题 bug。

### Task 3-1: 全面暗色主题手动测试与修复 🟡 MEDIUM

**步骤**:
1. 启动前端 (`npm run dev`)
2. 切换至暗色模式（点击设置图标 → 选择 Dark）
3. 逐一检查以下页面/组件:
   - [ ] 主编辑器页面（The Cloister）
   - [ ] MuseDashboard（项目管理）
   - [ ] SettingsModal（设置模态框）
   - [ ] UserPanel（用户面板）
   - [ ] Export 菜单
   - [ ] AI 灵感面板

4. 记录任何视觉问题:
   - 文字不可读（对比度不足）
   - 背景颜色错误（白色背景在暗色模式下）
   - hover 效果不正确
   - 边框颜色不可见

5. 修复发现的问题:
   - 对于硬编码的 `bg-white`，考虑改为 `bg-brand-paper`（如果在亮色模式下是浅色背景）
   - 对于硬编码的 `text-brand-black`，在暗色模式下应该自动切换为 `text-brand-text-dark`（如果 `index.css` 配置正确）
   - 检查 `SettingsModal.tsx` 第 47 行 `bg-white`（硬编码），在暗色模式下是否被 `.dark .bg-white` 规则覆盖

6. 测试"系统"模式:
   - 切换到"系统"模式
   - 修改操作系统主题（亮色 ↔ 暗色）
   - 验证 MuseRock 自动跟随

**验收标准**:
- 所有页面在暗色模式下视觉正确（无不可读文字，无错误背景色）
- 亮色模式无回归
- 系统模式正确跟随 OS 设置
- 三种模式切换流畅，无闪烁

---

## Phase 4: 稳定化与文档（~3h，MVP 发布准备）

> 完成这个阶段后，MuseRock 应该达到 MVP 状态，可以发布给早期用户测试。

### Task 4-1: 项目管理数据持久化修复 🟡 MEDIUM

**问题**: `MuseDashboard.tsx` 使用 `localStorage` 存储项目数据（`muserock_projects`）。这在单设备上工作，但:
1. 数据不会同步到其他设备
2. 清除浏览器缓存会丢失数据

**注意**: 完整的持久化需要后端 + 数据库（PostgreSQL + pgvector，P2-1），这超出了 MVP 范围。

**MVP 解决方案**: 至少确保当前会话 + 跨会话（同一浏览器）数据不丢失。当前实现已经做到这一点（`localStorage`），所以这个选项可以标记为完成。

**但有一个潜在问题**: 如果用户清除浏览器缓存，`localStorage` 数据会丢失。MVP 可以接受这个限制，但在文档中说明。

**如果时间允许**，可以考虑添加"导出/导入项目"功能作为备份机制。但这可能超出 MVP 范围。

**验收标准**:
- 项目数据在浏览器会话之间持久化（同一设备）
- 在文档中说明限制（清除缓存会丢失数据）

---

### Task 4-2: 更新 README 和文档 🟢 LOW

**问题**: README 可能过时，不能准确指导新用户启动项目。

**步骤**:
1. 更新 `README.md`:
   - 添加"Quick Start"部分，说明如何:
     - 安装依赖（`npm install && cd apps/api && npm install`）
     - 配置环境变量（复制 `.env.example`）
     - 启动前端（`npm run dev`）
     - 启动后端（`cd apps/api && npm run dev`）
     - 切换 AI 模式（Local vs Cloud）
   - 添加"Testing"部分，说明如何运行测试
   - 添加"Building for Production"部分

2. 更新 `docs/NEXT_ACTIONS.md`:
   - 标记已完成的任务
   - 更新完成度百分比
   - 添加 MVP 验收标准（从本文档复制）

3. 创建 `docs/MVP_STATUS.md`（可选，总结 MVP 状态）:
   - 列出已实现的功能
   - 列出已知限制
   - 给出 Post-MVP 路线图

**验收标准**:
- 新用户可以按照 README 的 Quick Start 成功启动项目
- `docs/NEXT_ACTIONS.md` 反映当前状态

---

### Task 4-3: 最终冒烟测试 🔴 HIGH

**问题**: 需要确保核心功能真正工作，而不仅仅是编译通过。

**步骤**:
1. 启动前端 + 后端（如果需要）
2. 逐一测试核心功能:
   - [ ] 打开应用，看到编辑器
   - [ ] 输入文字，确认编辑器工作
   - [ ] 切换到 AI 灵感面板，输入提示，确认 API 调用工作（需要有效的 API key）
   - [ ] 尝试导出（Markdown/Word/PDF），确认导出文件生成
   - [ ] 打开 MuseDashboard，创建新项目，确认项目保存
   - [ ] 切换暗色主题，确认无视觉错误
   - [ ] 切换回亮色主题，确认无回归
   - [ ] （如果配置了 Firebase）尝试登录，确认认证工作

3. 记录任何 bug 或意外行为

4. 如果发现关键 bug，修复后重新测试

**验收标准**:
- 所有核心功能手动测试通过
- 没有关键 bug（崩溃、数据丢失、安全漏洞）
- 应用可用（虽然不是完美）

---

## 执行顺序与时间估算

**严格按顺序执行，完成一个阶段后再进入下一个**:

```
Week 1 (当前):
  Day 1: Phase 1 (Task 1-1, 1-2, 1-3) → ~2h
  Day 2: Phase 2 (Task 2-1, 2-2) → ~3h
  Day 3: Phase 3 (Task 3-1) → ~2h
  Day 4: Phase 4 (Task 4-1, 4-2, 4-3) → ~3h
  Day 5: 缓冲时间/修复 test 中发现的问题
```

**总计**: ~10h 实际工作时间（+ 缓冲）

---

## 提交策略

每个 Task 完成后提交一次，提交信息清晰:

```
fix(api): resolve setInterval memory leak in auth.service
fix(api): add hot-reload dev script with tsx
fix(web): correct dark mode CSS overrides for hover states
test(api): add vitest scaffolding and e2e test skeleton
test(web): verify existing tests pass
fix(theme): manual testing and fixes for dark mode
docs: update README with quick start and testing instructions
test: final smoke test of core features
```

---

## Post-MVP 待办（MVP 完成后）

这些不是 MVP 阻塞项，但应该在 MVP 后尽快处理:

1. **P2-1**: 记忆系统持久化（PostgreSQL + pgvector）
2. **P2-3**: 实现 InspirationMap UI（灵感地形图）
3. **P3-2**: 实现 MotivationGarden UI（动机花园）
4. **P4-1**: 替换 mock OWASP 检查为真实扫描
5. **P3-1**: 考虑用 BullMQ 替换事件驱动的任务处理（当前实现对于 MVP 足够）

---

## 给 Trae 的执行说明

1. **严格按顺序执行**: 不要跳步，完成 Phase 1 后再进入 Phase 2
2. **每个 Task 完成后验证**: 不要假设代码正确，要实际运行/测试
3. **记录发现的问题**: 如果某个 Task 遇到预期外的困难，记录在 `docs/MVP_SPRINT_LOG.md`
4. **不要过度工程化**: MVP 不需要完美，只需要可用。不要为了实现"最佳实践"而延迟 MVP
5. **手动测试很重要**: 不要只依赖自动化测试，要实际在浏览器中操作应用

---

*这个计划是扎实的、可执行的。按照这个计划，Trae 可以稳步推进 MuseRock 至 MVP 状态。*
