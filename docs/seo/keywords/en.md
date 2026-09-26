# Ключевые слова: английский (`en`)

**Дата сбора данных:** 2026-09-26  
**Источники:**
- Google Suggest API (Slovakia, `hl=en`, `gl=sk`), проверка полных запросов и префиксов;
- Google Trends (Slovakia, `today 12-m`, относительный индекс 0–100 внутри групп синонимов);
- Google Live Search SERP & Expat communities (Reddit r/Bratislava, Facebook expat groups);
- Оценки диапазонов объёма (Google Ads Keyword Planner: Slovakia, English). Прямой доступ к Keyword Planner без активного рекламного аккаунта недоступен (по протоколу отмечены ориентировочные диапазоны `0–10` / `10–100`).

Формат и правила — `README.md`. Английские категории уже разобраны
качественно, без цифр: `../english-keywords.md` (слаги подтверждены,
`pet-training` → `dog-training`). Здесь — цифры для категорий и карта
для типов страниц, появившихся позже: признаки и цены. Цифры вписаны
по задаче `tasks/antigravity-keywords-en.md`.

Спрос на английском в Братиславе небольшой (оценка: 100–400 запросов в
месяц на все категории суммарно, `english-keywords.md` §1). Большинство
узких запросов находится в диапазоне «0–10» или «10–100», при этом ценность
и готовность платить у экспат-аудитории максимальная.

## 1. Категории (проверка цифрами)

| Смысл | Сейчас на сайте (title) | Варианты запроса | Planner | Trends | Подсказка | Решение |
|---|---|---|---|---|---|---|
| Ветеринар | «Vets & Veterinary Clinics» | vet bratislava | 10–100 | 100 | áno | **главный**: в `<title>`, H1; слаг `/vet-clinics/` подтверждён |
| | | veterinarian bratislava | 0–10 | 15 | áno | второй: в description, текст (подсказывает `vet bratislava`) |
| | | vet clinic bratislava | 10–100 | 45 | áno | второй: в title «Vets & Veterinary Clinics» и H1 |
| | | english speaking vet bratislava | 0–10 | 10 | nie | второй: вынести в отдельную страницу-признак (см. разд. 2) |
| Груминг | «Dog & Cat Grooming» | dog grooming bratislava | 10–100 | 100 | áno | **главный**: в `<title>`, H1; слаг `/grooming/` подтверждён |
| | | dog groomer bratislava | 0–10 | 20 | áno | второй: в description, текст |
| | | cat grooming bratislava | 0–10 | 15 | áno | второй: фильтр/подкатегория для кошек |
| Гостиница | «Pet Hotels & Dog Boarding» | dog hotel bratislava | 10–100 | 100 | áno | **главный**: в `<title>`, H1 («Dog Hotels & Pet Boarding») |
| | | dog boarding bratislava | 0–10 | 25 | áno | второй: в title («Dog Boarding»), meta description |
| | | pet hotel bratislava | 0–10 | 35 | áno | второй: слаг `/pet-hotels/` удерживает категорию для собак и кошек |
| | | dog daycare bratislava | 0–10 | 30 | áno | второй: услуга дневного пребывания (daycare) |
| Дрессировка | «Dog Training & Puppy Classes» | dog training bratislava | 10–100 | 100 | áno | **главный**: в `<title>`, H1; **смена слага** `pet-training` → `dog-training` |
| | | dog trainer bratislava | 0–10 | 40 | áno | второй: в description, текст |
| | | puppy classes bratislava | 0–10 | <10 | nie | второй: в фильтры/услуги для щенков |
| Зоомагазин | «Pet Shops» | pet shop bratislava | 10–100 | 100 | áno | **главный**: в `<title>`, H1; слаг `/pet-shops/` |
| | | pet store bratislava | 10–100 | 70 | áno | второй: в description, синоним |
| Передержка | «Pet Sitters & Dog Walkers» | dog sitter bratislava | 0–10 | 100 | áno | **главный**: в `<title>`, H1; слаг `/pet-sitting/` |
| | | cat sitter bratislava | 0–10 | 50 | áno | второй: в фильтр/услуги для кошек |
| | | dog walker bratislava | 0–10 | 45 | áno | второй: в фильтр/услуги по выгулу |

## 2. Признаки ветклиник

| Смысл | Сейчас на сайте | Варианты запроса | Planner | Trends | Подсказка | Решение |
|---|---|---|---|---|---|---|
| Круглосуточно | `…/nonstop/` | emergency vet bratislava | 0–10 | 100 | áno | **главный**: в `<title>`: «Emergency Vet in Bratislava (24/7)» |
| | | 24 hour vet bratislava | 0–10 | 30 | nie | второй: в description, текст |
| | | 24/7 vet bratislava | 0–10 | 20 | nie | второй: в description, бейджи |
| Выходные | `…/open-saturday/`, `…/open-sunday/` | weekend vet bratislava | 0–10 | 100 | áno | **главный**: для страниц ухода в выходные (подсказывает `emergency vet`) |
| | | vet open sunday bratislava | 0–10 | 25 | nie | второй: для страницы `…/open-sunday/` |
| Экзоты | `…/exotic-animals/` | exotic vet bratislava | 0–10 | 100 | nie | **главный**: title «Exotic Animal Vets in Bratislava» |
| | | rabbit vet bratislava | 0–10 | 30 | nie | второй: в фильтры/описание мелких млекопитающих |
| Выезд | `…/home-visits/` | mobile vet bratislava | 0–10 | 100 | nie | **главный**: title «Mobile Vet & Home Visits in Bratislava» |
| | | vet home visit bratislava | 0–10 | 50 | nie | второй: в description, синоним |
| Язык врача | страницы нет | english speaking vet bratislava | 0–10 | 100 | nie | **главный**: **рекомендуется создать страницу-признак** `…/vet-clinics/bratislava/english-speaking/`. Спрос узкий (0–10 в месяц), но конверсия и ценность для экспатов максимальны; конкуренции в поиске нет. Поле `languages_spoken` уже есть в БД |

## 3. Цены

| Услуга | Сейчас на сайте | Варианты запроса | Planner | Trends | Подсказка | Решение |
|---|---|---|---|---|---|---|
| Цены ветклиник | `…/vet-clinics/bratislava/prices/` | vet prices bratislava | 0–10 | 100 | nie | **главный**: title «Vet Prices & Clinic Fees in Bratislava» |
| | | vet cost slovakia | 0–10 | 60 | nie | второй: в description, FAQ |
| Кастрация кошек | `cat-neutering`, `cat-spaying` | cat neutering cost bratislava | 0–10 | 100 | nie | **главный**: для страницы цен кастрации кошек |
| Стерилизация собак | `dog-spaying` | dog spay cost slovakia | 0–10 | 100 | nie | **главный**: для страницы цен стерилизации собак |
| Вакцинация | `dog-vaccination` | dog vaccination cost slovakia | 0–10 | 100 | nie | **главный**: для страницы цен на вакцинацию |
| Чипирование | `microchip` | dog microchip slovakia | 0–10 | 100 | nie | **главный**: для страницы цен на микрочипирование |
| Груминг | `…/grooming/bratislava/prices/` | dog grooming prices bratislava | 0–10 | 100 | nie | **главный**: title «Dog Grooming Prices in Bratislava» |
| Гостиница | `dog-per-night` | dog hotel price bratislava | 0–10 | 100 | nie | **главный**: title «Dog Hotel & Boarding Prices in Bratislava» |

## 4. На будущее (справочники для экспатов)

| Тема гида | Варианты запроса | Planner | Trends | Подсказка | Решение |
|---|---|---|---|---|---|
| Паспорт животного | pet passport slovakia | 10–100 | 100 | áno | **главный кандидат в статью/гайд**: активные подсказки в Google («pet passport slovakia», «pet passport cost», «example») |
| Налог на собаку | dog tax bratislava | 0–10 | 40 | nie | второй: практический гайд по оплате налога в районах Братиславы |
| Регистрация | register dog slovakia | 0–10 | 30 | nie | второй: гайд по обязательной регистрации и чипу |
| Ввоз питомца | bring dog to slovakia | 0–10 | 25 | nie | второй: гайд по правилам ввоза из ЕС и третьих стран |
| Переезд | moving to slovakia with a dog | 0–10 | 20 | nie | второй: чек-лист релокации с собакой |
