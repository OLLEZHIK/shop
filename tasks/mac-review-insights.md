# Задача: «Что говорят клиенты» — сводки отзывов для Братиславы

**Исполнитель:** Antigravity (Mac)
**Роль:** Content / research agent.
**Тип:** контент по отзывам, объём средний.
**Ветка:** `mac/review-insights-rest` (пилот был в `antigravity/review-insights`, PR #63 — это не значит, что задача занята).
**Зависимости:** нет.

## Что сделать

Всё — по инструкции `docs/playbooks/review-insights.md` (формат,
правила, проверка, PR). Перед работой — `docs/playbooks/quality.md`.

- Город: `bratislava`. Места — из `data/cities/bratislava/businesses.csv`
  на момент старта, **с ≥ 20 оценками Google** и ≥ 5 отзывами с
  текстом за полгода (решение владельца 2026-09-26: Братислава —
  образец, полнота не цель).
- 10 мест пилота уже сделаны — их не переписывать, это эталон тона.
- Писать только новые файлы в `data/cities/bratislava/review-insights/`;
  `businesses.csv` и другие файлы не трогать.
- Можно несколькими PR по категориям: `mac/review-insights-rest-<категория>`.

## Готово, когда

- `cd website && npm run check-city -- bratislava` → `READY`, вывод в PR.
- Файлы для всех подходящих мест; в PR — таблица и список мест без
  файла с причиной (`docs/playbooks/review-insights.md`, «Проверка и PR»).
- В PR — заполненная самопроверка из `docs/playbooks/quality.md`.
