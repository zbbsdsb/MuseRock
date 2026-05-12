# MuseRock — MVP 冲刺计划 v2

> **审计日期**: 2026-05-12 下午
> **执行者**: Trae
> **原则**: 每个 Task 完成 → 本地验证 → 提交 → 再进入下一个。不准跳步。

---

## 当前完成度（基于 commit `afba5a7` 审计）

### ✅ 已完成（本轮 Trae 执行的成果）

| 任务 | 文件 | 状态 |
|------|------|------|
| CI 脚本补齐 | `package.json` (root) | ✅ `typecheck/build:web/build:api/dev:api` 均存在 |
| App.tsx 死 import 清除 | `apps/web/src/App.tsx` | ✅ 已使用 `ai-provider.ts` 抽象层 |
| API dev 热重载 | `apps/api/package.json` | ✅ `tsx watch src/main.ts` |
| auth.service.ts 泄漏修复 | `apps/api/src/auth/auth.service.ts` | ✅ `OnModuleDestroy` + `clearInterval` |
| Graceful Shutdown | `apps/api/src/main.ts` | ✅ SIGTERM + SIGINT 均处理 |
| 事件驱动任务处理 | `apps/api/src/apprentice/apprentice.service.ts` | ✅ `wakeUp()` / `waitForJob()` |
| `apps/web/package.json` 创建 | `apps/web/package.json` | ✅ 独立 package.json + vite.config.ts |
| 后端 vitest 配置 | `apps/api/vitest.config.ts` | ✅ 配置文件存在 |
| API Keys 用 ConfigService | `apps/api/src/api-keys/api-keys.service.ts` | ✅ |
| README 更新 | `README.md` | ✅ 双端口启动说明已有 |
| 暗色主题重构 | `apps/web/src/index.css` | ✅ 使用 CSS 变量，`.dark {}` 覆盖 |

### ⚠️ 遗留问题（需要 Trae 继续处理）

| 优先级 | 问题 | 位置 | 说明 |
|--------|------|------|------|
| 🔴 P0 | **后端无测试文件** | `apps/api/src/` | `vitest.config.ts` 有了，但无 `.test.ts` 文件，CI `test-api` 步骤跑空会通过但没有价值，且 `supertest` 依赖实际未被用到 |
| 🔴 P0 | **`export.ts` 使用 `require()` in ESM** | `apps/web/src/utils/export.ts` L98 | `const { Paragraph, TextRun } = require('docx')` — 这在 Vite/ESM 环境下会运行时报错 |
| 🔴 P0 | **暗色主题 opacity 覆盖有 bug** | `apps/web/src/index.css` L107–122 | `.dark .bg-brand-black/5` 设置 `background-color + opacity:0.05` — **`opacity` 会影响子元素文字透明度**，正确做法是用 `rgba()` 直接写颜色 |
| 🟡 P1 | **前端测试可能引用不存在的 store** | `apps/web/src/stores/*.test.ts` | 需要实际运行 `cd apps/web && npm test` 验证是否全部通过 |
| 🟡 P1 | **`index.css` 中 `@import` 在 `@layer` 里** | L39 | Google Fonts `@import` 放在 `@layer base {}` 内部不合规，应移到文件顶部 |
| 🟡 P1 | **CI `security-scan` 使用过时 action** | `.github/workflows/ci.yml` L157 | `github/codeql-action/upload-sarif@v2` 已被 v3 取代，可能导致 CI warning |
| 🟢 P2 | **后端无 health check 端点** | `apps/api/src/` | CI / 测试需要 `/health` 端点，后端测试也依赖它 |
| 🟢 P2 | **`vite.config.ts` `process.env` 泄漏** | `apps/web/vite.config.ts` L11 | `define: { 'process.env.GEMINI_API_KEY': ... }` 直接注入到 bundle，安全风险，应只在 Local 模式下用 `import.meta.env.VITE_GEMINI_API_KEY` |

---

## MVP 验收标准

MuseRock MVP = 用户可以：

1. ✅ 打开应用，看到写作编辑器
2. ✅ 输入文字、保存到本地（localStorage）
3. ✅ 切换 AI 提供商（Gemini/OpenAI/Anthropic），触发 AI 灵感
4. ✅ 导出为 Markdown / Word / PDF（**export.ts 的 `require()` bug 修完后**）
5. ✅ 打开 MuseDashboard 管理项目
6. ✅ 亮/暗/系统三种主题切换无视觉错误（**CSS opacity bug 修完后**）
7. ✅ Firebase Google 登录工作
8. ✅ CI 全部绿灯（**后端测试文件加完后**）

---

## 执行计划（严格按顺序）

### Phase A：关键 Bug 修复（~2h）🔴 阻塞 MVP，必须先做

---

#### Task A-1：修复 `export.ts` 中的 `require()` 调用

**位置**: `apps/web/src/utils/export.ts` 第 98 行

**问题**:
```typescript
// ❌ 错误 - 在 Vite ESM 环境中会报 "require is not defined"
const { Paragraph, TextRun } = require('docx');
```

**修复**:
将 `parseContentToParagraphs` 函数改为接收已 import 的类作为参数，并在调用处传入：

```typescript
// apps/web/src/utils/export.ts

// 修改函数签名，接收依赖注入
function parseContentToParagraphs(
  content: string,
  Paragraph: typeof import('docx').Paragraph,
  TextRun: typeof import('docx').TextRun
) {
  const lines = content.split('\n');
  const paragraphs = [];
  for (const line of lines) {
    if (line.trim()) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(line)],
          spacing: { after: 100 },
        })
      );
    } else {
      paragraphs.push(new Paragraph({}));
    }
  }
  return paragraphs;
}

// 在 exportToWord 中传入：
export async function exportToWord(options: ExportOptions): Promise<void> {
  const { Document, Packer, Paragraph, TextRun } = await import('docx');
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: options.title || 'Untitled Document', bold: true, size: 32 })],
          spacing: { after: 200 },
        }),
        ...parseContentToParagraphs(options.content, Paragraph, TextRun),
      ],
    }],
  });
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  downloadBlob(blob, `${sanitizeFilename(options.title || 'document')}.docx`);
}
```

**验收**: 在应用中点击"导出 Word"，文件正常下载，控制台无 `require is not defined` 错误。

---

#### Task A-2：修复 `index.css` 暗色主题 opacity 污染问题

**位置**: `apps/web/src/index.css` 第 107–122 行

**问题**: 用 `background-color + opacity` 分别设置会让整个元素（包括子元素文字）变透明，不是预期效果。

```css
/* ❌ 错误 - opacity 会影响子元素 */
.dark .bg-brand-black\/5 {
  background-color: var(--color-brand-text);
  opacity: 0.05;
}
```

**修复**: 用 `rgba()` 直接写背景色，只影响背景本身：

```css
/* ✅ 正确 */
.dark .bg-brand-black\/5 {
  background-color: rgba(229, 229, 229, 0.05);
}
.dark .bg-brand-black\/10 {
  background-color: rgba(229, 229, 229, 0.1);
}
.dark .hover\:bg-brand-black\/5:hover {
  background-color: rgba(229, 229, 229, 0.05);
}
.dark .hover\:bg-brand-black\/10:hover {
  background-color: rgba(229, 229, 229, 0.1);
}
.dark .ring-brand-black\/5 {
  --tw-ring-color: rgba(229, 229, 229, 0.05);
}
.dark .ring-brand-black\/10 {
  --tw-ring-color: rgba(229, 229, 229, 0.1);
}
```

同时，将 `@import url('https://fonts.googleapis.com/...')` 移出 `@layer base {}` 块，放到文件顶部（CSS `@import` 必须在所有其他规则之前）：

```css
/* ✅ 正确位置 - 文件第一行 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
@import "tailwindcss";
/* ... 其他规则 */
```

**验收**: 
- 浏览器切换暗色模式，hover 侧边栏按钮，效果是轻微半透明浅色背景，**文字不变透明**
- Chrome DevTools 检查 `.dark .bg-brand-black/5` 节点，`opacity` 为 `1`，`background-color` 为 `rgba(229,229,229,0.05)`

---

#### Task A-3：修复 `vite.config.ts` API Key 泄漏风险

**位置**: `apps/web/vite.config.ts` 第 11 行

**问题**: `process.env.GEMINI_API_KEY` 被硬注入 bundle，如果 `.env` 中有值，会打包到前端代码里暴露。

**修复**: 删除此 `define` 配置项。在 Local 模式下，API key 已经通过 `localStorage` 管理，不需要从构建时 `process.env` 注入。

```typescript
// ❌ 删除这段
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
},
```

**验收**: `npm run build` 产物中不包含硬编码的 `GEMINI_API_KEY` 值。

---

### Phase B：后端测试文件（~2h）🔴 CI `test-api` 有配置无内容

---

#### Task B-1：添加后端测试文件

**位置**: `apps/api/src/`

**说明**: `vitest.config.ts` 已有，`package.json` 的 `test` 脚本是 `vitest --run`，但没有任何 `.test.ts` 文件。CI `test-api` 步骤跑起来会 pass（vitest 找不到测试文件时不报错），但毫无价值。

**创建以下文件**:

**1. `apps/api/src/__tests__/health.test.ts`**（最简单，先打通管道）
```typescript
import { describe, it, expect } from 'vitest';

describe('Health Check', () => {
  it('should pass a basic sanity check', () => {
    expect(1 + 1).toBe(2);
  });

  it('should validate environment expectations', () => {
    // Ensure the test environment is Node
    expect(typeof process).toBe('object');
    expect(typeof process.env).toBe('object');
  });
});
```

**2. `apps/api/src/__tests__/api-keys.service.test.ts`**（测试加密逻辑）
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { ApiKey } from '../api-keys/entities/api-key.entity';

// Mock 加密 key（64 位 hex = 32 字节）
const MOCK_ENCRYPTION_KEY = 'a'.repeat(64);

describe('ApiKeysService', () => {
  let service: ApiKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'API_KEY_ENCRYPTION_KEY') return MOCK_ENCRYPTION_KEY;
              return undefined;
            },
          },
        },
        {
          provide: getRepositoryToken(ApiKey),
          useValue: {
            findOne: vi.fn(),
            save: vi.fn(),
            create: vi.fn(),
            find: vi.fn(),
            delete: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

**注意**: 需要在 `vitest.config.ts` 的 `test` 配置中添加 `globals: true`，这样才能使用 `vi.fn()` 而不需要每次 import：

```typescript
// apps/api/vitest.config.ts
export default defineConfig({
  test: {
    globals: true,  // ← 添加这行
    environment: 'node',
    // ...
  },
});
```

**3. `apps/api/src/__tests__/auth.service.test.ts`**（测试 setInterval 清理）
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'OasisOAuthService',  // 根据实际 token 调整
          useValue: { buildAuthorizationUrlWithChallenge: vi.fn() },
        },
        {
          provide: 'SessionService',
          useValue: { createSession: vi.fn(), getSession: vi.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await module.close();  // 触发 onModuleDestroy
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should clean up interval on module destroy', async () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    await module.close();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
```

**验收**: `cd apps/api && npm test` 输出显示至少 3 个通过的测试。

---

### Phase C：前端测试验证（~30min）🟡

---

#### Task C-1：验证前端测试全部通过

**操作**:
```bash
cd apps/web && npm test
```

**预期**: 3 个测试文件（`ai.store.test.ts`, `app.store.test.ts`, `auth.store.test.ts`）全部通过，无报错。

**如果报错**: 逐一修复。常见问题：
- Store 依赖 `localStorage` → 在 `jsdom` 环境下应该可用
- Store 依赖外部服务 → 需要 mock

**验收**: `npm test` 返回 exit code 0，显示所有测试通过。

---

### Phase D：暗色主题手动验证（~1h）🟡

---

#### Task D-1：全应用暗色主题手动测试

**操作**: 启动 `cd apps/web && npm run dev`，切换暗色模式，逐一检查：

| 组件 | 检查项 | 通过标准 |
|------|--------|---------|
| 主编辑器（The Cloister） | 背景色/文字对比度 | 背景深色，文字浅色，可读 |
| 侧边栏 | 导航按钮 hover 效果 | 半透明浅色背景（非全透明） |
| AI 灵感面板 | 输入框/结果区域 | 无白色背景残留 |
| MuseDashboard | 项目卡片 | 深色背景，文字清晰 |
| 设置弹窗（SettingsModal） | 弹窗背景 | 深色背景，非白色 |
| 导出菜单 | 下拉选项 | 深色背景 |
| 主题切换按钮本身 | 点击切换动画 | 流畅，无闪烁 |

**如果发现问题**: 修复对应组件的 CSS class，优先使用语义化 token（如 `bg-brand-paper`）替换硬编码 `bg-white`。

**验收**: 所有列出的组件在暗色模式下视觉正确，无错误颜色/对比度问题。

---

### Phase E：CI 验证（~30min）🔴 最终检查

---

#### Task E-1：本地模拟 CI 全流程

**在本地依次运行**:

```bash
# Step 1: 前端 typecheck
cd apps/web && npm run typecheck
# 预期: 0 errors

# Step 2: 后端 typecheck
cd ../api && npm run typecheck
# 预期: 0 errors

# Step 3: 前端构建
cd ../web && npm run build
# 预期: dist/ 生成，无错误

# Step 4: 后端构建
cd ../api && npm run build
# 预期: dist/ 生成，无错误

# Step 5: 前端测试
cd ../web && npm test
# 预期: 全部通过

# Step 6: 后端测试
cd ../api && npm test
# 预期: 全部通过
```

**如果某步失败**: 修复后重新运行该步，确认通过再继续。

**验收**: 所有 6 步全部成功，无错误。

---

## 提交策略（每个 Task 独立提交）

```
fix(web): remove require() in export.ts, use dynamic import
fix(web): fix dark mode opacity pollution in index.css
fix(web): remove GEMINI_API_KEY from vite define config
test(api): add vitest globals config
test(api): add health, api-keys, auth service test stubs
test(web): verify store tests pass
fix(theme): manual dark mode fixes from visual audit
ci: verify all CI steps pass locally
```

---

## 不在本轮做的事（Post-MVP）

- ❌ PostgreSQL/pgvector 持久化（P2-1）
- ❌ InspirationMap 实现（P2-3）
- ❌ MotivationGarden 实现（P3-2）
- ❌ BullMQ/Temporal 替换（当前事件驱动已满足 MVP）
- ❌ 真实 OWASP 扫描（P4-1）
- ❌ App.tsx 拆分重构（QF-4，太大风险）

---

## 执行后检查清单

完成所有 Task 后，确认以下全部打勾：

- [ ] `cd apps/web && npm run build` ✅ 无错误
- [ ] `cd apps/api && npm run build` ✅ 无错误
- [ ] `cd apps/web && npm test` ✅ 全部通过
- [ ] `cd apps/api && npm test` ✅ 至少 3 个测试通过
- [ ] 暗色模式视觉检查 ✅ 无白色背景/opacity 问题
- [ ] Word 导出功能 ✅ 不报 `require is not defined`
- [ ] 推送到 main 后 GitHub Actions CI ✅ 全绿

---

*如果某个 Task 遇到预期外的阻塞，在 `docs/MVP_SPRINT_LOG.md` 中记录问题描述 + 已尝试方案，然后跳到下一个 Task。*
