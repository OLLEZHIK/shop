# Задача: обобщить модель данных (Salon → Business) и накатить schema + seed

**Исполнитель:** Claude Code CLI (локальный)
**Роль:** Builder agent.
**Тип:** архитектурная правка + миграция БД, объём умеренный/большой.
**Ветка:** `cli/generalize-business-model-and-seed`
**Зависимости:** нет, можно начинать сразу. Задачи
`cli-build-listing-and-detail-pages` и `cli-build-shell-and-static-pages`
зависят от результата этой задачи — начинать их после мерджа этой.

## Контекст

См. `docs/design-plan.md` разделы 2 и 7 — там разобрано, почему и как.
Коротко: текущая `website/prisma/schema.prisma` моделирует только
груминг (`Salon`), но `data/` уже содержит 4 категории на 76 строк
(`salons`, `vet-clinics`, `pet-hotels`, `other-pet-services` с
подкатегориями `shop`/`training`/`sitting`). Схему нужно обобщить
**до** того, как строить страницы поверх неё.

Также в `website/lib/data.ts` есть баг, который нельзя повторить в
seed-скрипте: `parseCSV` там делает `line.split(',')`, что ломается на
полях с запятой внутри кавычек (например, адрес `"Ružinovská 1/4814,
821 02 Bratislava"` в `data/salons-bratislava.csv` — распадётся на два
поля вместо одного). Используй нормальный CSV-парсер (например,
`csv-parse` или `papaparse`), а не собственный сплиттер.

БД (Prisma Postgres, Frankfurt) уже создана и готова принять
подключение — детали и `DATABASE_URL`/`DIRECT_URL` в
`docs/database.md`. Схема ещё не накатана.

## Что сделать

1. В `website/prisma/schema.prisma`:
   - Переименовать модель `Salon` → `Business`.
   - Добавить enum `BusinessCategory { GROOMING VET_CLINIC PET_HOTEL PET_SHOP DOG_TRAINING PET_SITTING }` и поле `category BusinessCategory` в `Business`.
   - Сделать `districtId` nullable (`Int?`) — район заполнен не у всех строк, пока не завершена `tasks/cli-backfill-districts-all-datasets.md` (если она уже смёржена к моменту твоей работы — тем лучше, но код не должен требовать district обязательным).
   - `lat`/`lng` — уже nullable в текущей схеме, оставить как есть (заполнит `tasks/antigravity-geocode-listings.md` отдельно).
   - Остальные поля (`address`, `phone`, `email`, `website`, `animals`, `specialties`/`notes`, `status`, `featured`, `verifiedAt`, `sourceUrls`) переносятся как есть с `Salon` на `Business`.
   - Добавить `photoUrls String[] @default([])` в `Business` — владелец решил включить фото в основной флоу (см. `docs/design-plan.md` раздел 2.1), но реальных фото ещё нет ни у одной записи (правило проекта — не использовать чужие фото без разрешения), поэтому поле нужно уже сейчас, данные появятся позже отдельной задачей.
   - Добавить новую модель `Review`:
     ```prisma
     model Review {
       id         Int          @id @default(autoincrement())
       businessId Int
       authorName String
       rating     Int          // 1-5
       comment    String
       status     ReviewStatus @default(PENDING)
       createdAt  DateTime     @default(now())
       business   Business     @relation(fields: [businessId], references: [id])
     }
     enum ReviewStatus { PENDING PUBLISHED REJECTED }
     ```
     Это тоже решение владельца — отзывы переносятся из P1 в MVP, подробности и обоснование (почему `PENDING` по умолчанию, почему без выдуманных данных) — `docs/design-plan.md` раздел 2.1. В этой задаче только схема, без реальных отзывов — таблица создаётся пустой, отзывы появятся через форму на сайте (задача `cli-build-listing-and-detail-pages`).
   - `PriceItem.salonId` → `PriceItem.businessId`, `ClickEvent.salonId` → `ClickEvent.businessId`, соответствующие связи.
2. Написать seed-скрипт (`website/prisma/seed.ts`, добавить `npm run db:seed` в `package.json`):
   - Читает все 4 файла из `data/` (не из `website/data/` — это дублирующая копия, см. открытый вопрос ниже).
   - Парсит корректным CSV-парсером с учётом кавычек.
   - Маппит `category` каждого файла на `BusinessCategory`: `salons-bratislava.csv` → `GROOMING`, `vet-clinics-bratislava.csv` → `VET_CLINIC`, `pet-hotels-bratislava.csv` → `PET_HOTEL`, `other-pet-services-bratislava.csv` — берёт значение из его собственной колонки `category` (`shop`/`training`/`sitting` → `PET_SHOP`/`DOG_TRAINING`/`PET_SITTING`).
   - Генерирует `slug` из названия (kebab-case, латиница/транслитерация не нужна — большинство названий уже латиницей; при коллизии слага — добавить суффикс района или порядковый номер).
   - Сопоставляет `district` (slug) с уже существующей моделью `District` — если строка CSV не пуста и совпадает с одним из 17 slug'ов Братиславы (`docs/concept.md`, Приложение B), проставляет `districtId`; если пусто или не совпадает — `districtId: null`, без гаданий.
   - Сидирует `City` (Bratislava) и все 17 `District`, если их ещё нет.
   - `status: PUBLISHED` для всех загруженных строк (в MVP нет модерации — все собранные данные уже прошли ручную проверку по протоколу сбора).
   - Скрипт идемпотентный — повторный запуск не создаёт дублей (upsert по `slug` или по паре `name`+`address`).
3. Прогнать `npx prisma migrate dev --name generalize-business-model` против уже существующей БД (см. `docs/database.md` про `DATABASE_URL`/`DIRECT_URL` — их значения присланы владельцу отдельно в чате, взять из `.env.local`).
4. Прогнать `npm run db:seed`, убедиться что все 76 записей загрузились без ошибок (или меньше — если строка не прошла минимальную валидацию, см. ниже).
5. **Не переписывай** `website/lib/data.ts` и `website/app/page.tsx` в этой задаче — это сделает следующая задача (`cli-build-listing-and-detail-pages`/`cli-build-shell-and-static-pages`), которая уже будет читать из БД через Prisma Client. Здесь только схема + seed.

## Валидация при загрузке (не выдумывать, не блокировать всё из-за одной строки)

- Строка без `name` или без хотя бы одного способа связи (`phone`, `email` или `website`) — пропустить, залогировать в консоль при сидировании (не падать со скрипта).
- Пустые `district`/`lat`/`lng`/цены — это ожидаемо на этом этапе, не ошибка.

## Открытый вопрос (описать в PR, не решать самостоятельно)

`website/data/*.csv` — это дублирующая копия `data/*.csv`, судя по
всему появившаяся при первоначальной инициализации Next.js-проекта
(вероятно, скопирована как временное решение до появления БД). После
того как seed читает из `data/` и приложение переходит на Prisma
Client, `website/data/` станет неиспользуемым дублем. Не удаляй её
сам в этой задаче (это не входит в её объём) — просто явно укажи в PR,
что дубль есть и его можно убрать отдельным мелким PR после того, как
`website/lib/data.ts` перестанет её читать.

## Критерии готовности (Definition of Done)

- `website/prisma/schema.prisma` обновлена (Business + BusinessCategory + Review + photoUrls), `prisma migrate dev` проходит на реальной БД.
- Seed-скрипт существует, идемпотентен, реально прогнан (не только написан) — в PR приложить вывод (сколько записей по каждой категории загружено).
- CSV парсится библиотекой, а не самописным `split(',')`.
- `npm run build` и `npm run lint` (если настроен) проходят.
- PR открыт в `main`, описан открытый вопрос про `website/data/` дубль.

## Если что-то неясно

Не додумывать. Написать вопрос в описании PR и остановиться на этом
конкретном пункте, продолжая остальную часть задачи.
