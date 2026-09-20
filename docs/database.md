# База данных — решение и как подключиться

**Статус:** база создана и готова (`ready`), схема ещё не накатана —
это сделает тот, кто выполняет Sprint 0 T0.2 («Схема БД и seed»),
командой `prisma migrate dev` по схеме из `docs/concept.md` (раздел 6).

## Решение: Prisma Postgres, регион Frankfurt (eu-central-1)

- **Провайдер:** Prisma Postgres (управляемый Postgres от Prisma) —
  не Neon, хотя `docs/concept.md` изначально допускал оба варианта.
  Причина выбора: у облачного Claude Code есть прямой MCP-доступ к
  Prisma Postgres API — можно провизионить, смотреть схему и
  управлять базой без выхода из сессии, у Neon такого прямого доступа
  нет.
- **Регион:** `eu-central-1` (Франкфурт) — ближайший доступный регион
  к Братиславе из списка Prisma (`us-east-1`, `us-west-1`, `eu-west-3`,
  `eu-central-1`, `ap-northeast-1`, `ap-southeast-1`), минимизирует
  задержку для реальных пользователей и для Vercel-деплоя (T0.4).
- **ID для справки:** project `proj_uhvlbpwgi0bvk3ewj9cky9xr`,
  database `db_u1lby7vqe8bru1uh74q3ep7f`. Понадобятся, если нужно
  управлять базой через Prisma MCP (интроспекция, бэкапы и т.п.).

## Как подключиться (для того, кто делает T0.1/T0.2)

Два разных connection string — это нормально для Prisma Postgres, не
опечатка:
- **`DATABASE_URL`** — Accelerate-строка (через `accelerate.prisma-data.net`).
  Используется приложением в рантайме (Prisma Client) — с пулингом
  соединений, подходит для serverless/edge на Vercel.
- **`DIRECT_URL`** — прямое подключение к `db.prisma.io`. Используется
  только для миграций (`prisma migrate dev`/`deploy`), Accelerate не
  поддерживает DDL-операции напрямую.

В `schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Сами значения (секреты) не хранятся в репозитории** — присланы
владельцу проекта отдельно в чате. Положить их нужно:
- Локально — в `.env.local` (должен быть в `.gitignore`, что
  `create-next-app` делает по умолчанию в рамках T0.1).
- На Vercel — в Project Settings → Environment Variables, при
  деплое (T0.4).

## Почему не накатана схема прямо сейчас

Схема (`prisma/schema.prisma`) — часть кодовой базы Next.js-приложения,
которую создаёт исполнитель Sprint 0 (Claude Code CLI или Antigravity),
не облачный Claude Code (см. `AGENTS.md`, разделение ролей). Применение
DDL напрямую через MCP в обход `prisma migrate` создало бы рассинхрон
с таблицей `_prisma_migrations`, которую Prisma использует для
отслеживания истории миграций — это создало бы проблемы при первом же
`prisma migrate dev` в реальном репозитории. Поэтому база создана и
готова принять соединение, но пустая — миграция строго через
`prisma migrate dev`, по схеме из `docs/concept.md` раздел 6.
