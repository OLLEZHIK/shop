# Bratislava

Город в стандартном формате (`docs/playbooks/add-city.md`,
`docs/card-spec.md`). Перенесён сюда из старых `data/*-bratislava.csv`
2026-09-25.

## Переходный период: `businesses.csv` не править руками

Две задачи начаты до переезда и ещё пишут в старые файлы:

- часы работы и услуги ветклиник — ветка `mac/collect-hours-and-vet-services`
  (`data/*-bratislava.csv`);
- логотипы — PR #73 (`data/logos-bratislava.csv`, файлы в `website/public/logos/`).

Поэтому `city.json`, `businesses.csv` и `website/public/logos/bratislava/`
сейчас **генерируются** из старых файлов:

```
python3 scripts/migrate-bratislava.py
```

Оркестратор запускает скрипт после мерджа каждой из этих задач. Slug'и
считаются так же, как считал старый seed, — адреса страниц не меняются
(на 2026-09-25 все 76 совпадают с sitemap сайта).

Когда обе задачи смёржены и скрипт прогнан последний раз, удаляются:
`data/*-bratislava.csv`, `data/logos-bratislava.csv`,
`scripts/migrate-bratislava.py`, старый путь в `website/prisma/seed.ts`
(`seedLegacyBratislava`) и копии логотипов в корне
`website/public/logos/` (после того как боевая база пересеяна). После
этого всё здесь правится напрямую, как в любом другом городе.

## Уже только здесь (править напрямую)

- `prices.csv` — цены на 6 услуг категории. Собранные цены груминга
  (65 строк) и ветклиник (138 строк) переведены сюда один раз
  (97 строк для 20 заведений), старые файлы цен удалены. Как
  переводили: размеры собаки → диапазоны веса там, где салон пишет кг;
  где не пишет — одна строка «от — до» и размеры в `notes`; цены
  «od X €» — как «от»; услуги не из стандарта (стоматология, УЗИ,
  паспорт, кастрация кобеля) не переносились.
- `review-insights/<slug>.json` — сводки отзывов (`docs/playbooks/review-insights.md`).
- `districts.geojson` — полигоны районов (`website/scripts/fetch-districts.ts`).
