# Ключевые слова: словацкий (`sk`)

Дата сбора: **2026-09-26**.
Источники данных:
- **Google Trends** (Slovakia, период: 12 месяцев, относительный индекс 0–100 внутри групп сравнения смыслов).
- **Подсказки Google** (google.sk, локаль `sk-SK`, инкогнито / Google Suggest API).
- **Google Ads Keyword Planner**: нет доступа к аккаунту в CLI (шаг пропущен в соответствии с инструкцией п. 1 задачи, сбор проведён по шагам 2–3).

> Правка «левой руки» 2026-09-26 по указанию владельца: индексы Trends
> для редких запросов (районы, строки со `*`) — **ориентир, не
> статистика**: Trends такие объёмы не считает
> (`docs/playbooks/quality.md`, правило 2). Строки по районам не
> используются: районы отдельно не исследуем, районная страница берёт
> шаблон категории (`docs/seo/keywords/README.md`, раздел 3).

Город в запросах — Bratislava (и варианты без диакритики / с районами).
Колонка «Сейчас на сайте» — текущие URL и заголовки каталога.

---

## 1. Категории

| Смысл | Сейчас на сайте | Варианты запроса | Planner | Trends | Подсказка | Решение |
|---|---|---|---|---|---|---|
| Ветеринар | `/sk/veterinar/`, «Veterinárne ambulancie» | veterinár bratislava | — | 100 | áno | **главный** (в title, H1 и slug) |
| | | veterina bratislava | — | 35 | áno | **второй** (в описание, подзаголовки, текст) |
| | | veterinárna ambulancia bratislava | — | 7* | áno | **второй** (официальное наименование на сайте) |
| | | veterinárna klinika bratislava | — | 4* | áno | **второй** (в текст и фильтры) |
| | | zverolekár bratislava | — | 1* | áno | **нет** (разговорный/устаревший, низкий спрос) |
| | | veterinár petržalka | — | 97 | áno | **главный** для районной страницы Petržalka |
| | | veterinár ružinov | — | 60 | áno | **главный** для районной страницы Ružinov |
| | | veterina petržalka | — | 45 | áno | **второй** для района Petržalka |
| Груминг | `/sk/psi-salon/`, «Psie salóny» | strihanie psov bratislava | — | 100 | áno | **главный** (наибольший поисковый спрос в SK!) |
| | | psí salón bratislava | — | 85 | áno | **второй / текущий slug** (оставить slug `/sk/psi-salon/`, добавить «strihanie psov» в title и H1) |
| | | salón pre psov bratislava | — | 5* | áno | **второй** (в описание и тексты) |
| | | grooming bratislava | — | 0 | áno | **второй** (для экспатов) |
| | | psie kaderníctvo bratislava | — | 0 | áno | **нет** (малоупотребительно) |
| | | úprava psov bratislava | — | 0 | nie | **нет** |
| | | strihanie psov petržalka | — | 100 | áno | **главный** для района Petržalka |
| | | psí salón petržalka | — | 97 | nie | **второй** для района Petržalka |
| Гостиница | `/sk/hotel-pre-zvierata/`, «Hotely pre zvieratá» | hotel pre psov bratislava | — | 100* | áno | **главный** (самый популярный общий запрос) |
| | | psí hotel bratislava | — | 23* | áno | **второй** (в описание и синонимы) |
| | | hotel pre zvieratá bratislava | — | 13* | áno | **второй / текущий slug** (оставить slug для охвата всех животных, title уточнить «Hotel pre psov a zvieratá») |
| | | hotel pre mačky bratislava | — | 93 | áno | **главный** для фильтра / подстраницы кошек |
| | | mačací hotel bratislava | — | 15 | áno | **второй** для кошек |
| | | psia škôlka bratislava | — | 30 | áno | **главный** для дневного пребывания (škôlka) |
| | | penzión pre psov | — | 11* | áno | **нет** |
| Дрессировка | `/sk/vycvik-psov/`, «Výcvik psov» | výcvik psov bratislava | — | 100 | áno | **главный** (в title, H1 и slug) |
| | | cvičisko pre psov bratislava | — | 55* | áno | **второй** (в описание и справочник площадок) |
| | | kynológia / kynológ bratislava | — | 40* | áno | **второй** (в текст и теги) |
| | | kynologický klub bratislava | — | 11* | áno | **второй** (для клубов) |
| | | tréner psov bratislava | — | 10 | áno | **второй** (в текст) |
| | | psia škola bratislava | — | 0 | áno | **нет** |
| Зоомагазин | `/sk/chovatelske-potreby/`, «Chovateľské potreby» | zverimex bratislava | — | 100 | áno | **главный** народный запрос (добавить в title и H1!) |
| | | chovateľské potreby bratislava | — | 76 | áno | **второй / текущий slug** (официальное наименование, оставить slug `/sk/chovatelske-potreby/`) |
| | | pet shop bratislava | — | 45 | áno | **второй** (распространён у молодёжи и экспатов) |
| | | krmivo pre psov bratislava | — | 13* | nie | **нет** |
| | | potreby pre psov bratislava | — | 1* | áno | **нет** |
| Передержка / выгул | `/sk/opatrovanie-zvierat/`, «Opatrovanie zvierat» | venčenie psov bratislava | — | 100 | áno | **главный** для услуг выгула |
| | | stráženie psa bratislava | — | 70 | áno | **главный** для услуг передержки / присмотра |
| | | opatrovanie psov bratislava | — | 40 | áno | **второй / текущий slug** (оставить slug `/sk/opatrovanie-zvierat/`, в title вынести «Stráženie a venčenie psov») |
| | | dog sitter / dog sitting bratislava | — | 25 | áno | **второй** (экспатский спрос) |
| | | pet sitter / pet sitting bratislava | — | 10 | áno | **второй** |
| | | opatrovanie mačky počas dovolenky | — | 5 | nie | **нет** |

*\* Относительный индекс посчитан по общенациональному объёму базового термина в Google Trends (Slovakia), так как локальный гео-хвост дал одинаковые околонулевые значения из-за порога агрегации Trends.*

---

## 2. Признаки ветклиник

| Смысл | Сейчас на сайте | Варианты запроса | Planner | Trends | Подсказка | Решение |
|---|---|---|---|---|---|---|
| Круглосуточно | `…/nonstop/`, «Veterinár nonstop» | veterinárna pohotovosť bratislava | — | 100 | áno | **главный** поисковый запрос (в title и H1: «Veterinárna pohotovosť») |
| | | veterina nonstop bratislava | — | 40 | áno | **второй** (текущий slug `/nonstop/` удачен, оставить) |
| | | pohotovosť pre zvieratá bratislava | — | 15 | áno | **второй** |
| | | nočná veterina bratislava | — | 0 | nie | **нет** |
| | | veterinár 24 hodín / 24/7 | — | 0 | nie | **нет** |
| Суббота | `…/sobota/`, «Veterinár v sobotu» | veterinár sobota bratislava | — | 100 | áno | **главный** |
| | | veterina otvorená v sobotu | — | 15 | áno | **второй** |
| Воскресенье | `…/nedela/`, «Veterinár v nedeľu» | veterinár nedeľa bratislava | — | 100 | áno | **главный** |
| | | veterina cez víkend bratislava | — | 20 | nie | **второй** |
| Экзоты | `…/exoticke-zvierata/`, «Veterinár pre exoty» | exotický veterinár bratislava | — | 100 | áno | **главный** |
| | | veterinár pre exoty bratislava | — | 80 | nie | **второй** (текущий slug `/exoticke-zvierata/` удачен) |
| | | veterinár pre hlodavce | — | 40 | áno | **второй** (в текст и FAQ) |
| | | veterinár pre králiky | — | 35 | áno | **второй** (в текст и FAQ) |
| | | veterinár pre plazy | — | 20 | áno | **второй** |
| Выезд | `…/vyjazd-domov/`, «Veterinár domov» | veterinár domov bratislava | — | 100 | áno | **главный** |
| | | výjazdový veterinár bratislava | — | 45 | áno | **второй** |
| | | mobilný veterinár | — | 30 | áno | **второй** |

---

## 3. Цены

| Услуга | Сейчас на сайте | Варианты запроса | Planner | Trends | Подсказка | Решение |
|---|---|---|---|---|---|---|
| Обзор цен ветклиник | `…/veterinar/bratislava/ceny/` | veterina cenník bratislava | — | 100 | áno | **главный** |
| | | veterinár ceny bratislava | — | 20 | nie | **второй** |
| Кастрация кота | `kastracia-kocura` | kastrácia kocúra cena | — | 100 | áno | **главный** (точное попадание в slug) |
| | | kastrácia mačky cena (подразумевают кота) | — | 80 | áno | **второй** (в текст описания) |
| Кастрация кошки | `kastracia-macky` | kastrácia mačky cena | — | 100 | áno | **главный** (точное попадание в slug) |
| | | sterilizácia mačky cena | — | 65 | áno | **второй** (высокий параллельный спрос, обязательно в текст!) |
| Кастрация суки | `kastracia-suky` | kastrácia fenky cena | — | 100 | áno | **главный** народный запрос (люди ищут «fenka», а не «suka»! Добавить в title!) |
| | | kastrácia suky cena | — | 30 | áno | **второй / текущий slug** (оставить slug `kastracia-suky`, в title дать «Kastrácia fenky / suky») |
| | | sterilizácia suky / psa cena | — | 25 | áno | **второй** |
| Вакцинация | `ockovanie-psa` | očkovanie psa cena | — | 100 | áno | **главный** (точное совпадение со слагом) |
| | | očkovanie proti besnote cena | — | 40 | áno | **второй** |
| Чипирование | `cipovanie` | čipovanie psa cena | — | 100 | áno | **главный** |
| Осмотр | `vysetrenie` | vyšetrenie u veterinára cena | — | 0 | nie | **нет** (цену осмотра редко ищут отдельным запросом) |
| Обзор цен груминга | `…/psi-salon/bratislava/ceny/` | strihanie psa cena / cenník | — | 100 | áno | **главный** (ищут «strihanie psa cena») |
| | | psí salón cenník | — | 35 | nie | **второй** |
| Полный груминг | `kompletna-uprava` | strihanie psa cena | — | 100 | áno | **главный** |
| | | kompletná úprava psa cena | — | 0 | nie | **второй** (термин салонов, в описании) |
| Купание | `kupanie-a-fenovanie` | kúpanie psa cena | — | 100 | áno | **главный** |
| Тримминг | `trimovanie` | trimovanie psa cena | — | 100 | áno | **главный** |
| Вычёсывание | `vycesavanie-podsady` | vyčesávanie podsady cena | — | 100 | áno | **главный** |
| Когти | `strihanie-pazurikov` | strihanie pazúrov cena | — | 100 | áno | **главный** (чаще ищут «pazúrov», чем уменьшительное) |
| | | strihanie pazúrikov psa cena | — | 30 | nie | **второй / текущий slug** |
| Груминг кошки | `uprava-macky` | strihanie mačky cena | — | 20 | nie | **второй** |
| Гостиница, ночь | `pes-noc`, `macka-noc` | hotel pre psov cena (za noc) | — | 100 | áno | **главный** для собак |
| | | hotel pre mačky cena | — | 85 | áno | **главный** для кошек |
| Детский сад | `psia-skolka` | psia škôlka cena | — | 100 | áno | **главный** |
| Дрессировка | `kurz-poslusnosti`, `stenacia-skolka`, `individualna-hodina` | výcvik psa cena | — | 100 | áno | **главный** общий запрос цены |
| | | kurz poslušnosti cena | — | 70 | áno | **главный** для курсов |
| | | šteňacia škôlka cena | — | 15 | nie | **второй** |
| Выгул | `vencenie-30-min`, `vencenie-60-min` | venčenie psa cena | — | 100 | áno | **главный** |
| Передержка | `strazenie-u-vas-doma`, `strazenie-u-opatrovatela` | stráženie / opatrovanie psa cena | — | 100 | áno | **главный** |

---

## 4. На будущее (темы для справочников)

Цифры относительного спроса по данным Google Trends и подсказок Google (Slovakia):

| Тема / Запрос | Trends (0–100) | Подсказка Google | Потенциал темы |
|---|---|---|---|
| `pas pre psa` (международный паспорт, чип, выезд за границу) | **100** | áno («pas pre psa cena», «do auta») | **Очень высокий**: главная тема для гида |
| `čipovanie psa povinné` / закон об обязательной идентификации | **55** | áno («čipovanie psa cena 2025») | **Высокий**: частые вопросы владельцев |
| `daň za psa bratislava` (ставки по районам Staré Mesto, Ružinov, Petržalka) | **45** | áno («daň za psa bratislava staré mesto») | **Высокий**: локальная специфика каждого района |
| `očkovanie proti besnote povinné` (периодичность, законодательство SK) | **30** | áno («je ockovanie proti besnote povinne») | **Средний**: стабильный сезонный интерес |
| `veterinár po anglicky` / `english speaking vet` | **15** | áno («veterinár po anglicky») | **Умеренный / целевой**: полезно для страницы экспатов |
| `registrácia psa bratislava` | **10** | nie | **Низкий**: объединить со статьёй о налоге на собаку |
