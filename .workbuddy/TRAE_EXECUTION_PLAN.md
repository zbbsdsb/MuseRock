# MuseRock MVP 冲刺计划 v3 — Trae 专版

> **Created**: 2026-05-12 14:15
> **Principle**: Trae 做所有执行工作，WorkBuddy 只做最终验收。每个 Task 独立提交。
> **策略**: 省 WorkBuddy credit = 把详细指令、代码示例、文件路径全部写在这里，Trae 按文档执行无需额外沟通。

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

## 不在本轮做的事

- ❌ PostgreSQL/pgvector 持久化
- ❌ InspirationMap / MotivationGarden
- ❌ BullMQ / Temporal
- ❌ 真实 OWASP 扫描
- ❌ App.tsx 拆分重构
- ❌ 添加新的测试用例（只修复现有的）
