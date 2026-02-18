# Solerz 订阅系统完整测试计划

## 📋 测试环境准备

### 1. Stripe 测试环境配置
- 确认使用 Stripe **测试模式** (Test Mode)
- 使用测试卡号：`4242 4242 4242 4242`
- 测试卡有效期：任意未来日期 (如 12/25)
- 测试卡 CVC：任意 3 位数 (如 123)
- 测试卡邮编：任意 5 位数

### 2. 测试前检查清单
- [ ] 确认 `.env` 中的 `STRIPE_SECRET_KEY` 以 `sk_test_` 开头
- [ ] 确认 Stripe Webhook 已配置并指向正确 URL
- [ ] 确认 Supabase 数据库可正常访问
- [ ] 准备测试账号 (建议用新注册账号测试)

---

## 🧪 测试场景 1: 全新用户订阅 (Monthly)

### 步骤
1. 注册新账号或重置现有账号的订阅状态
2. 登录后进入 Dashboard，确认显示 "Free Plan"
3. 点击 "Upgrade Now" 或前往 `/pricing`
4. 选择 **Starter Plan** + **Monthly**
5. 点击 "Subscribe Now" → "Pay with Stripe"
6. 在 Stripe Checkout 页面使用测试卡完成支付
7. 支付成功后返回 Dashboard (`?payment=success`)

### 预期结果 - Dashboard 显示
- [ ] 订阅状态显示 "Active"
- [ ] Started: 显示正确的开始日期
- [ ] Next billing: 显示 30 天后的日期
- [ ] Period: 显示 "Monthly"
- [ ] 显示 "Change Plan" 和 "Cancel" 按钮

### 数据库验证 (Supabase)
```sql
SELECT tier, stripe_subscription_id, stripe_current_period_end, 
       stripe_billing_interval, stripe_cancel_at_period_end 
FROM profiles WHERE email = '测试邮箱';
```
预期：
- `tier` = 'STARTER'
- `stripe_subscription_id` = 非空 (以 sub_ 开头)
- `stripe_billing_interval` = 'month'
- `stripe_cancel_at_period_end` = false

---

## 🧪 测试场景 2: 订阅年度配套 (Yearly)

### 步骤
1. 取消当前订阅 (从场景 1 继续，或重置账号)
2. 前往 `/pricing`
3. 切换到 **Yearly** 标签
4. 选择 **Pro Plan** + **Yearly**
5. 完成 Stripe Checkout

### 预期结果 - Dashboard 显示
- [ ] 订阅状态显示 "Active"
- [ ] Period: 显示 "Yearly"
- [ ] Next billing: 显示 365 天后的日期

### 数据库验证
预期：
- `tier` = 'PRO'
- `stripe_billing_interval` = 'year'
- `stripe_current_period_end` = 当前时间 + 1年

---

## 🧪 测试场景 3: 升级配套 (Upgrade Plan)

### 前提条件
已有 Monthly Starter 订阅

### 步骤
1. 在 Dashboard 点击 "Change Plan"
2. 选择 **Pro Plan** + 保持 **Monthly**
3. 点击 "Subscribe Now"

### 预期结果
- [ ] 立即升级成功 (无需再次支付，因为价格更高会立即收费)
- [ ] Dashboard 立即显示新计划
- [ ] Supabase `tier` 字段更新为 'PRO'

---

## 🧪 测试场景 4: 降级配套 (Downgrade Plan)

### 前提条件
已有 Monthly Pro 订阅

### 步骤
1. 在 Dashboard 点击 "Change Plan"
2. 选择 **Starter Plan** + 保持 **Monthly**
3. 点击 "Subscribe Now"

### 预期结果
- [ ] 显示提示 "Downgrade scheduled for next billing cycle"
- [ ] Dashboard 显示 "Changing to starter on [日期]"
- [ ] 当前 tier 保持为 PRO 直到下个账单周期

### 数据库验证
预期：
- `tier` = 'PRO' (当前保持)
- `pending_tier` = 'STARTER'
- `tier_effective_at` = 当前账单周期结束时间

---

## 🧪 测试场景 5: 取消订阅 (Cancel at Period End)

### 步骤
1. 在 Dashboard 点击 "Cancel" 按钮
2. 确认弹窗 "Cancel your subscription at the end of the current billing period?"
3. 点击确认

### 预期结果
- [ ] 显示 "Cancellation scheduled at period end"
- [ ] Dashboard 显示 "Cancelling on [日期]"
- [ ] "Cancel" 按钮消失
- [ ] 用户仍然保持当前 tier 直到周期结束

### 数据库验证
预期：
- `tier` = 保持当前 (如 'PRO')
- `pending_tier` = 'UNSUBSCRIBED'
- `tier_effective_at` = 账单周期结束时间
- `stripe_cancel_at_period_end` = true

---

## 🧪 测试场景 6: 从 Free Plan 直接订阅 Yearly

### 步骤
1. 确保账号为 Free Plan (UNSUBSCRIBED)
2. 前往 `/pricing`
3. 选择 **Elite Plan** + **Yearly**
4. 完成 Stripe Checkout

### 预期结果
- [ ] Dashboard 显示 Active 状态
- [ ] Period: Yearly
- [ ] tier = ELITE

---

## 🧪 测试场景 7: 支付失败测试

### 步骤
1. 在 Stripe Checkout 使用失败测试卡：`4000 0000 0000 0002`
2. 尝试支付

### 预期结果
- [ ] Stripe 拒绝支付
- [ ] 返回 Pricing 页面，显示错误信息

---

## 🔄 Dashboard 自动刷新验证

### 测试点
- [ ] 支付成功后 Dashboard 自动刷新并显示新状态
- [ ] 无需手动刷新页面
- [ ] 无 30 秒自动轮询 (已移除)

---

## 📊 验证检查表

### Dashboard UI 检查
| 检查项 | 通过 |
|--------|------|
| Company Profile 标题旁边显示订阅信息 | ☐ |
| Active 状态标签显示为绿色 | ☐ |
| Started 日期正确 | ☐ |
| Next billing 日期正确 | ☐ |
| Period 显示 Monthly/Yearly 正确 | ☐ |
| Change Plan 按钮可点击 | ☐ |
| Cancel 按钮可点击 | ☐ |
| 降级时显示 "Changing to X on..." | ☐ |
| 取消时显示 "Cancelling on..." | ☐ |

### 数据同步检查
| 检查项 | 通过 |
|--------|------|
| Supabase `tier` 字段正确更新 | ☐ |
| Supabase `stripe_subscription_id` 正确保存 | ☐ |
| Supabase `stripe_billing_interval` 正确 (month/year) | ☐ |
| Supabase `stripe_current_period_end` 正确 | ☐ |
| Stripe Dashboard 显示正确订阅 | ☐ |

---

## 🐛 常见问题和调试

### 问题 1: Webhook 未触发
**症状**: 支付成功但 Dashboard 不更新
**检查**:
1. 检查 Stripe Dashboard → Developers → Webhooks → 最近事件
2. 确认 Webhook Endpoint URL 正确 (如 `https://your-domain.com/api/stripe/webhook`)
3. 检查 Cloudflare Functions 日志

### 问题 2: Dashboard 显示 "Next billing: -"
**症状**: 日期显示为横线
**检查**:
1. 检查 Supabase `stripe_current_period_end` 字段是否有值
2. 手动触发 sync: 在浏览器 Console 执行测试代码

### 问题 3: Cancel 后 tier 立即变为 UNSUBSCRIBED
**症状**: 取消订阅后立即失去权限
**检查**:
1. 检查 `cancel.ts` 是否正确设置了 `cancel_at_period_end` (而非立即取消)
2. 检查 Supabase `tier` 字段不应立即变更

---

## 📝 测试记录表

| 测试场景 | 测试日期 | 结果 | 备注 |
|----------|----------|------|------|
| 场景 1: Monthly Starter | | ☐ 通过 ☐ 失败 | |
| 场景 2: Yearly Pro | | ☐ 通过 ☐ 失败 | |
| 场景 3: Upgrade Plan | | ☐ 通过 ☐ 失败 | |
| 场景 4: Downgrade Plan | | ☐ 通过 ☐ 失败 | |
| 场景 5: Cancel Subscription | | ☐ 通过 ☐ 失败 | |
| 场景 6: Yearly Elite | | ☐ 通过 ☐ 失败 | |

---

## 🚀 快速测试命令

### 手动触发 Sync API (浏览器 Console)
```javascript
// 手动调用 sync API 检查 Stripe 数据
fetch('/api/stripe/subscription/sync', {
  headers: { 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session.access_token}` }
}).then(r => r.json()).then(console.log);
```

### 检查当前 Profile 数据 (浏览器 Console)
```javascript
// 查看当前用户 profile
fetch('/rest/v1/profiles?select=*', {
  headers: { 
    'apikey': 'your-anon-key',
    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`
  }
}).then(r => r.json()).then(console.log);
```

---

## ✅ 测试完成标准

所有测试场景通过后，订阅系统即视为可用：
- [ ] 所有 6 个测试场景均通过
- [ ] Dashboard UI 显示正确
- [ ] Stripe 和 Supabase 数据同步一致
- [ ] 用户可以正常订阅、升级、降级、取消
