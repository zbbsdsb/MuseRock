# MuseRock MVP Sprint Plan Spec

## Why

MuseRock 项目核心功能已完成约 70%，但存在影响 MVP 验收的关键 Bug（P0）、重要改进项（P1）和缺失的核心功能（P2）。需要制定系统性冲刺计划，确保在最短时间内达到 MVP 验收标准。

## What Changes

本次冲刺包含四个阶段：

### Phase A: Critical Bug Fixes (~2h)
- 修复 `export.ts` 中 `require('docx')` 在 ESM 环境下的错误
- 修复 `index.css` 中暗色主题 opacity 污染子元素问题
- 删除 `vite.config.ts` 中 API Key 硬注入的安全风险

### Phase B: Backend Test Coverage (~2h)
- 添加 `health.test.ts` 健康检查测试
- 添加 `api-keys.service.test.ts` 加密逻辑测试
- 添加 `auth.service.test.ts` 会话管理测试
- 验证前端 store 测试全部通过

### Phase C: Dark Theme Completeness (~1h)
- 替换 78 处 `bg-white` 硬编码为语义化 `bg-brand-paper`
- 修复 `index.css` 中 `@import` 位置错误
- 手动验证全应用暗色模式

### Phase D: Creative Loop State Machine (~8h)
- 创建 `creativeLoop.store.ts` 状态机
- 集成阶段指示器到 RailNav
- 创建 Prime Brief 面板组件
- 创建 Reflection 面板组件
- 升级 Muse Engine 为 DivergenceCards

## Impact

- Affected specs: MVP 验收标准达成
- Affected code:
  - `apps/web/src/utils/export.ts`
  - `apps/web/src/index.css`
  - `apps/web/vite.config.ts`
  - `apps/api/src/` (测试文件)
  - `apps/web/src/stores/creativeLoop.store.ts`
  - `apps/web/src/components/stages/*.tsx`
  - `apps/web/src/App.tsx`

## MVP Acceptance Criteria

```
[ ] 1. 应用可正常打开，看到写作编辑器
[ ] 2. 输入文字可保存到 localStorage
[ ] 3. 可切换 AI 提供商（Gemini/OpenAI/Anthropic）
[ ] 4. 可导出为 Markdown / Word / PDF
[ ] 5. MuseDashboard 项目管理功能正常
[ ] 6. 亮/暗/系统主题切换无视觉错误
[ ] 7. Firebase Google 登录工作
[ ] 8. CI 全部步骤绿灯（typecheck + build + test）
```

## ADDED Requirements

### Requirement: Export Functionality
系统 SHALL 支持导出文档为 Markdown、Word（.docx）、PDF 三种格式，且在 ESM 环境下正常运行。

#### Scenario: Word Export
- **WHEN** 用户点击导出 Word 按钮
- **THEN** 文件正常下载，无 `require is not defined` 错误

### Requirement: Dark Theme Integrity
系统 SHALL 支持暗色主题切换，且背景透明度设置不影响子元素文字可见性。

#### Scenario: Dark Mode Hover
- **WHEN** 用户切换到暗色模式并 hover 侧边栏按钮
- **THEN** 按钮显示半透明浅色背景，文字保持不透明

### Requirement: Creative Loop State Machine
系统 SHALL 提供 4 阶段创作循环（Prime / Cloister / Divergence / Reflection），各阶段有独立的 UI 和数据存储。

#### Scenario: Stage Navigation
- **WHEN** 用户点击不同阶段按钮
- **THEN** UI 切换到对应阶段，状态历史被记录

## REMOVED Requirements

无

## Constraints

1. 所有改动仅限 `apps/web/src/` 和 `apps/api/src/`
2. 不拆分 App.tsx（Phase A 明确排除）
3. 不修改后端业务逻辑
4. 新组件必须使用语义化 token
5. 每个 Task 完成需独立提交
