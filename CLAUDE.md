# Start AIStory

AI 影片生成前端，已部署至 Vercel。

## 部署資訊

- **URL**: https://start-aistory.vercel.app/
- **部署方式**: Git push 自動部署
- **後端**: media-engine (API_SERVER_URL)

## 技術架構

- **Framework**: TanStack Start + React 19 (SSR)
- **Router**: TanStack Router v1 (檔案式路由)
- **State**: TanStack Store + TanStack Query
- **Database**: Drizzle ORM + PostgreSQL (aistory schema)
- **Auth**: Supabase Auth
- **Realtime**: Supabase Realtime + Polling 備援
- **UI**: Shadcn UI + Tailwind CSS v4
- **Runtime**: Nitro (Node.js)

## 開發指令

```bash
cd /home/start-aistory

# 安裝依賴
pnpm install

# 開發模式 (port 3000)
pnpm dev

# 建置
pnpm build

# 資料庫遷移
pnpm db:push

# 程式碼檢查
pnpm lint

# 部署 (自動)
git add . && git commit -m "..." && git push
```

## 目錄結構

```
/home/start-aistory/
├── src/
│   ├── routes/                 # 檔案式路由
│   │   ├── __root.tsx          # 根 Layout
│   │   ├── index.tsx           # 主頁 - 影片生成器
│   │   ├── jobs.tsx            # 任務歷史
│   │   └── api/                # API Routes (Nitro)
│   │       ├── jobs.ts         # GET/POST /api/jobs
│   │       └── jobs.$id.ts     # GET/DELETE /api/jobs/:id
│   ├── components/
│   │   ├── auth-form.tsx       # 登入/註冊
│   │   ├── generator-form.tsx  # 生成表單
│   │   ├── progress-display.tsx # 12 步驟進度
│   │   ├── video-preview.tsx   # 完成預覽
│   │   ├── job-card.tsx        # 任務卡片
│   │   ├── app-header.tsx      # 導航
│   │   └── ui/                 # Shadcn UI
│   ├── stores/
│   │   ├── auth.ts             # 認證狀態
│   │   └── job.ts              # 任務追蹤 (Realtime + Polling)
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-jobs.ts
│   │   └── use-job-state.ts
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema
│   │   └── index.ts            # Drizzle client
│   ├── lib/
│   │   └── supabase.ts
│   └── env.ts                  # T3 Env 驗證
├── drizzle.config.ts
├── vite.config.ts
├── biome.json
└── package.json
```

## 資料庫 Schema

```typescript
// aistory.jobs 表
{
  id: uuid
  owner_id: uuid

  // 輸入
  idea: text
  style: 'cinematic' | 'anime'
  voice: 'male' | 'female'
  subtitle_position: 'top' | 'middle' | 'bottom'
  test_mode: boolean  // true = 2 場景

  // 狀態
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  current_step: text
  error_message: text
  logs: jsonb  // LogEntry[]

  // 輸出
  video_url: text
  video_title: text
  video_description: text
  video_hashtags: jsonb  // string[]
  video_duration: float

  // 時間
  created_at, updated_at, started_at, completed_at
}
```

## 頁面狀態流程

```
主頁 (/) 狀態:
idle → queued → generating → complete/error

- idle: 顯示生成表單
- queued: 顯示佇列位置
- generating: 12 步驟進度 + 活動日誌
- complete: 影片播放器 + 元資料
- error: 錯誤訊息
```

## 環境變數

```bash
# Server (Vercel)
DATABASE_URL=postgresql://...
API_SERVER_URL=http://[DROPLET_IP]:8000

# Client (VITE_)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=xxx
```

## 與 Media Engine 整合

1. **建立任務**: POST `/api/jobs` → 代理至 media-engine
2. **即時更新**: Supabase Realtime 監聽 jobs 表
3. **輪詢備援**: 每 2 秒 `/api/jobs/:id` (RLS 備援)
4. **認證**: Supabase JWT 在 Authorization header

## 重要注意事項

- **Vercel 部署**: push 到 main 自動部署
- **Schema 隔離**: 使用 `aistory` schema
- **Realtime 限制**: RLS 可能阻擋，已有 polling 備援
