# Задача: перепроверить заведения Братиславы без рейтинга Google

**Исполнитель:** Antigravity
**Роль:** Data agent.
**Тип:** проверка данных, объём небольшой.
**Ветка:** `antigravity/recheck-ratings-bratislava`
**Зависимости:** нет.

## Контекст

У 20 из 76 заведений в `data/cities/bratislava/businesses.csv` нет
рейтинга Google. В `notes` почти везде стоит «<5 reviews». Владелец
проверил одно из них, Dog's Beauty & Wellness: на Google Maps у него
**4,9 и 31 отзыв** (исправлено вручную 2026-09-25). Значит, при сборе
данных карточку не нашли, хотя она есть.

Правило рейтинга — `docs/card-spec.md` (поля `google_rating`,
`google_rating_count`, `rating_observed_at`; меньше 5 оценок — пусто).

## Что сделать

Для каждого заведения ниже заново найти карточку на Google Maps:
- искать по названию **и** по адресу, по телефону и по сайту;
- проверить варианты названия: без «s.r.o.», на словацком и английском,
  название владельца (MVDr. …);
- у сетей (Super Zoo, Petcenter, Veselá Labka) — отдельная карточка
  конкретного филиала по адресу.

Нашёл карточку с 5+ оценками — заполнить `google_rating` (как на
карточке, `4.7`), `google_rating_count`, `rating_observed_at` (дата
проверки). Из `notes` убрать «no Google rating …».

Карточки действительно нет или оценок меньше 5 — оставить пустым, в
`notes` написать, что проверено и как искали: «no Google rating:
checked 2026-09-XX by name, address and phone — <5 reviews».

Заведение закрыто навсегда (так написано на карточке) — отметить в
`notes` «permanently closed (Google Maps)» и указать это в PR отдельным
списком: снимать ли его с сайта, решает оркестратор.

| Категория | slug |
|---|---|
| GROOMING | `psi-salon-vesela-labka-ruzinov` |
| GROOMING | `dog-culture` |
| VET_CLINIC | `super-zoo-veterina` |
| VET_CLINIC | `eurovet-veterinarna-ambulancia` |
| VET_CLINIC | `dermavet-veterinarna-ambulancia` |
| PET_HOTEL | `dogtrainer-peter-peller` (заодно проверить категорию: по названию это дрессировка) |
| PET_HOTEL | `ako-doma-hotel-pre-psov` |
| PET_SITTING | `opatrovanie-maciek-bratislava-adriana-tankova` |
| PET_SITTING | `petme-bratislava` |
| DOG_TRAINING | `doggie-vycvikova-skola` |
| DOG_TRAINING | `erpol-vycvik-psov-bratislava` |
| DOG_TRAINING | `klub-sportovej-kynologie-1-ksk-1` |
| DOG_TRAINING | `kynologicky-klub-lamac` |
| PET_SHOP | `zuzalo-chovatelske-potreby` |
| PET_SHOP | `sponzia-chovatelske-potreby` |
| PET_SHOP | `chovatelske-potreby-fanzy` |
| PET_SHOP | `super-zoo-aupark` |
| PET_SHOP | `petcenter-stanica-nivy` |
| PET_SHOP | `petcenter-oc-galeria-petrzalka` |

## Чего не делать

- Не выдумывать рейтинг и не брать его с других сайтов (Facebook,
  каталоги) — только Google Maps.
- Не менять другие поля и другие строки. Если заметил другую ошибку —
  опиши её в PR, не исправляй.
- Не менять категорию `dogtrainer-peter-peller` самому — только
  написать в PR, что нашёл.

## Критерии готовности

- Все 19 заведений проверены; у каждого либо рейтинг, либо в `notes`
  написано, как искали.
- В описании PR — таблица: slug → нашёл / нет карточки / <5 оценок /
  закрыто, со ссылкой на карточку Google Maps, где нашёл.
- PR `Ratings: Bratislava recheck` в `main`.
