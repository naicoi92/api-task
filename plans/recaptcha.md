# Plan: Hỗ trợ recaptcha-v2 và recaptcha-v3

## Context

`api-task` hiện expose 2 endpoint `POST /task` và `GET /task/:token`. Provider chọn theo `name`:

- `InngestProvider` xử lý `cloudflare`, `cloudflare.camoufox`, `cloudflare.cloak` → gửi event đến `cloudflareInngest()` (`https://ings.fly.dev`), poll Redis key `cloudflare:{token}`.
- `CaptchaTSProvider` xử lý `cloudflare/playwright`, `cloudflare/playwright.browserless` → gửi event đến `captchaTSInngest()`.

`cloudflare-bot` (external dir) đã chạy worker Inngest với 2 function:

- `recaptcha-v2` — payload `{ id, url, siteKey, invisible?, enterprise?, proxy? }` → result `{ status, token, userAgent }` ở Redis key `recaptcha-v2:{id}` TTL 60s.
- `recaptcha-v3` — payload `{ id, url, siteKey, action?, enterprise?, proxy? }` → result `{ status, token, userAgent }` ở Redis key `recaptcha-v3:{id}` TTL 60s.

Yêu cầu: bổ sung 2 task name `recaptcha-v2` và `recaptcha-v3` vào `api-task`.

## Quyết định đã chốt

- Inngest endpoint: dùng lại `cloudflareInngest()` (cùng project Inngest với cloudflare-bot worker).
- Mỗi task name = 1 provider riêng (`RecaptchaV2Provider`, `RecaptchaV3Provider`). Mỗi provider cố định 1 redis prefix tương ứng → `getTask(token)` không cần biết task name.

## Approach

- Tạo 2 provider độc lập, mỗi provider implements `TaskCreator + TaskResult`, hardcode `eventName` + `redisPrefix`.
- Tách schema input riêng cho v2 và v3 (khác field). Output schema dùng chung (`RecaptchaOutputSchema`).
- Entity `RecaptchaEntity` chung cho cả 2.
- Đăng ký cả 2 vào token `TaskCreateProvider` + `TaskStatusProvider`. Factory hiện dùng `@injectAll` + `isSupportTask()` đã hỗ trợ multi-provider sẵn.
- Không sửa interface `TaskCreator`/`TaskResult`, không sửa handler.

## Files cần thay đổi

- `src/domains/schemas/recaptcha.schema.ts` (mới) — `RecaptchaV2InputSchema`, `RecaptchaV3InputSchema`, `RecaptchaOutputSchema`.
- `src/domains/types/recaptcha.type.ts` (mới) — `RecaptchaV2Input`, `RecaptchaV3Input`, `RecaptchaOutput`.
- `src/domains/entities/recaptcha.entity.ts` (mới) — `RecaptchaEntity` implements `TaskData<RecaptchaOutput>`.
- `src/external/providers/recaptcha-v2.provider.ts` (mới).
- `src/external/providers/recaptcha-v3.provider.ts` (mới).
- `src/internal/container.ts` — `registerSingleton(TOKEN.TaskCreateProvider, RecaptchaV2Provider)` + `RecaptchaV3Provider`, làm tương tự cho `TOKEN.TaskStatusProvider`.

## Reuse

- `cloudflareInngest()` — `src/external/inngest.ts`.
- `ioredis()` — `src/external/ioredis.ts`.
- Pattern provider của `InngestProvider` (`src/external/providers/inngest.provider.ts`) làm template (Inngest send + Redis pending pipeline + parse output).
- `TaskEntity`, `TaskStatus`, `TaskData<T>` interface.
- `CloudflareEntity` làm template cho `RecaptchaEntity`.

## Schema chi tiết

```ts
// src/domains/schemas/recaptcha.schema.ts
import z from "zod";
import { TaskStatus } from "../enums/status.enum";

export const RecaptchaV2InputSchema = z.object({
  url: z.url(),
  siteKey: z.string(),
  invisible: z.boolean().default(false),
  enterprise: z.boolean().default(false),
  proxy: z.url().optional(),
});

export const RecaptchaV3InputSchema = z.object({
  url: z.url(),
  siteKey: z.string(),
  action: z.string().default("submit"),
  enterprise: z.boolean().default(false),
  proxy: z.url().optional(),
});

export const RecaptchaOutputSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal(TaskStatus.success),
    token: z.string(),
    userAgent: z.string(),
  }),
  z.object({ status: z.literal(TaskStatus.pending) }),
  z.object({ status: z.literal(TaskStatus.error), message: z.string() }),
]);
```

## Provider skeleton

```ts
// src/external/providers/recaptcha-v2.provider.ts
@singleton()
export class RecaptchaV2Provider implements TaskCreator, TaskResult {
  inputSchema = RecaptchaV2InputSchema;
  private inngest = cloudflareInngest();
  private redis = ioredis();
  private static readonly TASK_NAME = "recaptcha-v2";
  private static readonly REDIS_PREFIX = "recaptcha-v2";

  isSupportTask(name: string) { return name === RecaptchaV2Provider.TASK_NAME; }

  async create(_taskName: string, token: string, input: unknown) {
    const data = RecaptchaV2InputSchema.parse(input);
    await Promise.all([
      this.inngest.send({
        name: RecaptchaV2Provider.TASK_NAME,
        data: { id: token, ...data },
      }),
      this.savePending(token),
    ]);
    return new TaskEntity(token);
  }

  async getTask(token: string) {
    const task = new TaskEntity(token);
    const raw = await this.redis.hgetall(`${RecaptchaV2Provider.REDIS_PREFIX}:${token}`);
    const output = RecaptchaOutputSchema.parse(
      isEmpty(raw) ? { status: "error", message: "timeout request. not found response" } : raw,
    );
    task.setData(new RecaptchaEntity(output));
    return task;
  }

  private async savePending(token: string) {
    const key = `${RecaptchaV2Provider.REDIS_PREFIX}:${token}`;
    await this.redis.pipeline()
      .hset(key, { status: TaskStatus.pending })
      .expire(key, 180)
      .exec();
  }
}
```

`RecaptchaV3Provider` y hệt, đổi `TASK_NAME = "recaptcha-v3"`, `REDIS_PREFIX = "recaptcha-v3"`, schema `RecaptchaV3InputSchema`.

## Container registration

```ts
// src/internal/container.ts (thêm 4 dòng)
container.registerSingleton(TOKEN.TaskCreateProvider, RecaptchaV2Provider);
container.registerSingleton(TOKEN.TaskStatusProvider, RecaptchaV2Provider);
container.registerSingleton(TOKEN.TaskCreateProvider, RecaptchaV3Provider);
container.registerSingleton(TOKEN.TaskStatusProvider, RecaptchaV3Provider);
```

## Steps

- [ ] Tạo `src/domains/schemas/recaptcha.schema.ts`.
- [ ] Tạo `src/domains/types/recaptcha.type.ts`.
- [ ] Tạo `src/domains/entities/recaptcha.entity.ts`.
- [ ] Tạo `src/external/providers/recaptcha-v2.provider.ts`.
- [ ] Tạo `src/external/providers/recaptcha-v3.provider.ts`.
- [ ] Đăng ký 2 provider trong `src/internal/container.ts`.
- [ ] `bun run check` (lint + tsc) pass.

## Verification

```bash
bun run check
bun run dev

# Test create v2
curl -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{
    "name":"recaptcha-v2",
    "data":{
      "url":"https://example.com/verify",
      "siteKey":"6Le-...",
      "invisible":false,
      "enterprise":false
    }
  }'

# Test create v3
curl -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{
    "name":"recaptcha-v3",
    "data":{
      "url":"https://example.com",
      "siteKey":"6Le-...",
      "action":"submit"
    }
  }'

# Poll status (token lấy từ response /task)
curl http://localhost:3000/task/<token>
# → { status: "pending" } khi worker chưa xong
# → { status: "success", data: { token, userAgent } } khi worker push redis xong
```

End-to-end cần worker `cloudflare-bot` chạy + connect cùng Inngest project (`ings.fly.dev`) + share Redis với api-task.
