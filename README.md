<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run the app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Admin Portal

Run the isolated admin portal locally:

1. Install dependencies:
   `npm install`
2. Run:
   `npm run dev:admin`

## Admin 二次防护（强烈建议上线前启用）

你现在的 Admin Portal 已经做到“独立入口 + Supabase 鉴权 + DB 侧 is_admin 校验”，但上线环境仍建议再加一层“外部访问控制”，把攻击面从公网收缩。

### 方案 A：Cloudflare Access（推荐）

1. 在 Cloudflare Zero Trust 创建一个 Application（Self-hosted）。
2. 绑定你的 admin 域名，例如 `admin.example.com`。
3. Policy 建议：
   - Allow 仅限你的团队邮箱域名/指定邮箱
   - 强制 MFA
4. 将 DNS / 代理指向你的 admin 部署。

### 方案 B：Basic Auth（最简单快速）

如果你使用 Nginx 反代 admin：

```nginx
location / {
  auth_basic "Restricted";
  auth_basic_user_file /etc/nginx/.htpasswd;

  proxy_pass http://127.0.0.1:3002;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

如果你使用 Caddy：

```caddy
admin.example.com {
  basicauth {
    admin JDJhJDE0JFRPRE9fUkVBTF9IQVNIX0hFUkUK
  }
  reverse_proxy 127.0.0.1:3002
}
```

### 方案 C：IP allowlist（适合公司内网/固定 IP）

同样以 Nginx 为例：

```nginx
location / {
  allow 203.0.113.10;
  allow 203.0.113.11;
  deny all;

  proxy_pass http://127.0.0.1:3002;
}
```

如果你使用 Caddy：

```caddy
admin.example.com {
  @blocked not remote_ip 203.0.113.10 203.0.113.11
  respond @blocked "Forbidden" 403
  reverse_proxy 127.0.0.1:3002
}
```

建议：如果能用 Cloudflare Access，就用 Access；否则 Basic Auth + IP allowlist 也能显著降低风险。

## 账号风控 / DB 侧限速（Rate Limit）

项目的 `supabase_schema.sql` 已内置一个简单的 DB 侧限速器：

- 表：`public.rate_limit_buckets`
- 函数：`public.check_rate_limit(action, max_hits, window_seconds)`（仅供服务器端 SECURITY DEFINER 函数内部调用）

当前已接入：

- `admin_list_profiles`：每 admin 每分钟 30 次
- `set_profile_verification`：每 admin 每分钟 20 次
- `increment_view_count`（已登录用户）：每用户每分钟 120 次

## 监控告警（Sentry，可选）

已接入 `@sentry/react`，默认不启用。只要在 `.env.local` 配置：

`VITE_SENTRY_DSN=...`

即可在主站与 admin portal 自动初始化。

## 备份与迁移（建议）

### 数据库备份（pg_dump）

1. 在 Supabase 项目设置里找到 Postgres 连接串（建议使用 service role/数据库管理员账号）。
2. 在 Windows PowerShell 执行：

```powershell
pg_dump --format=custom --no-owner --no-privileges --file solerz.backup.dump "<YOUR_POSTGRES_URL>"
```

你也可以使用项目内置脚本（Windows PowerShell）：

```powershell
./tools/backup.ps1 -PostgresUrl "<YOUR_POSTGRES_URL>"
```

### Storage 备份

建议做两层：

1. 业务层：对 `ssm-documents` 这种关键文件，定期导出到对象存储（S3/R2）
2. 管理层：保留 bucket 列表 + 对象清单（便于追溯）

### Schema 版本化

- `supabase_schema.sql` 作为唯一可重复部署的 schema 来源
- 每次变更必须同步更新这份 SQL
- 建议在每次发布前跑一轮 `tools/security-test.mjs` 做回归
