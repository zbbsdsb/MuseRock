# OasisBio OAuth 集成到 MuseRock 项目的正式计划

## 1. 项目概述

### 1.1 背景
MuseRock 是一个创作协助工具，目前使用 Firebase Google 认证进行用户登录。为了扩展用户登录选项并利用 OasisBio 的生态系统，需要集成 "Continue with Oasis" 认证功能。

### 1.2 目标
- 添加 "Continue with Oasis" 登录按钮
- 实现完整的 OAuth 2.0 + PKCE 认证流程
- 与现有的 Firebase 认证系统共存
- 支持获取用户资料和角色数据
- 提供良好的用户体验和错误处理

### 1.3 范围
- 前端集成：添加登录按钮、实现认证流程
- 后端集成：处理 OAuth 回调、令牌管理
- 状态管理：更新用户状态管理
- 测试：验证完整的认证流程

## 2. 技术架构

### 2.1 系统架构
```
MuseRock 前端
  ↓
OasisAuthService (前端服务)
  ↓
OasisBio OAuth 服务器
  ↓
MuseRock 后端 (可选，用于令牌管理)
  ↓
Firebase (用户数据存储)
```

### 2.2 核心组件
| 组件 | 功能 | 位置 |
|------|------|------|
| OasisAuthService | 处理 OAuth 流程、令牌管理 | src/services/oasisAuth.ts |
| ContinueWithOasisButton | "Continue with Oasis" 按钮组件 | src/components/ContinueWithOasisButton.tsx |
| AuthCallbackHandler | 处理 OAuth 回调 | src/pages/auth/callback.tsx |
| 类型定义 | OasisBio 相关类型 | src/types/oasis.ts |

### 2.3 数据流
1. 用户点击 "Continue with Oasis" 按钮
2. 生成 PKCE 代码验证器和挑战
3. 重定向到 OasisBio 授权页面
4. 用户授权
5. 重定向回 MuseRock 回调 URL
6. 交换授权码获取令牌
7. 存储访问令牌和刷新令牌
8. 获取用户资料
9. 更新应用状态

## 3. 详细实施步骤

### 3.1 准备工作
1. **注册 OasisBio 应用**
   - 登录 OasisBio 开发者门户
   - 创建新应用，获取 client_id 和 client_secret
   - 配置重定向 URI：`http://localhost:3000/auth/callback`

2. **项目配置**
   - 在 `.env` 文件中添加 OasisBio 配置：
     ```
     VITE_OASIS_CLIENT_ID=your_client_id
     VITE_OASIS_REDIRECT_URI=http://localhost:3000/auth/callback
     VITE_OASIS_AUTH_URL=https://oasisbio.com/oauth/authorize
     VITE_OASIS_TOKEN_URL=https://oasisbio.com/api/oauth/token
     VITE_OASIS_USERINFO_URL=https://oasisbio.com/api/oauth/userinfo
     ```

### 3.2 核心实现
1. **创建 OasisAuthService**
   - 实现 PKCE 代码生成和管理
   - 处理授权请求和回调
   - 实现令牌交换和刷新
   - 提供用户资料获取方法

2. **创建 ContinueWithOasisButton 组件**
   - 实现符合品牌指南的按钮 UI
   - 集成 PKCE 流程
   - 处理授权启动

3. **实现 AuthCallbackHandler 组件**
   - 处理 OAuth 回调
   - 验证状态参数
   - 交换授权码获取令牌
   - 存储令牌并更新用户状态

4. **更新 App.tsx**
   - 添加 OasisBio 登录选项
   - 更新认证状态管理
   - 处理不同认证方式的用户状态

5. **添加类型定义**
   - 定义 OasisBio 用户资料类型
   - 定义令牌类型
   - 定义 API 响应类型

### 3.3 集成与测试
1. **与 Firebase 集成**
   - 决定是否将 OasisBio 认证与 Firebase 关联
   - 实现用户会话管理

2. **测试流程**
   - 测试完整的认证流程
   - 测试错误处理
   - 测试令牌刷新
   - 测试登出功能

3. **用户体验优化**
   - 添加加载状态
   - 提供清晰的错误信息
   - 确保按钮样式符合品牌指南

## 4. 时间线

| 阶段 | 任务 | 时间（天） |
|------|------|------------|
| 准备阶段 | 注册 OasisBio 应用、配置项目 | 1 |
| 核心实现 | 创建 OasisAuthService | 2 |
| 核心实现 | 创建 ContinueWithOasisButton 组件 | 1 |
| 核心实现 | 实现 AuthCallbackHandler 组件 | 1 |
| 核心实现 | 更新 App.tsx 和状态管理 | 1 |
| 集成与测试 | 与 Firebase 集成 | 1 |
| 集成与测试 | 测试完整流程 | 2 |
| 优化阶段 | 用户体验优化、错误处理 | 1 |
| **总计** | | **10** |

## 5. 风险评估

| 风险 | 影响 | 可能性 | 缓解措施 |
|------|------|--------|----------|
| 令牌管理不当 | 用户会话中断 | 中 | 实现自动令牌刷新机制 |
| PKCE 实现错误 | 安全漏洞 | 低 | 严格按照 OAuth 2.0 规范实现 |
| 跨域问题 | 认证失败 | 低 | 正确配置重定向 URI |
| 令牌存储安全 | 令牌泄露 | 中 | 使用安全的存储方案 |
| 错误处理不完善 | 用户体验差 | 中 | 实现全面的错误处理和用户反馈 |

## 6. 测试计划

### 6.1 功能测试
- [ ] "Continue with Oasis" 按钮显示正确
- [ ] 授权流程正常工作
- [ ] 令牌交换成功
- [ ] 用户资料获取成功
- [ ] 令牌刷新功能正常
- [ ] 登出功能正常

### 6.2 错误测试
- [ ] 无效 client_id 处理
- [ ] 用户拒绝授权处理
- [ ] 令牌过期处理
- [ ] 网络错误处理
- [ ] 重定向 URI 不匹配处理

### 6.3 安全测试
- [ ] PKCE 验证有效性
- [ ] 状态参数验证
- [ ] 令牌存储安全性
- [ ] 跨站请求伪造 (CSRF) 防护

## 7. 验收标准

1. **功能完整性**
   - "Continue with Oasis" 按钮正确显示和功能正常
   - 完整的 OAuth 2.0 + PKCE 流程实现
   - 成功获取和存储用户令牌
   - 成功获取用户资料

2. **用户体验**
   - 流畅的认证流程
   - 清晰的错误提示
   - 加载状态反馈
   - 符合品牌指南的按钮样式

3. **安全性**
   - 正确实现 PKCE 流程
   - 安全的令牌存储
   - 有效的状态参数验证
   - 防 CSRF 攻击

4. **集成性**
   - 与现有 Firebase 认证系统共存
   - 正确处理不同认证方式的用户状态
   - 无冲突的状态管理

5. **可靠性**
   - 正确处理各种错误场景
   - 令牌自动刷新机制
   - 稳定的认证流程

## 8. 后续维护

1. **令牌管理**
   - 监控令牌使用情况
   - 实现令牌过期预警

2. **安全更新**
   - 定期检查 OAuth 实现的安全性
   - 及时更新依赖库

3. **功能扩展**
   - 支持更多 OasisBio 资源访问
   - 实现更高级的用户数据同步

4. **文档更新**
   - 维护集成文档
   - 更新测试计划

## 9. 结论

通过本计划，MuseRock 项目将成功集成 OasisBio OAuth 认证系统，为用户提供一种新的登录方式，同时保持与现有认证系统的兼容性。集成过程遵循 OAuth 2.0 规范和安全最佳实践，确保用户数据的安全和隐私。

该计划详细说明了实施步骤、时间线、风险评估和测试计划，为开发团队提供了清晰的指导，确保集成过程顺利完成。