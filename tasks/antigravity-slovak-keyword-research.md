# Задача: словацкие ключевые слова и URL-слаги для /sk/ версии сайта

**Исполнитель:** Antigravity
**Роль:** Research agent.
**Тип:** исследование, объём небольшой.
**Ветка:** `antigravity/slovak-keyword-research`
**Зависимости:** нет.

## Контекст

Решение владельца (2026-09-23): у каждой страницы есть полноценная
версия на языке города. Для Братиславы это `/sk/...`, английская
версия связана с ней через hreflang. Это отменяет решение от 21.09 из
`docs/design-plan.md` §2.2. Уже сделано и работает с временными
словацкими слагами (`website/lib/categories.ts`, `SLUGS.sk`):

| Категория | Временный слаг | Заголовок H1 |
|---|---|---|
| Grooming | `psi-salon` | Psie salóny v Bratislave |
| Vet clinics | `veterinar` | Veterinárne ambulancie v Bratislave |
| Pet hotels | `hotel-pre-zvierata` | Hotely pre zvieratá v Bratislave |
| Dog training | `vycvik-psov` | Výcvik psov v Bratislave |
| Pet shops | `chovatelske-potreby` | Chovateľské potreby v Bratislave |
| Pet sitting | `opatrovanie-zvierat` | Opatrovanie zvierat v Bratislave |

Страница заведения: `/sk/podnik/{slug}/`.

## Что сделать

По образцу `docs/seo/english-keywords.md` (та же структура таблицы)
создать `docs/seo/slovak-keywords.md`:

1. Для каждой категории — главные словацкие запросы (например
   «veterinár Bratislava», «psí salón Petržalka», «hotel pre psov»),
   примерный объём или относительная популярность, источник оценки.
2. Рекомендованный слаг: оставить временный или заменить, и почему.
3. Рекомендованный H1 и `<title>` на словацком.
4. Отдельно: сегмент страницы заведения (`podnik` или лучше другой?).
5. Запросы по 5 видам животных (psy, mačky, malé zvieratá / hlodavce,
   vtáky, ryby), особенно «exotický veterinár».

## Правила

- Опираться на реальные данные (Google Keyword Planner, Ahrefs/Semrush
  free, Google Trends, подсказки Google), не на ощущение. Указывать
  источник каждой цифры.
- Слаги без диакритики, через дефис.

## Готово, когда

- Файл `docs/seo/slovak-keywords.md` в PR с таблицей и рекомендациями.
  Код не трогать: замену слагов делает исполнитель сайта после мерджа.
