# Задача: дособрать карточки Братиславы до минимума качества

**Исполнитель:** Antigravity
**Роль:** Data agent.
**Тип:** сбор и проверка данных, объём средний.
**Ветка:** `antigravity/complete-bratislava-cards`
**Зависимости:** нет. Заменяет `antigravity-recheck-ratings-bratislava`
(та отменена и вошла сюда).

## Зачем

Решение владельца (2026-09-25): карточка заведения — главный контент
сайта, без логотипа и рейтинга она выглядит плохо. Введён минимум
качества по городу и скрипт, который его проверяет:
`docs/card-spec.md`, раздел «Минимум качества». **Прочитать его и
`docs/playbooks/add-city.md`, разделы 4, 4.1 и 5, перед началом** — там
по шагам, где и как искать каждое поле.

Сейчас (`cd website && npm run check-city -- bratislava`):

```
description + _local            0/76      0%   100%  FAIL
lat / lng                      74/76     97%   100%  FAIL
google_maps_url                56/76     74%    95%  FAIL
logo                           58/76     76%    80%  FAIL
google_rating                  57/76     75%    85%  FAIL
opening_hours                  76/76    100%    90%  ok
```

Часы работы и 31 логотип уже перенесены из веток
`mac/collect-hours-and-vet-services` и PR #73 (облачный Claude Code,
2026-09-25).

## Что сделать

Работать только в `data/cities/bratislava/businesses.csv` и
`website/public/logos/bratislava/`.

### 1. Карточка Google Maps, рейтинг, логотип, координаты

Для каждого заведения из таблицы найти то, чего не хватает, **строго по
порядку поиска** из `add-city.md` (карточку Google — по названию,
адресу, телефону, сайту и вариантам названия; логотип — сайт → иконки
сайта → Facebook → Instagram → бренд сети).

Одна пометка про «<5 reviews» без описания поиска не принимается: у
Dog's Beauty & Wellness так было записано, а на Google Maps у салона
4,9 и 31 оценка.

| Категория | slug | Не хватает |
|---|---|---|
| GROOMING | `psi-salon-vesela-labka-ruzinov` | rating, maps |
| GROOMING | `dog-culture` | rating, maps |
| GROOMING | `psi-salon-zuzana` | logo |
| GROOMING | `psi-salon-my-champ` | logo (в PR #73 был найден `mychamp.sk/MC logo.png` — проверить) |
| GROOMING | `salon-pre-psov-labku-na-to` | logo |
| GROOMING | `dog-s-beauty-wellness` | maps |
| VET_CLINIC | `veterinarna-klinika-primavet` | logo (SVG из PR #73 пустой на белом фоне — нужен другой файл) |
| VET_CLINIC | `super-zoo-veterina` | logo (файл из PR #73 нечитаем), rating, maps |
| VET_CLINIC | `eurovet-veterinarna-ambulancia` | logo, rating, maps |
| VET_CLINIC | `dermavet-veterinarna-ambulancia` | rating, maps |
| VET_CLINIC | `veterinarna-ambulancia-kocur` | logo |
| VET_CLINIC | `veterinarna-ambulancia-bhvet` | logo (SVG из PR #73 пустой) |
| VET_CLINIC | `veterinarna-poliklinika-jarovce-mvdr-milan-svihran` | logo |
| PET_HOTEL | `salon-a-hotel-pre-psov-havko` | logo (в PR #73 было фото кошки, не логотип) |
| PET_HOTEL | `dewen-dog-hotel` | logo |
| PET_HOTEL | `dogtrainer-peter-peller` | rating, maps; по названию это дрессировщик — написать в PR, что нашёл, категорию не менять |
| PET_HOTEL | `ako-doma-hotel-pre-psov` | logo (белый на белом — нужен цветной вариант), rating, maps |
| PET_SITTING | `opatrovanie-maciek-bratislava-adriana-tankova` | rating, maps, coords |
| PET_SITTING | `petme-bratislava` | rating, maps, coords |
| DOG_TRAINING | `doggie-vycvikova-skola` | rating, maps |
| DOG_TRAINING | `erpol-vycvik-psov-bratislava` | logo, rating, maps |
| DOG_TRAINING | `klub-sportovej-kynologie-1-ksk-1` | logo (файл из PR #73 слишком бледный), rating, maps |
| DOG_TRAINING | `kynologicky-klub-lamac` | rating, maps |
| PET_SHOP | `zuzalo-chovatelske-potreby` | rating, maps |
| PET_SHOP | `sponzia-chovatelske-potreby` | logo, rating, maps |
| PET_SHOP | `goio-pet-shop` | logo (SVG из PR #73 пустой) |
| PET_SHOP | `chovatelske-potreby-fanzy` | logo, rating, maps |
| PET_SHOP | `super-zoo-aupark` | rating, maps (карточка филиала в OC Aupark) |
| PET_SHOP | `petcenter-stanica-nivy` | rating, maps (карточка филиала) |
| PET_SHOP | `petcenter-oc-galeria-petrzalka` | rating, maps (карточка филиала) |
| PET_SHOP | `lekaren-humavet` | logo |

Не нашлось после всех шагов — пустое поле и строка в `notes` в формате
`logo: none (...)` / `rating: none (...)` с тем, где искали. Старые
пометки «no Google rating: …» заменить на этот формат.

Для ситтеров без адреса (`coords`): координаты — точка района, где они
работают, только если он указан на их сайте; в `notes` — «coords: area
centre (<район>)». Не указан — оставить пустым и написать в PR.

### 2. `description_local` у всех 76

`description` (английский, 2–4 предложения) есть у всех, словацкой
версии нет ни у кого. Написать `description_local` по правилам
`docs/card-spec.md` (раздел 2) и `add-city.md` (раздел 3): своими
словами, естественно по-словацки, не дословный перевод, только факты
из `description`.

## Чего не делать

- Не выдумывать данные (`AGENTS.md`), не брать логотипы и рейтинги из
  каталогов и агрегаторов.
- Не менять заполненные поля, кроме старых пометок в `notes`.
- Не трогать `prices.csv` и `review-insights/` (для цен отдельная
  задача `antigravity-prices-bratislava-v2`).

## Критерии готовности

- `cd website && npm run check-city -- bratislava` печатает `READY`;
  вывод целиком — в описании PR.
- Все новые логотипы просмотрены на белом фоне в размере ~64 px
  (`add-city.md`, раздел 5).
- В PR — список заведений, где ничего не нашлось, с тем, где искали.
- PR `Data: complete Bratislava cards` в `main`.
