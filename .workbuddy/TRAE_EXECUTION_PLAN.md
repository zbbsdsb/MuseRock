# MuseRock MVP 冲刺计划 v3 — Trae 专版（Phase A 详细指令）

> **Created**: 2026-05-12 14:15
> **Updated**: 2026-05-12 14:28
> **Principle**: Trae 做所有执行工作，WorkBuddy 只做最终验收。每个 Task 独立提交。
> **策略**: 省 WorkBuddy credit = 把详细指令、代码示例、文件路径全部写在这里，Trae 按文档执行无需额外沟通。
>
> 📋 **完整路线图（Phase A → D）**: [`planning/MUSEROCK_EXECUTION_ROADMAP.md`](../planning/MUSEROCK_EXECUTION_ROADMAP.md)
> 本文件仅包含 **Phase A** 的文件级详细指令。

---

## 当前完成度快照（commit `159e2ff` 后）

### ✅ v2 计划中已完成的任务（代码已提交）

| Task | 描述 | 状态 |
|------|------|------|
| A-1 | `export.ts` require() → 动态 import | ✅ L14 `await import('docx')`, L97-100 参数传入 |
| A-2 | `index.css` opacity 污染 | ✅ L107-138 全部改为 `rgba()` |
| A-3 | `vite.config.ts` API Key 泄漏 | ✅ 无 `define` 块 |
| B-1(部分) | 后端测试文件 | ✅ 5 个测试文件已存在 |

### ❌ 仍需 Trae 处理

| 优先级 | ID | 描述 | 预计时间 |
|--------|-----|------|---------|
| 🔴 P0 | T1 | 78 处 `bg-white` 硬编码 → 暗色主题完全失效 | 2h |
| 🔴 P0 | T2 | `index.css` L68-83 `opacity` 残留（bg-white/50, bg-white/10 等） | 30min |
| 🟡 P1 | T3 | 后端测试文件存在但 `api-keys.service.test.ts` 可能有类型错误 | 30min |
| 🟡 P1 | T4 | 前端测试验证（3 个 store 测试） | 15min |
| 🟡 P1 | T5 | CI security-scan action 版本过时（v2→v3） | 10min |
| 🟢 P2 | T6 | 本地 CI 全流程验证 | 30min |

---

## Task T1：替换 78 处 `bg-white` 为语义化 token 🔴

**目标**: 暗色模式下不再出现白色背景闪烁。

**规则**:
- `bg-white` → `bg-brand-paper`（用于卡片、面板、弹窗等表面）
- `bg-white/N` → `bg-brand-paper/N` 或 `bg-brand-text/N`（根据语义）
- `hover:bg-white` → `hover:bg-brand-paper`
- 保留纯白的地方：纯白色装饰元素（但 MuseRock 设计语言中几乎不需要）

**逐文件执行**（按文件分组）:

### 1. `apps/web/src/components/layout/RailNav.tsx`
```
bg-white → bg-brand-paper
```

### 2. `apps/web/src/components/layout/Header.tsx`
```
bg-white → bg-brand-paper
```

### 3. `apps/web/src/components/layout/MusePanel.tsx`
```
bg-white → bg-brand-paper（L23 和 L52）
```

### 4. `apps/web/src/components/layout/UserPanel.tsx`
```
bg-white → bg-brand-paper
```

### 5. `apps/web/src/components/layout/SettingsModal.tsx`
```
bg-white → bg-brand-paper
```

### 6. `apps/web/src/components/QuickAccess.tsx`
```
bg-white → bg-brand-paper（L40, L43, L78, L87, L96）
```

### 7. `apps/web/src/components/ProjectDetail.tsx`
```
bg-white → bg-brand-paper（L33, L50）
```

### 8. `apps/web/src/components/ProjectCard.tsx`
```
bg-white/80 → bg-brand-paper/80（L46）
bg-white → bg-brand-paper（L69, L86, L132, L138, L144）
```

### 9. `apps/web/src/components/project/TemplateSelector.tsx`
```
hover:bg-white → hover:bg-brand-paper（多处）
bg-white → bg-brand-paper（L227, L240）
```

### 10. `apps/web/src/components/project/TemplateCard.tsx`
```
bg-white → bg-brand-paper
```

### 11. `apps/web/src/components/project/SettingsModal.tsx`
```
bg-white → bg-brand-paper（所有出现处，约 10 处）
```

### 12. `apps/web/src/App.tsx`
```
搜索所有 bg-white，按语义替换为 bg-brand-paper
```

### 13. `apps/web/src/components/MuseDashboard.tsx`
```
搜索所有 bg-white，按语义替换
```

### 14. `apps/web/src/components/MuseSphere.tsx`
```
搜索所有 bg-white，按语义替换
```

**执行方法**:
```
对每个文件：
1. 打开文件
2. 搜索 bg-white
3. 逐个判断语义，替换为 bg-brand-paper 或 bg-brand-paper/N
4. 不改变任何组件逻辑和结构
```

**验证**: 替换完成后，全局搜索 `apps/web/src/` 中所有 `.tsx` 文件，确认 `bg-white` 出现次数降至 0（或仅剩极少数确实需要纯白的地方）。

**提交**: `fix(theme): replace 78 hardcoded bg-white with semantic bg-brand-paper token`

---

## Task T2：修复 `index.css` 中 `opacity` 残留问题 🟡

**位置**: `apps/web/src/index.css` L68-83

**问题**: 这些规则用 `color + opacity` 分开设置，`opacity` 会影响子元素文字：

```css
/* ❌ 当前有问题的规则 */
.dark .bg-white\/50 {
  background-color: var(--color-brand-paper);
  opacity: 0.5;  /* ← 这行会导致整个元素（包括文字）变半透明 */
}
.dark .bg-white\/10 {
  background-color: var(--color-brand-text);
  opacity: 0.1;
}
.dark .hover\:bg-white\/10:hover {
  background-color: var(--color-brand-text);
  opacity: 0.1;
}
.dark .hover\:bg-white\/50:hover {
  background-color: var(--color-brand-text-muted);
  opacity: 0.5;
}
```

**修复**: 改为 `rgba()` 直接写背景色（和 T1 中已修复的 L107-138 保持一致风格）：

```css
/* ✅ 修复后 */
.dark .bg-white\/50 {
  background-color: rgba(36, 36, 36, 0.5);
}
.dark .bg-white\/10 {
  background-color: rgba(36, 36, 36, 0.1);
}
.dark .hover\:bg-white\/10:hover {
  background-color: rgba(36, 36, 36, 0.1);
}
.dark .hover\:bg-white\/50:hover {
  background-color: rgba(36, 36, 36, 0.5);
}
```

同理，检查 L90-101 的 `text-white` opacity 覆盖：
```css
.dark .text-white\/60 {
  color: var(--color-brand-text-muted);
  opacity: 0.6;  /* ← text opacity 可以保留，只影响文字本身 */
}
```
`text` 的 `opacity` 是可以接受的（文字本身的透明度是合理的），但为了一致性，也可以改为直接用 rgba。**如果时间紧，text opacity 可以暂不修改。**

**提交**: `fix(theme): convert remaining opacity-based dark overrides to rgba()`

---

## Task T3：验证并修复后端测试 🟡

**位置**: `apps/api/src/`

**现有测试文件**:
- `health/health.service.test.ts`
- `api-keys/api-keys.service.test.ts`
- `auth/auth.service.test.ts`
- `__tests__/auth.service.test.ts`
- `__tests__/health.test.ts`

**操作**:
1. 运行 `cd apps/api && npx vitest --run`
2. 如果全部通过 → 标记完成
3. 如果有报错 → 修复：
   - 常见问题 1：`vi.fn()` 不可用 → 确认 `vitest.config.ts` 有 `globals: true`（已有）
   - 常见问题 2：TypeORM entity import 失败 → mock `getRepositoryToken`
   - 常见问题 3：缺少 `@nestjs/testing` → `npm install --save-dev @nestjs/testing`
4. **注意**：`__tests__/` 和服务目录下有重复的测试文件（`health.test.ts` 和 `health.service.test.ts`），建议删除 `__tests__/` 下的旧版本，保留服务目录下的版本

**提交**: `test(api): fix failing test cases and deduplicate test files`

---

## Task T4：验证前端测试 🟡

**位置**: `apps/web/src/stores/`

**操作**:
1. 运行 `cd apps/web && npx vitest --run`
2. 检查 3 个文件是否通过：
   - `ai.store.test.ts`
   - `app.store.test.ts`
   - `auth.store.test.ts`
3. 如果报错 → 修复（mock localStorage、外部依赖等）
4. 如果通过 → 标记完成

**提交**: `test(web): verify and fix store tests`

---

## Task T5：更新 CI security-scan action 版本 🟢

**位置**: `.github/workflows/ci.yml`

**操作**:
1. 搜索 `github/codeql-action/upload-sarif@v2`
2. 替换为 `github/codeql-action/upload-sarif@v3`
3. 同时检查是否有其他 `@v2` 引用需要更新到 `@v3`

**提交**: `ci: upgrade codeql-action from v2 to v3`

---

## Task T6：本地 CI 全流程验证 🟢

**操作**（按顺序执行，全部通过才算完成）:

```bash
# Step 1: 前端 typecheck
cd apps/web && npx tsc --noEmit

# Step 2: 前端 build
cd apps/web && npm run build

# Step 3: 前端测试
cd apps/web && npx vitest --run

# Step 4: 后端 typecheck
cd apps/api && npx tsc --noEmit

# Step 5: 后端 build
cd apps/api && npm run build

# Step 6: 后端测试
cd apps/api && npx vitest --run
```

**如果某步失败**: 修复后重新运行该步，确认通过再继续。

**最终确认**:
- [ ] 前端 typecheck ✅
- [ ] 前端 build ✅
- [ ] 前端 test ✅
- [ ] 后端 typecheck ✅
- [ ] 后端 build ✅
- [ ] 后端 test ✅
- [ ] 全局搜索 `bg-white` 在 tsx 中接近 0 ✅

**完成后通知用户**，WorkBuddy 会做最终 review 和 push。

---

## 执行顺序

```
T1 (2h) → T2 (30min) → T3 (30min) → T4 (15min) → T5 (10min) → T6 (30min)
         ↓
    每完成一个 Task，独立 commit
         ↓
    全部完成后通知用户
```

**总预估**: ~4 小时

---

---

# Phase B：Creative Loop 状态机 + Muse Engine 卡片化

> **Created**: 2026-05-12 18:30
> **Prerequisite**: Phase A 全部完成（T1-T6 ✅）
> **预估时间**: ~8h
> **核心原则**: 先建状态机骨架，再改 UI，不改后端

---

## Task B-1：创建 Creative Loop 状态机 Store 🔴

**目标**: 新建 `creativeLoop.store.ts`，定义 7 阶段状态机。

**文件**: `apps/web/src/stores/creativeLoop.store.ts`

**状态机设计**（严格按此实现）:

```
Prime → Cloister → Divergence → Incubation → Convergence → Integration → Reflection
  ↑                                                                    │
  └────────────────────────── (循环) ───────────────────────────────────┘
```

**MVP 简化**: v0.1 只实现 **4 个阶段**，其余 3 个留到 v0.2：

| 阶段 | v0.1 | v0.2 | 说明 |
|------|------|------|------|
| Prime | ✅ | | 项目设定 |
| Cloister | ✅ | | 写作（当前主编辑器） |
| Divergence | ✅ | | AI 灵感发散（当前 Muse Engine） |
| Reflection | ✅ (轻量) | | 每次会话 3 个问题 |
| Incubation | | ✅ | |
| Convergence | | ✅ | |
| Integration | | ✅ | |

**Store 完整实现**:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LoopStage = 'prime' | 'cloister' | 'divergence' | 'reflection';
// v0.2 扩展: 'incubation' | 'convergence' | 'integration'

interface StageConfig {
  id: LoopStage;
  label: string;
  description: string;
  icon: string; // lucide icon name
  aiMode: 'silent' | 'suggest' | 'evaluate' | 'reflect';
}

export const STAGE_CONFIG: Record<LoopStage, StageConfig> = {
  prime: {
    id: 'prime',
    label: 'Prime',
    description: 'Define your intent, constraints, and creative direction.',
    icon: 'Compass',
    aiMode: 'suggest',
  },
  cloister: {
    id: 'cloister',
    label: 'The Cloister',
    description: 'Deep writing with minimal distraction. AI stays silent.',
    icon: 'PenTool',
    aiMode: 'silent',
  },
  divergence: {
    id: 'divergence',
    label: 'Divergence',
    description: 'Explore contrasting ideas. AI generates divergent directions.',
    icon: 'Sparkles',
    aiMode: 'suggest',
  },
  reflection: {
    id: 'reflection',
    label: 'Reflection',
    description: 'Review what you created, abandoned, and where to go next.',
    icon: 'BookOpen',
    aiMode: 'reflect',
  },
};

const STAGE_ORDER: LoopStage[] = ['prime', 'cloister', 'divergence', 'reflection'];

interface IdeaCard {
  id: string;
  content: string;
  category: 'conflict' | 'symbolic' | 'structural' | 'character' | 'worldview';
  rationale: string; // "Why this differs from the current direction"
  isKept: boolean | null; // null = undecided
  createdAt: Date;
}

interface ReflectionEntry {
  id: string;
  progressed: string;   // "今天推进了什么"
  abandoned: string;    // "放弃了什么"
  nextEntry: string;    // "下一次从哪里重新进入"
  createdAt: Date;
}

interface CreativeLoopState {
  // Current stage
  currentStage: LoopStage;
  stageHistory: { stage: LoopStage; enteredAt: Date; exitedAt: Date | null }[];

  // Prime stage data
  primeBrief: {
    intent: string;
    constraints: string[];
    references: string[];
  };

  // Divergence stage data
  ideaCards: IdeaCard[];

  // Reflection stage data
  reflections: ReflectionEntry[];

  // Session tracking
  sessionStartTime: Date | null;
  stageEnterCount: Record<LoopStage, number>;

  // Actions
  setStage: (stage: LoopStage) => void;
  nextStage: () => void;
  previousStage: () => void;

  // Prime actions
  updatePrimeBrief: (brief: Partial<CreativeLoopState['primeBrief']>) => void;

  // Divergence actions
  addIdeaCard: (card: Omit<IdeaCard, 'id' | 'createdAt' | 'isKept'>) => void;
  updateIdeaCard: (id: string, updates: Partial<IdeaCard>) => void;
  removeIdeaCard: (id: string) => void;
  clearIdeaCards: () => void;

  // Reflection actions
  addReflection: (entry: Omit<ReflectionEntry, 'id' | 'createdAt'>) => void;

  // Session
  startSession: () => void;
}

export const useCreativeLoopStore = create<CreativeLoopState>()(
  persist(
    (set, get) => ({
      currentStage: 'cloister', // Default: start in writing mode
      stageHistory: [],

      primeBrief: {
        intent: '',
        constraints: [],
        references: [],
      },

      ideaCards: [],

      reflections: [],

      sessionStartTime: null,
      stageEnterCount: {
        prime: 0,
        cloister: 0,
        divergence: 0,
        reflection: 0,
      },

      setStage: (stage) => set((state) => {
        // Close current stage in history
        const updatedHistory = state.stageHistory.map((h, i) =>
          i === state.stageHistory.length - 1 && !h.exitedAt
            ? { ...h, exitedAt: new Date() }
            : h
        );
        return {
          currentStage: stage,
          stageHistory: [
            ...updatedHistory,
            { stage, enteredAt: new Date(), exitedAt: null },
          ],
          stageEnterCount: {
            ...state.stageEnterCount,
            [stage]: state.stageEnterCount[stage] + 1,
          },
        };
      }),

      nextStage: () => set((state) => {
        const currentIndex = STAGE_ORDER.indexOf(state.currentStage);
        const nextIndex = (currentIndex + 1) % STAGE_ORDER.length;
        return {
          currentStage: STAGE_ORDER[nextIndex],
          stageHistory: [
            ...state.stageHistory.map((h, i) =>
              i === state.stageHistory.length - 1 && !h.exitedAt
                ? { ...h, exitedAt: new Date() }
                : h
            ),
            { stage: STAGE_ORDER[nextIndex], enteredAt: new Date(), exitedAt: null },
          ],
          stageEnterCount: {
            ...state.stageEnterCount,
            [STAGE_ORDER[nextIndex]]: state.stageEnterCount[STAGE_ORDER[nextIndex]] + 1,
          },
        };
      }),

      previousStage: () => set((state) => {
        const currentIndex = STAGE_ORDER.indexOf(state.currentStage);
        const prevIndex = currentIndex <= 0 ? STAGE_ORDER.length - 1 : currentIndex - 1;
        return {
          currentStage: STAGE_ORDER[prevIndex],
          stageHistory: [
            ...state.stageHistory.map((h, i) =>
              i === state.stageHistory.length - 1 && !h.exitedAt
                ? { ...h, exitedAt: new Date() }
                : h
            ),
            { stage: STAGE_ORDER[prevIndex], enteredAt: new Date(), exitedAt: null },
          ],
        };
      }),

      updatePrimeBrief: (brief) => set((state) => ({
        primeBrief: { ...state.primeBrief, ...brief },
      })),

      addIdeaCard: (card) => set((state) => ({
        ideaCards: [
          ...state.ideaCards,
          {
            ...card,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            isKept: null,
          },
        ],
      })),

      updateIdeaCard: (id, updates) => set((state) => ({
        ideaCards: state.ideaCards.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      })),

      removeIdeaCard: (id) => set((state) => ({
        ideaCards: state.ideaCards.filter((c) => c.id !== id),
      })),

      clearIdeaCards: () => set({ ideaCards: [] }),

      addReflection: (entry) => set((state) => ({
        reflections: [
          ...state.reflections,
          {
            ...entry,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          },
        ],
      })),

      startSession: () => set({
        sessionStartTime: new Date(),
        stageHistory: [{ stage: 'cloister', enteredAt: new Date(), exitedAt: null }],
        stageEnterCount: { prime: 0, cloister: 1, divergence: 0, reflection: 0 },
      }),
    }),
    {
      name: 'muserock-creative-loop',
      partialize: (state) => ({
        currentStage: state.currentStage,
        primeBrief: state.primeBrief,
        ideaCards: state.ideaCards,
        reflections: state.reflections,
      }),
    }
  )
);
```

**同时更新 barrel export**:

文件: `apps/web/src/stores/index.ts`

```typescript
export { useAuthStore } from './auth.store';
export { useAppStore } from './app.store';
export { useAIStore } from './ai.store';
export { useCreativeLoopStore, STAGE_CONFIG } from './creativeLoop.store';
export type { LoopStage, IdeaCard, ReflectionEntry } from './creativeLoop.store';
```

**创建测试文件**: `apps/web/src/stores/creativeLoop.store.test.ts`

测试用例（至少覆盖以下）:
- 初始化默认值为 `cloister`
- `setStage` 更新 `currentStage` 和 `stageHistory`
- `nextStage` 按序循环（cloister → divergence → reflection → prime → cloister）
- `previousStage` 逆序循环
- `addIdeaCard` 添加卡片并生成 id
- `updateIdeaCard` 更新指定卡片
- `removeIdeaCard` 删除指定卡片
- `addReflection` 添加反思条目
- `updatePrimeBrief` 部分更新

**提交**: `feat(loop): add Creative Loop state machine store with 4-stage MVP`

---

## Task B-2：添加阶段指示器到 UI 🔴

**目标**: 在 App.tsx 的 RailNav 中添加阶段指示器，并让阶段切换驱动 UI 变化。

**文件**: `apps/web/src/App.tsx`

### 步骤 1：在 App.tsx 中引入 store

在现有 import 区域添加:
```typescript
import { useCreativeLoopStore, STAGE_CONFIG } from './stores/creativeLoop.store';
import type { LoopStage } from './stores/creativeLoop.store';
```

在组件内添加:
```typescript
const { currentStage, setStage, nextStage } = useCreativeLoopStore();
```

### 步骤 2：替换 `activeTab` 逻辑

**当前逻辑**（L327-347）:
```typescript
activeTab === 'write' → 显示编辑器
activeTab === 'search' → 显示 Muse Engine
```

**改为**:
```typescript
currentStage === 'cloister' → 显示编辑器（AI 沉默）
currentStage === 'divergence' → 显示 Muse Engine（AI 建议模式）
currentStage === 'prime' → 显示 Prime Brief 面板（新组件）
currentStage === 'reflection' → 显示 Reflection 面板（新组件）
```

### 步骤 3：替换 RailNav 中的导航项

**当前**（L326-348）:
```tsx
<RailItem icon={<PenTool />} active={state.activeTab === 'write'} onClick={() => setState(...)} label="Workspace" />
<RailItem icon={<Search />} active={state.activeTab === 'search'} onClick={() => setState(...)} label="Assets" />
```

**改为**:
```tsx
{Object.values(STAGE_CONFIG).map((stage) => (
  <RailItem
    key={stage.id}
    icon={getStageIcon(stage.icon)}
    active={currentStage === stage.id}
    onClick={() => setStage(stage.id)}
    label={stage.label}
  />
))}
```

需要添加 `getStageIcon` 辅助函数:
```typescript
import { Compass, BookOpen } from 'lucide-react';
// PenTool 和 Sparkles 已经 import

const getStageIcon = (iconName: string) => {
  switch (iconName) {
    case 'Compass': return <Compass size={20} />;
    case 'PenTool': return <PenTool size={20} />;
    case 'Sparkles': return <Sparkles size={20} />;
    case 'BookOpen': return <BookOpen size={20} />;
    default: return <Sparkles size={20} />;
  }
};
```

### 步骤 4：条件渲染 Muse Engine 面板

**当前**（L471）:
```tsx
{state.activeTab !== 'write' && (
  <motion.aside> ... Muse Engine ... </motion.aside>
)}
```

**改为**:
```tsx
{(currentStage === 'divergence') && (
  <motion.aside> ... Muse Engine ... </motion.aside>
)}
```

### 步骤 5：在 main 区域底部添加阶段进度条

在 `<main>` 结束前添加:
```tsx
{/* Creative Loop Stage Indicator */}
<div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-border">
  <motion.div
    className="h-full bg-brand-black"
    initial={false}
    animate={{
      width: `${((STAGE_ORDER.indexOf(currentStage) + 1) / STAGE_ORDER.length) * 100}%`,
    }}
    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
  />
</div>
<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
  {STAGE_ORDER.map((stage, i) => (
    <button
      key={stage}
      onClick={() => setStage(stage)}
      className={`w-2 h-2 rounded-full transition-all ${
        currentStage === stage
          ? 'bg-brand-black scale-125'
          : i < STAGE_ORDER.indexOf(currentStage)
            ? 'bg-brand-black/40'
            : 'bg-brand-border'
      }`}
      title={STAGE_CONFIG[stage].label}
    />
  ))}
</div>
```

需要在文件顶部添加 `STAGE_ORDER`:
```typescript
const STAGE_ORDER: LoopStage[] = ['prime', 'cloister', 'divergence', 'reflection'];
```

**提交**: `feat(loop): integrate stage indicator into RailNav and conditionally render UI by stage`

---

## Task B-3：创建 Prime Brief 面板组件 🟡

**目标**: 当 `currentStage === 'prime'` 时，在 main 区域显示项目设定面板。

**文件**: `apps/web/src/components/stages/PrimeBrief.tsx`

```typescript
import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, X, Link as LinkIcon } from 'lucide-react';
import { useCreativeLoopStore } from '../../stores/creativeLoop.store';

export default function PrimeBrief() {
  const { primeBrief, updatePrimeBrief, setStage } = useCreativeLoopStore();
  const [newConstraint, setNewConstraint] = useState('');
  const [newReference, setNewReference] = useState('');

  const addConstraint = () => {
    if (newConstraint.trim()) {
      updatePrimeBrief({ constraints: [...primeBrief.constraints, newConstraint.trim()] });
      setNewConstraint('');
    }
  };

  const addReference = () => {
    if (newReference.trim()) {
      updatePrimeBrief({ references: [...primeBrief.references, newReference.trim()] });
      setNewReference('');
    }
  };

  const removeConstraint = (index: number) => {
    updatePrimeBrief({ constraints: primeBrief.constraints.filter((_, i) => i !== index) });
  };

  const removeReference = (index: number) => {
    updatePrimeBrief({ references: primeBrief.references.filter((_, i) => i !== index) });
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand-black/30 font-black mb-3 leading-none">
          Stage: Prime
        </p>
        <h1 className="text-4xl lg:text-5xl font-serif italic font-light tracking-tight">
          Define Your Creative Intent
        </h1>
      </div>

      <div className="space-y-12 flex-1">
        {/* Intent */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-4">
            What are you trying to create?
          </label>
          <textarea
            value={primeBrief.intent}
            onChange={(e) => updatePrimeBrief({ intent: e.target.value })}
            placeholder="A noir detective story set in a city where memories can be traded like currency..."
            className="w-full h-32 bg-transparent text-lg font-serif text-brand-black/90 placeholder-brand-black/10 resize-none outline-none border-b border-brand-border pb-4 focus:border-brand-black transition-colors"
          />
        </div>

        {/* Constraints */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-4">
            Constraints & Boundaries
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {primeBrief.constraints.map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-paper border border-brand-border rounded-full text-sm text-brand-black/70"
              >
                {c}
                <button onClick={() => removeConstraint(i)} className="text-brand-black/30 hover:text-brand-black">
                  <X size={14} />
                </button>
              </motion.span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newConstraint}
              onChange={(e) => setNewConstraint(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addConstraint()}
              placeholder="Add a constraint..."
              className="flex-1 px-4 py-3 bg-transparent border border-brand-border rounded-xl text-sm outline-none focus:border-brand-black transition-colors"
            />
            <button onClick={addConstraint} className="p-3 border border-brand-border rounded-xl hover:border-brand-black hover:bg-brand-paper transition-all">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* References */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-4">
            References & Seeds
          </label>
          <div className="space-y-2 mb-3">
            {primeBrief.references.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-brand-paper border border-brand-border rounded-xl">
                <LinkIcon size={14} className="text-brand-black/30" />
                <span className="flex-1 text-sm text-brand-black/70 truncate">{r}</span>
                <button onClick={() => removeReference(i)} className="text-brand-black/30 hover:text-brand-black">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newReference}
              onChange={(e) => setNewReference(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addReference()}
              placeholder="Add a reference link or note..."
              className="flex-1 px-4 py-3 bg-transparent border border-brand-border rounded-xl text-sm outline-none focus:border-brand-black transition-colors"
            />
            <button onClick={addReference} className="p-3 border border-brand-border rounded-xl hover:border-brand-black hover:bg-brand-paper transition-all">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-8 flex justify-end">
        <button
          onClick={() => setStage('cloister')}
          className="px-8 py-4 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all shadow-md"
        >
          Enter The Cloister →
        </button>
      </div>
    </div>
  );
}
```

**在 App.tsx 中使用**:

在 main 区域的 return 中，根据 `currentStage` 条件渲染:

```tsx
{/* Inside <main> */}
{currentStage === 'prime' && <PrimeBrief />}
{currentStage === 'cloister' && (
  <>
    {/* 现有的 header + editor section */}
  </>
)}
{currentStage === 'divergence' && (
  <>
    {/* 现有的 header + editor section（保留编辑器可见，右侧显示 Muse Engine） */}
  </>
)}
{currentStage === 'reflection' && <ReflectionPanel />}
```

**不要删除现有的编辑器和 Muse Engine 代码**，只是用条件包裹。

**提交**: `feat(loop): add PrimeBrief stage component with intent/constraints/references`

---

## Task B-4：创建 Reflection 面板组件 🟡

**目标**: 轻量版反思面板，每次会话结束 3 个问题。

**文件**: `apps/web/src/components/stages/ReflectionPanel.tsx`

```typescript
import { useState } from 'react';
import { motion } from 'motion/react';
import { useCreativeLoopStore } from '../../stores/creativeLoop.store';

export default function ReflectionPanel() {
  const { addReflection, setStage, reflections } = useCreativeLoopStore();
  const [progressed, setProgressed] = useState('');
  const [abandoned, setAbandoned] = useState('');
  const [nextEntry, setNextEntry] = useState('');

  const handleSubmit = () => {
    if (!progressed.trim() && !abandoned.trim() && !nextEntry.trim()) return;
    addReflection({ progressed, abandoned, nextEntry });
    setProgressed('');
    setAbandoned('');
    setNextEntry('');
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand-black/30 font-black mb-3 leading-none">
          Stage: Reflection
        </p>
        <h1 className="text-4xl lg:text-5xl font-serif italic font-light tracking-tight">
          Session Reflection
        </h1>
        <p className="text-sm text-brand-black/40 mt-4 font-serif italic">
          Three questions to close your creative loop.
        </p>
      </div>

      <div className="space-y-10 flex-1">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-3">
            What did you progress today?
          </label>
          <textarea
            value={progressed}
            onChange={(e) => setProgressed(e.target.value)}
            placeholder="Finished Chapter 3, resolved the protagonist's motivation..."
            className="w-full h-24 bg-transparent text-base font-serif text-brand-black/90 placeholder-brand-black/10 resize-none outline-none border-b border-brand-border pb-3 focus:border-brand-black transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-3">
            What did you abandon or defer?
          </label>
          <textarea
            value={abandoned}
            onChange={(e) => setAbandoned(e.target.value)}
            placeholder="Dropped the subplot about the underground market..."
            className="w-full h-24 bg-transparent text-base font-serif text-brand-black/90 placeholder-brand-black/10 resize-none outline-none border-b border-brand-border pb-3 focus:border-brand-black transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-3">
            Where do you pick up next time?
          </label>
          <textarea
            value={nextEntry}
            onChange={(e) => setNextEntry(e.target.value)}
            placeholder="Start with the confrontation scene in Chapter 4..."
            className="w-full h-24 bg-transparent text-base font-serif text-brand-black/90 placeholder-brand-black/10 resize-none outline-none border-b border-brand-border pb-3 focus:border-brand-black transition-colors"
          />
        </div>

        {/* Past reflections */}
        {reflections.length > 0 && (
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/30 block mb-4">
              Past Reflections
            </label>
            <div className="space-y-4 max-h-64 overflow-y-auto transparent-scrollbar">
              {reflections.slice(-5).reverse().map((r) => (
                <div key={r.id} className="p-4 bg-brand-paper border border-brand-border rounded-xl">
                  <p className="text-[10px] text-brand-black/30 mb-2">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  {r.progressed && <p className="text-sm text-brand-black/70 mb-1">→ {r.progressed}</p>}
                  {r.abandoned && <p className="text-sm text-brand-black/40 mb-1">✕ {r.abandoned}</p>}
                  {r.nextEntry && <p className="text-sm text-brand-black/50 italic">⟶ {r.nextEntry}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="py-8 flex justify-between">
        <button
          onClick={() => setStage('prime')}
          className="px-8 py-4 border border-brand-black rounded-full text-[10px] uppercase tracking-widest font-black hover:bg-brand-black hover:text-white transition-all"
        >
          ← New Session
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-4 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all shadow-md"
        >
          Save Reflection
        </button>
      </div>
    </div>
  );
}
```

**提交**: `feat(loop): add ReflectionPanel stage component with 3-question format`

---

## Task B-5：升级 Muse Engine 为对比性 Idea Cards 🟡

**目标**: Divergence 阶段的 Muse Engine 不再返回纯文本，而是生成 3-5 张对比性 idea cards。

**文件**: `apps/web/src/components/stages/DivergenceCards.tsx`

**UI 设计**: 替换 Muse Engine 面板中的纯文本结果为卡片网格。

```typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, X, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { useCreativeLoopStore, type IdeaCard } from '../../stores/creativeLoop.store';
import ReactMarkdown from 'react-markdown';

const CARD_CATEGORIES = [
  { id: 'conflict', label: 'Conflict', color: 'from-red-500 to-orange-500' },
  { id: 'symbolic', label: 'Symbolic', color: 'from-violet-500 to-purple-500' },
  { id: 'structural', label: 'Structural', color: 'from-blue-500 to-cyan-500' },
  { id: 'character', label: 'Character', color: 'from-emerald-500 to-green-500' },
  { id: 'worldview', label: 'Worldview', color: 'from-amber-500 to-yellow-500' },
] as const;

interface DivergenceCardsProps {
  editorContent: string;
  onGenerate: (content: string) => Promise<string>;
  isLoading: boolean;
}

export default function DivergenceCards({ editorContent, onGenerate, isLoading }: DivergenceCardsProps) {
  const { ideaCards, addIdeaCard, updateIdeaCard, clearIdeaCards } = useCreativeLoopStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!editorContent.trim()) return;
    try {
      const result = await onGenerate(editorContent);
      // Parse AI response into idea cards
      // The AI should return JSON: [{content, category, rationale}, ...]
      // Fallback: if not JSON, create a single "inspiration" card
      try {
        const cards = JSON.parse(result);
        cards.forEach((card: any) => {
          addIdeaCard({
            content: card.content || card,
            category: card.category || 'conflict',
            rationale: card.rationale || '',
          });
        });
      } catch {
        // Not JSON, add as single card
        addIdeaCard({
          content: result,
          category: 'conflict',
          rationale: 'AI-generated inspiration',
        });
      }
    } catch (err) {
      console.error('Divergence generation failed:', err);
    }
  };

  const filteredCards = selectedCategory === 'all'
    ? ideaCards
    : ideaCards.filter((c) => c.category === selectedCategory);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-brand-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-black/30">Divergence Engine</h2>
            <p className="text-xs text-brand-black/40 mt-1 font-serif italic">Generate contrasting directions, not generic suggestions.</p>
          </div>
          <div className="flex items-center gap-2">
            {ideaCards.length > 0 && (
              <button
                onClick={clearIdeaCards}
                className="text-[10px] font-black uppercase tracking-widest text-brand-black/30 hover:text-brand-black transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-black text-white'
                : 'border border-brand-border text-brand-black/50 hover:border-brand-black/30'
            }`}
          >
            All ({ideaCards.length})
          </button>
          {CARD_CATEGORIES.map((cat) => {
            const count = ideaCards.filter((c) => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-black text-white'
                    : 'border border-brand-border text-brand-black/50 hover:border-brand-black/30'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-y-auto p-6 transparent-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
            <Loader2 size={32} className="animate-spin text-brand-black" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Generating divergent ideas...</p>
          </div>
        ) : filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {filteredCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-brand-border rounded-xl p-5 bg-brand-paper hover:border-brand-black/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${CARD_CATEGORIES.find(c => c.id === card.category)?.color || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                        <Sparkles size={12} className="text-white" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-black/40">
                        {card.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => updateIdeaCard(card.id, { isKept: true })}
                        className={`p-1.5 rounded-full transition-colors ${card.isKept === true ? 'bg-green-500 text-white' : 'hover:bg-green-100 text-brand-black/30 hover:text-green-500'}`}
                        title="Keep this idea"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => updateIdeaCard(card.id, { isKept: false })}
                        className={`p-1.5 rounded-full transition-colors ${card.isKept === false ? 'bg-red-500 text-white' : 'hover:bg-red-100 text-brand-black/30 hover:text-red-500'}`}
                        title="Discard this idea"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-brand-black/80 leading-relaxed prose prose-sm max-w-none">
                    {expandedCard === card.id
                      ? <ReactMarkdown>{card.content}</ReactMarkdown>
                      : <p className="line-clamp-3">{card.content}</p>
                    }
                  </div>
                  {card.content.length > 200 && (
                    <button
                      onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                      className="text-[10px] font-black uppercase tracking-widest text-brand-black/30 hover:text-brand-black mt-2 transition-colors"
                    >
                      {expandedCard === card.id ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                  {card.rationale && (
                    <div className="mt-3 pt-3 border-t border-brand-border">
                      <p className="text-[10px] text-brand-black/40 italic font-serif">
                        Why this differs: {card.rationale}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <Sparkles size={64} strokeWidth={0.5} />
            <p className="text-[10px] uppercase tracking-[0.4em] mt-6 font-black italic">
              Generate divergent ideas
            </p>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="p-6 border-t border-brand-border">
        <button
          onClick={handleGenerate}
          disabled={isLoading || !editorContent.trim()}
          className="w-full py-4 bg-brand-black text-white rounded-xl text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Generate Divergent Ideas
        </button>
      </div>
    </div>
  );
}
```

**集成到 App.tsx**: 当 `currentStage === 'divergence'` 时，右侧面板用 `DivergenceCards` 替代当前的 Muse Engine 纯文本结果。

**提交**: `feat(loop): add DivergenceCards component for contrastive idea generation`

---

## Task B-6：端到端验证 + 文件清理 🟡

**操作**:

1. 运行 `cd apps/web && npx tsc --noEmit` — 确认 0 errors
2. 运行 `cd apps/web && npm run build` — 确认构建成功
3. 运行 `cd apps/web && npx vitest --run` — 确认所有 store 测试通过（包括新的 creativeLoop.store.test.ts）
4. 检查 `components/stages/` 目录结构:
   ```
   apps/web/src/components/stages/
     PrimeBrief.tsx
     ReflectionPanel.tsx
     DivergenceCards.tsx
   ```
5. 检查 `stores/` 目录结构:
   ```
   apps/web/src/stores/
     creativeLoop.store.ts        ← 新增
     creativeLoop.store.test.ts   ← 新增
     index.ts                      ← 更新
     ai.store.ts
     ai.store.test.ts
     app.store.ts
     app.store.test.ts
     auth.store.ts
     auth.store.test.ts
     themeStore.ts
   ```

**提交**: `test(loop): add creative loop store tests and verify end-to-end build`

---

## 执行顺序

```
B-1 (2h) → B-2 (1.5h) → B-3 (1h) → B-4 (1h) → B-5 (1.5h) → B-6 (1h)
    ↓
  每完成一个 Task，独立 commit
    ↓
  全部完成后通知用户
```

**总预估**: ~8 小时

---

## 重要约束

1. **不改后端** — 所有改动仅限 `apps/web/src/`
2. **不拆分 App.tsx** — 只在 App.tsx 内加条件渲染，不提取子组件（Phase A 明确排除的 App.tsx 拆分暂不做）
3. **保持现有功能** — Muse Engine 的 AI 调用、Settings、Export、Auth 全部保留，只是根据阶段条件显示/隐藏
4. **4 阶段 MVP** — Prime / Cloister / Divergence / Reflection，其余 3 阶段留到 v0.2
5. **暗色主题** — 所有新组件必须使用语义化 token（`bg-brand-paper`, `text-brand-black`, `border-brand-border`），绝对禁止 `bg-white`
6. **动画** — 使用 `motion/react`（已安装），保持和现有组件一致的 spring 动画风格

---

## 不在本轮做的事

- ❌ PostgreSQL/pgvector 持久化
- ❌ Incubation / Convergence / Integration 阶段（v0.2）
- ❌ App.tsx 拆分重构
- ❌ README 重写（Phase C）

---

# Phase C：Landing Page + GitHub Pages 部署 + DivergenceCards 修复

> **Created**: 2026-05-13 12:16
> **Prerequisite**: Phase B 全部完成（B-1 ～ B-5 ✅）
> **预估时间**: ~5h
> **核心目标**: 项目能被外部访问（GitHub Pages），有一个有说服力的 Landing Page

---

## 审计发现的 Bug（先修）

在开始 Landing Page 之前，先修以下 3 个已知问题：

### 预处理 C-0：修复 DivergenceCards 暗色主题硬编码

**文件**: `apps/web/src/components/stages/DivergenceCards.tsx`

**问题**: `getCategoryColor` 函数返回硬编码浅色背景（暗色主题下露白）：
```typescript
// 当前错误代码
character: 'border-amber-400 bg-amber-50',
conflict: 'border-red-400 bg-red-50',
symbolic: 'border-purple-400 bg-purple-50',
structural: 'border-blue-400 bg-blue-50',
worldview: 'border-green-400 bg-green-50',
// 以及 fallback: 'border-gray-400 bg-gray-50'
```

**修复方案**：改为透明背景 + 带透明度的颜色边框，保持 token 兼容：
```typescript
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    character: 'border-amber-400/60 bg-amber-400/5',
    conflict:  'border-red-400/60 bg-red-400/5',
    symbolic:  'border-purple-400/60 bg-purple-400/5',
    structural:'border-blue-400/60 bg-blue-400/5',
    worldview: 'border-green-400/60 bg-green-400/5',
  };
  return colors[category] || 'border-brand-border bg-brand-paper/50';
};
```

**同时修复**: L537 的废弃逻辑（在 App.tsx 中）：
```tsx
// 找到这行：
placeholder={state.activeTab === 'search' ? "Ask for assets..." : "Prompt for inspiration..."}

// 改为：
placeholder="Prompt for divergent ideas..."
```

**提交**: `fix(ui): fix DivergenceCards dark mode colors and stale activeTab ref`

---

## Task C-1：创建 Landing Page 🔴

**目标**: 创建 `apps/web/src/pages/LandingPage.tsx`，实现完整的对外展示页。

**核心原则**:
- 只用语义化 token（`bg-brand-paper`, `text-brand-black` 等），支持暗/亮主题
- 不引入任何新的依赖
- Hash Router: `/` = Landing, `/#/app` = 主应用

### 步骤 1：安装 react-router-dom（如未安装）

```bash
cd apps/web && npm list react-router-dom 2>/dev/null || npm install react-router-dom
```

### 步骤 2：修改 main.tsx 支持路由

**文件**: `apps/web/src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import LandingPage from './pages/LandingPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<App />} />
        <Route path="/app/*" element={<App />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
```

### 步骤 3：创建 LandingPage 组件

**文件**: `apps/web/src/pages/LandingPage.tsx`

完整实现如下：

```typescript
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { PenTool, Sparkles, Compass, BookOpen, Github, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import logo from '../assets/logo.png';

const STAGES = [
  {
    icon: Compass,
    label: 'Prime',
    description: 'Set your creative intent, constraints, and references before you begin.',
  },
  {
    icon: PenTool,
    label: 'The Cloister',
    description: 'Deep, distraction-free writing. AI stays silent until you need it.',
  },
  {
    icon: Sparkles,
    label: 'Divergence',
    description: 'Explore contrasting directions. AI generates idea cards, not generic suggestions.',
  },
  {
    icon: BookOpen,
    label: 'Reflection',
    description: 'Close your session with intention. Log what progressed, what was abandoned.',
  },
];

const FEATURES = [
  {
    title: 'Local-first, Cloud-optional',
    description: 'Your writing never leaves your device unless you choose. API keys are AES-256 encrypted when stored in the cloud.',
  },
  {
    title: 'Multi-provider AI',
    description: 'Works with Gemini, OpenAI, and Anthropic. Bring your own key, or connect via our secure proxy.',
  },
  {
    title: 'Export Anywhere',
    description: 'Export to Markdown, Word (.docx), or PDF. Your work, your format.',
  },
  {
    title: 'Open Source',
    description: 'GPL-3.0 licensed. Inspect the code, fork it, run it yourself.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="min-h-screen bg-brand-paper text-brand-black font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b border-brand-border bg-brand-paper/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <img src={logo} alt="MuseRock" className="w-7 h-7 rounded-lg object-cover" />
          <span className="text-sm font-black tracking-[0.1em] uppercase">MuseRock</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 hover:bg-brand-black/5 rounded-full transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a
            href="https://github.com/zbbsdsb/muserock"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-brand-black/5 rounded-full transition-colors"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <button
            onClick={() => navigate('/app')}
            className="px-5 py-2.5 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all"
          >
            Open App
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-black/30 mb-6">
            AI Creative Collaboration
          </p>
          <h1 className="text-5xl lg:text-7xl font-serif italic font-light tracking-tight leading-[1.1] mb-8">
            Write with intention.
            <br />
            <span className="text-brand-black/30">Not with noise.</span>
          </h1>
          <p className="text-xl text-brand-black/50 font-serif max-w-2xl leading-relaxed mb-12">
            MuseRock is a structured creative loop for writers, designers, and researchers.
            AI assists at the right moments — silent when you need focus, generative when you need divergence.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="px-8 py-4 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all shadow-lg"
            >
              Start Writing Free
            </button>
            <a
              href="https://github.com/zbbsdsb/muserock"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-brand-border rounded-full text-[10px] uppercase tracking-widest font-black hover:border-brand-black transition-all flex items-center gap-2"
            >
              <Github size={14} />
              View on GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* Creative Loop */}
      <section className="py-24 px-8 border-t border-brand-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-black/30 mb-4 text-center">
            The Creative Loop
          </p>
          <h2 className="text-3xl lg:text-4xl font-serif italic font-light tracking-tight text-center mb-16">
            Four stages. One coherent workflow.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STAGES.map((stage, i) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 border border-brand-border rounded-2xl hover:border-brand-black/30 transition-colors bg-brand-paper"
              >
                <div className="w-10 h-10 border border-brand-border rounded-full flex items-center justify-center mb-4">
                  <stage.icon size={18} className="text-brand-black/60" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-3">{stage.label}</h3>
                <p className="text-sm text-brand-black/50 font-serif leading-relaxed">{stage.description}</p>
              </motion.div>
            ))}
          </div>
          {/* Loop connector */}
          <p className="text-center mt-8 text-[10px] uppercase tracking-[0.3em] text-brand-black/20 font-black">
            Prime → Cloister → Divergence → Reflection → Prime...
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-8 border-t border-brand-border bg-brand-offwhite">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-black/30 mb-4 text-center">
            Built Different
          </p>
          <h2 className="text-3xl lg:text-4xl font-serif italic font-light tracking-tight text-center mb-16">
            No fluff. No dark patterns.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-4"
              >
                <div className="w-1 bg-brand-border rounded-full shrink-0" />
                <div>
                  <h3 className="text-sm font-black mb-2">{feature.title}</h3>
                  <p className="text-sm text-brand-black/50 font-serif leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-8 border-t border-brand-border text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-serif italic font-light tracking-tight mb-6">
            Your best work starts here.
          </h2>
          <p className="text-brand-black/40 font-serif mb-10 text-lg">
            Free. Open source. No account required to start.
          </p>
          <button
            onClick={() => navigate('/app')}
            className="px-10 py-5 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all shadow-xl"
          >
            Open MuseRock →
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-brand-border flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-brand-black/30">
        <span>MuseRock © 2026</span>
        <div className="flex items-center gap-6">
          <a href="https://github.com/zbbsdsb/muserock" target="_blank" rel="noopener noreferrer" className="hover:text-brand-black transition-colors">GitHub</a>
          <span>GPL-3.0</span>
        </div>
      </footer>
    </div>
  );
}
```

**提交**: `feat(landing): add LandingPage with hero, creative loop stages, features, and CTA`

---

## Task C-2：GitHub Pages 部署 Workflow 🔴

**目标**: 创建 `.github/workflows/deploy.yml`，每次 `main` 推送后自动构建并部署到 GitHub Pages。

**文件**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

env:
  NODE_VERSION: '20'

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: cd apps/web && npm install

      - name: Build
        run: cd apps/web && npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL || 'https://api.muserock.app' }}

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: apps/web/dist

  deploy:
    name: Deploy
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**同时修改 `apps/web/vite.config.ts`**，添加 `base` 配置使 GitHub Pages 路径正确：

打开 `apps/web/vite.config.ts`，检查是否有 `base` 字段。如果没有，在 `defineConfig({` 内添加：

```typescript
base: process.env.VITE_BASE_URL || '/',
```

> **注意**: GitHub Pages 如果部署在 `username.github.io/muserock/` 下需要 `base: '/muserock/'`。
> 如果使用自定义域名或 `username.github.io`（根域），`base: '/'` 即可。
> 先用 `'/'` 测试，如果资源 404 再改为 `'/muserock/'`。

**提交**: `ci(deploy): add GitHub Pages deploy workflow`

---

## Task C-3：在 GitHub 仓库设置中启用 Pages

**这是手动操作，Trae 无法直接完成**，提醒用户：

1. 打开 `https://github.com/zbbsdsb/muserock/settings/pages`
2. **Source**: 选择 `GitHub Actions`（不是 Branch）
3. 保存
4. 推送代码后，Actions Tab 会看到 "Deploy to GitHub Pages" workflow 运行
5. 部署成功后访问 `https://zbbsdsb.github.io/muserock/`

---

## Task C-4：恢复 DivergenceCards AI 生成功能 🟡

**问题**: Trae 把 AI 驱动版本简化成了手动添加卡片，核心功能丢失。

**目标**: 在 DivergenceCards 底部添加 AI 生成按钮，连接现有的 AI 服务。

**文件**: `apps/web/src/components/stages/DivergenceCards.tsx`

在现有组件基础上，做以下改动：

### 步骤 1：接收 AI 生成回调

修改组件签名，接受可选的 AI 调用 prop：

```typescript
interface DivergenceCardsProps {
  onAIGenerate?: (content: string) => Promise<string>;
  editorContent?: string;
  isLoading?: boolean;
}

export default function DivergenceCards({
  onAIGenerate,
  editorContent = '',
  isLoading = false,
}: DivergenceCardsProps) {
```

### 步骤 2：在底部添加 AI 生成按钮（替换当前 Commit 按钮区域）

替换 L126-141（当前的 footer 区域）为：

```tsx
<div className="mt-4 pt-4 border-t border-brand-border">
  <div className="flex items-center justify-between mb-3">
    <span className="text-[10px] text-brand-black/30">
      {ideaCards.length} cards · {ideaCards.filter((c) => c.isKept).length} kept
    </span>
    <button
      onClick={() => {
        ideaCards.forEach(c => removeIdeaCard(c.id));
      }}
      className="text-[10px] font-black uppercase tracking-widest text-brand-black/20 hover:text-brand-black/50 transition-colors"
    >
      Clear All
    </button>
  </div>

  {onAIGenerate && (
    <button
      onClick={async () => {
        if (!editorContent.trim() || isLoading) return;
        try {
          const result = await onAIGenerate(editorContent);
          // Try to parse as JSON array of cards
          try {
            const parsed = JSON.parse(result);
            if (Array.isArray(parsed)) {
              parsed.forEach((item: any) => {
                addIdeaCard({
                  content: item.content ?? item,
                  category: item.category ?? 'conflict',
                  rationale: item.rationale ?? '',
                });
              });
              return;
            }
          } catch {
            // Not JSON — add as single card
          }
          addIdeaCard({
            content: result,
            category: 'conflict',
            rationale: 'AI-generated',
          });
        } catch (err) {
          console.error('AI generation failed:', err);
        }
      }}
      disabled={isLoading || !editorContent.trim()}
      className="w-full py-3 bg-brand-black text-white rounded-xl text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          Generating...
        </>
      ) : (
        <>
          <Sparkles size={13} />
          Generate with AI
        </>
      )}
    </button>
  )}
</div>
```

### 步骤 3：在 App.tsx 中传递 AI 回调

找到 L550（`<DivergenceCards />`），修改为：

```tsx
<DivergenceCards
  editorContent={state.content}
  onAIGenerate={async (content) => {
    const service = createAIService(state);
    return service.generateInspiration(
      `Based on this writing, generate 4 divergent creative directions as a JSON array.
Each item: { "content": "...", "category": "conflict|symbolic|structural|character|worldview", "rationale": "why this differs" }.
Writing context:\n${content.slice(0, 1000)}`
    );
  }}
  isLoading={state.isLoading}
/>
```

**提交**: `feat(divergence): restore AI generation in DivergenceCards with JSON card parsing`

---

## Task C-5：端到端验证 + README 更新 🟡

### 步骤 1：验证构建

```bash
cd apps/web && npx tsc --noEmit    # 0 errors
cd apps/web && npm run build       # 构建成功
cd apps/web && npm run test        # 所有测试通过
```

### 步骤 2：本地验证路由

```bash
cd apps/web && npm run preview
```

打开 `http://localhost:4173/` — 应该看到 Landing Page
打开 `http://localhost:4173/#/app` — 应该看到主应用

### 步骤 3：更新 README.md

**文件**: `README.md`

在 README 顶部（badge 区域之后）添加：

```markdown
## Live Demo

> 🌐 **[muserock.app](https://zbbsdsb.github.io/muserock/)** — Try it in your browser

No account required. Bring your own API key (Gemini, OpenAI, or Anthropic) or use Local mode.
```

**提交**: `docs: update README with live demo link and verify build passes`

---

## 执行顺序

```
C-0（Bug 修复，15min）
    ↓
C-1（Landing Page，2h）
    ↓
C-2（Deploy Workflow，20min）
    ↓
C-3（手动在 GitHub 设置 Pages，5min）
    ↓
C-4（DivergenceCards AI，45min）
    ↓
C-5（验证 + README，30min）
```

**总预估**: ~4h

---

## 完成标准

Phase C 完成后，MuseRock MVP 应满足：

- [ ] `https://zbbsdsb.github.io/muserock/` 可访问，显示 Landing Page
- [ ] Landing Page 有 "Open App" 按钮，点击进入主应用
- [ ] 主应用 4 个阶段均可切换
- [ ] DivergenceCards 有 AI 生成按钮，配置 API Key 后可使用
- [ ] 暗色主题无白底残留
- [ ] TypeScript 0 errors，测试全过

---

## 不在本轮做的事

- ❌ PostgreSQL/pgvector 持久化
- ❌ Incubation / Convergence / Integration 阶段（v0.2）
- ❌ App.tsx 拆分重构
- ❌ README 全面重写（仅添加 Live Demo 链接）
- ❌ Astro 官网（Phase D）
