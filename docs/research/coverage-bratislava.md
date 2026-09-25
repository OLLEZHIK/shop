# Исследование покрытия Братиславы: кандидаты на добавление и аудит каталога

> Дата исследования: 2026-09-25  
> Исполнитель: Antigravity (Data & Research Agent)  
> Цель: анализ полноты каталога в Братиславе по 6 ключевым категориям и строгий аудит актуальности текущей базы (76 записей в `data/*.csv`).

---

## Сводка результатов

- **Всего кандидатов на добавление (Раздел A):** 27 строго проверенных заведений
  - Ветклиники (`veterinary`): 6 (при целевых 5–7)
  - Салоны груминга (`grooming`): 5 (при целевых 5–6)
  - Отели для животных (`hotel`): 3 (при целевых 3)
  - Дрессировка и кинология (`training`): 3 (при целевых 3)
  - Зоомагазины и корма (`shop`): 8 (при целевых 5–8)
  - Передержка и присмотр (`sitting`): 2 (при целевых 2–3)
- **Подтверждённые проблемные кейсы из текущей базы (Раздел B):** 1 заведение из 76 проверенных (`Goio Pet Shop` — навсегда закрыт на Google Maps).
- **Снятые подозрения (проверены, работают):** `Zuzalo`, `ERPOL`, `AHAvet`, `EuroVet` и `Ako doma`.

---

## Методология и инструменты строгой верификации

Каждая запись в разделах A и B прошла трёхэтапную инструментальную проверку:
1. **Проверка DNS и домена:** Вызов системного резолвера `socket.gethostbyname` для исключения неразрешимых доменов (`ENOTFOUND`) и заброшенных адресов.
2. **Проверка HTTP-доступности и заголовков:** Запросы через `curl.exe -s -I -L --max-time 10` для валидации кодов ответа (HTTP 200/301/302) и извлечения точного содержимого тега `<title>`.
3. **Прямая верификация карточки Google Maps:** Запросы к Google Places API (`Place.searchByText` и `Place.fetchFields` через браузер Playwright Chromium) с извлечением прямого Place ID, статуса работы бизнеса (`businessStatus: OPERATIONAL / CLOSED_PERMANENTLY`), точного названия в карточке и постоянной ссылки с параметром CID (`https://maps.google.com/?cid=<cid>`).

Рейтинги и количество отзывов исключены из Раздела A (не требуются для задачи исследования покрытия).

---

## A. Кандидаты на добавление в Братиславе

Все кандидаты верифицированы на независимых источниках, имеют подтверждённый статус `OPERATIONAL` в Google Maps и действующий официальный сайт или страницу в соцсети.

### 1. Ветеринарные клиники (`veterinary`)

| name | category | address | district | official website / соцсеть | где нашли | google_maps_url | evidence |
|---|---|---|---|---|---|---|---|
| AhojVET | veterinary | Hummelova 4, 811 03 Bratislava | stare-mesto | https://ahojvet.sk | tippytaps.sk / Google Maps | https://maps.google.com/?cid=12735830244754532698 | Google Maps: `AhojVet` (OPERATIONAL); Web `<title>`: `AhojVet – Veterinárna ambulancia` (2026-09-25) |
| Veterinárna klinika AMIS | veterinary | Kostlivého 17, 821 03 Bratislava | ruzinov | http://www.amisveterina.sk | tippytaps.sk / Google Maps | https://maps.google.com/?cid=7506715500111079492 | Google Maps: `Amis - Veterinárna klinika - MVDr. Róbert Furenda` (OPERATIONAL); Web `<title>`: `Amis veterinárna klinika` (2026-09-25) |
| Veterina Inak Centrum | veterinary | Račianska 80, 831 02 Bratislava | nove-mesto | https://veterinainakcentrum.sk | tippytaps.sk / Google Maps | https://maps.google.com/?cid=11718839467295605915 | Google Maps: `Veterina Inak Centrum` (OPERATIONAL); Web `<title>`: `Domov \| Veterinainak Centrum` (2026-09-25) |
| X-VET Veterinárna klinika | veterinary | M. Schneidera-Trnavského 8, 841 01 Bratislava | dubravka | https://x-vet.sk | Google Maps / Zoznam.sk | https://maps.google.com/?cid=7145937462506657939 | Google Maps: `Veterinárna klinika X-VET` (OPERATIONAL); Web `<title>`: `Vaša veterinárna klinika Bratislava \| X - vet` (2026-09-25) |
| Veterinárna ambulancia Čunovo | veterinary | Hraničiarska 2, 851 10 Bratislava | cunovo | https://veterinacunovo.sk | Google Maps / Oma.sk | https://maps.google.com/?cid=15170159783201861596 | Google Maps: `Veterinárna Ambulancia` (OPERATIONAL); Web `<title>`: `Veterina Čunovo — Rodinná veterinárna ambulancia` (2026-09-25) |
| Veterinárna ambulancia MVDr. Alexander Baxa | veterinary | Nejedlého 6, 841 02 Bratislava | dubravka | https://www.facebook.com/p/Veterin%C3%A1rna-ambulancia-MVDr-Alexander-Baxa-100064095431627/ | Google Maps / ZZZ.sk | https://maps.google.com/?cid=10556217261036128073 | Google Maps: `MVDr. Alexander Baxa` (OPERATIONAL); Офиц. страница Facebook активна (2026-09-25) |

### 2. Салоны груминга (`grooming`)

| name | category | address | district | official website / соцсеть | где нашли | google_maps_url | evidence |
|---|---|---|---|---|---|---|---|
| Fluffy Puffy | grooming | Obchodná 66, 811 06 Bratislava | stare-mesto | https://fluffypuffygrooming.com | tippytaps.sk / Google Maps | https://maps.google.com/?cid=14730884322721278512 | Google Maps: `Fluffy Puffy-Dog Grooming Bratislava` (OPERATIONAL); Web `<title>`: `Fluffy Puffy - psí salón v centre Bratislavy` (2026-09-25) |
| Biele Labky | grooming | Agátová 7C, 841 01 Bratislava | dubravka | https://salon.bielelabky.sk | Google Maps / tippytaps.sk | https://maps.google.com/?cid=17332156112998361121 | Google Maps: `Biele Labky - psi salon` (OPERATIONAL); Web `<title>`: `Psí salón Bratislava – Strihanie psov \| Biele Labky` (2026-09-25) |
| Hafanana psí salón | grooming | Rustaveliho 11, 831 06 Bratislava | raca | https://hafanana.sk | Google Maps / tippytaps.sk | https://maps.google.com/?cid=3752316444127014003 | Google Maps: `Hafanana Salón Pre Psov` (OPERATIONAL); Web `<title>`: `Hafanana` (2026-09-25) |
| Dogbar & Lounge | grooming | Ružinovská 44, 821 03 Bratislava | ruzinov | https://dogbar.sk | Google Maps / tippytaps.sk | https://maps.google.com/?cid=3087978581504618253 | Google Maps: `Dog Bar & DOGBARBERS - Kaviareň, Psia škôlka, psí salón a PUPPY PILATES` (OPERATIONAL); Web `<title>`: `Škôlka pre psov a kaviareň v Bratislave \| Dog Bar & Lounge` (2026-09-25) |
| YellowDog psí salón | grooming | Bradáčová 1, 851 02 Bratislava | petrzalka | https://yellowdog.sk | Google Maps / tippytaps.sk | https://maps.google.com/?cid=5204644865443937071 | Google Maps: `Yellow Dog - Salón pre psov a mačky v Bratislave` (OPERATIONAL); Web `<title>`: `Psí salón Bratislava (psí salón Petržalka) \| YellowDog` (2026-09-25) |

### 3. Отели для животных (`hotel`)

| name | category | address | district | official website / соцсеть | где нашли | google_maps_url | evidence |
|---|---|---|---|---|---|---|---|
| Pamlskovo - Psia škôlka a Hotel | hotel | Studená 2, 821 04 Bratislava | ruzinov | https://www.instagram.com/pamlskovo.skolka/ | Google Maps | https://maps.google.com/?cid=3702790171089170717 | Google Maps: `Pamlskovo - Psia škôlka a Hotel` (OPERATIONAL); Офиц. Instagram @pamlskovo.skolka активен (2026-09-25) |
| Hotel pre psy u Zuzany | hotel | Devínske jazero 6825, 841 07 Bratislava | devinska-nova-ves | http://www.hotelprepsov.wbl.sk/ | Google Maps | https://maps.google.com/?cid=2869637406214030649 | Google Maps: `Hotel pre psy u Zuzany` (OPERATIONAL); Web `<title>`: `Vitajte u nás... : \| hotel pre psov` (2026-09-25) |
| Hotelprepsa.sk | hotel | Javorová 936, 900 46 Most pri Bratislave (за пределами Братиславы, довоз по городу) | | https://hotelprepsa.sk | tippytaps.sk / Web search | https://maps.google.com/?cid=263924419891654096 | Google Maps: `Hotelprepsa.sk - Hotel pre psov` (OPERATIONAL, довоз по Братиславе); Web `<title>`: `Hotel pre psa pri Bratislave – rodinný pobyt bez klietok \| Hotelprepsa.sk` (2026-09-25) |

### 4. Дрессировка и кинологические клубы (`training`)

| name | category | address | district | official website / соцсеть | где нашли | google_maps_url | evidence |
|---|---|---|---|---|---|---|---|
| Kynologický klub Matis | training | Betliarska 22, 851 07 Bratislava | petrzalka | https://www.vycvikpsov-matis.sk | Google Maps / Zoznam.sk | https://maps.google.com/?cid=15764869637021504621 | Google Maps: `KK Matis` (OPERATIONAL); Web `<title>`: `kkmatis` (2026-09-25) |
| Bratislavská kynologická záchranárska brigáda (BKZB) | training | Ružinovská 15941, 821 02 Bratislava | ruzinov | https://zachranarskypes.sk | Google Maps / Dogforum.sk | https://maps.google.com/?cid=16682522855993305993 | Google Maps: `Bratislavská kynologická záchranárska brigáda` (OPERATIONAL); Web `<title>`: `Záchranársky pes - BKZB` (2026-09-25) |
| Výcviková škola pre vodiace a asistenčné psy | training | Rovniankova 1668/16, 851 02 Bratislava | petrzalka | https://vodiacipes.sk | Google Maps / Karlova Ves | https://maps.google.com/?cid=13204862865141201253 | Google Maps: `Výcviková škola pre vodiace a asistenčné psy.` (OPERATIONAL); Web `<title>`: `Aktuality \| Výcviková škola pre vodiace a asistenčné psy` (2026-09-25) |

### 5. Зоомагазины и специализированные корма (`shop`)

| name | category | address | district | official website / соцсеть | где нашли | google_maps_url | evidence |
|---|---|---|---|---|---|---|---|
| Barfdog | shop | Hradská 3G, 821 07 Bratislava | vrakuna | https://barfdog.sk | Google Maps / Web search | https://maps.google.com/?cid=14911859903442797212 | Google Maps: `Barf Dog` (OPERATIONAL); Web `<title>`: `BARF strava - najlepšia strava pre psa – Barfovanie \| Barfdog.sk` (2026-09-25) |
| BARFuj s Dobym | shop | Holíčska 48, 851 05 Bratislava | petrzalka | https://barfujsdobym.sk | Google Maps / Web search | https://maps.google.com/?cid=16251737557253060530 | Google Maps: `Barfuj s Dobym` (OPERATIONAL); Web `<title>`: `BARF - Kvalitná prirodzená strava pre psov \| BARFuj s Dobym` (2026-09-25) |
| Super zoo – Avion Shopping Park | shop | Ivanská cesta 16, 821 04 Bratislava | ruzinov | https://www.superzoo.sk | Google Maps | https://maps.google.com/?cid=15200561217822311931 | Google Maps: `Super zoo` (OPERATIONAL, Avion); Web `<title>`: `Chovateľské potreby \| Pretože zvieratká milujeme \| Super zoo` (2026-09-25) |
| Super zoo – Bory Mall | shop | Lamač 6780, 841 06 Bratislava | lamac | https://www.superzoo.sk | Google Maps | https://maps.google.com/?cid=6934589449029578075 | Google Maps: `Super zoo` (OPERATIONAL, Bory Mall); Web `<title>`: `Chovateľské potreby \| Pretože zvieratká milujeme \| Super zoo` (2026-09-25) |
| Super zoo – OC Danubia | shop | Panónska cesta 16, 851 04 Bratislava | petrzalka | https://www.superzoo.sk | Google Maps | https://maps.google.com/?cid=13917719751582380906 | Google Maps: `Super zoo` (OPERATIONAL, OC Danubia); Web `<title>`: `Chovateľské potreby \| Pretože zvieratká milujeme \| Super zoo` (2026-09-25) |
| Pet Center – OC Retro | shop | Nevädzová 6, 821 02 Bratislava | ruzinov | https://www.petcenter.sk | Google Maps | https://maps.google.com/?cid=170648519927289525 | Google Maps: `pet center` (OPERATIONAL, OC Retro); Web `<title>`: `PetCenter.sk - Všetko čo zvieratá milujú` (2026-09-25) |
| Pet Center – OC Galéria Lamač | shop | Lamačská cesta 1C, 841 04 Bratislava | lamac | https://www.petcenter.sk | Google Maps | https://maps.google.com/?cid=7140689945060948110 | Google Maps: `Pet Center` (OPERATIONAL, OC Galéria Lamač); Web `<title>`: `PetCenter.sk - Všetko čo zvieratá milujú` (2026-09-25) |
| Pet Center – Shopping Palace | shop | Cesta na Senec 2/A, 821 04 Bratislava | ruzinov | https://www.petcenter.sk | Google Maps | https://maps.google.com/?cid=12146876816184466298 | Google Maps: `Pet Center` (OPERATIONAL, Shopping Palace Zlaté Piesky); Web `<title>`: `PetCenter.sk - Všetko čo zvieratá milujú` (2026-09-25) |

### 6. Передержка, выгул и дневной присмотр (`sitting`)

| name | category | address | district | official website / соцсеть | где нашли | google_maps_url | evidence |
|---|---|---|---|---|---|---|---|
| Pazúrikovo - zvieracia pestúnka | sitting | Švabinského 1063/5, 851 01 Bratislava | petrzalka | https://www.pazurikovo.sk | Google Maps / Web search | https://maps.google.com/?cid=18019535218936081643 | Google Maps: `Pazúrikovo - zvieracia pestúnka` (OPERATIONAL); Web `<title>`: `zvieracia pestúnka-stráženie zvierat, strihanie pazúrov, venčenie` (2026-09-25) |
| Psia škôlka a Caffetéria | sitting | Mánesovo námestie 1, 851 01 Bratislava | petrzalka | https://www.facebook.com/psiaskolkaacaffeteria | Google Maps | https://maps.google.com/?cid=4581277736092077241 | Google Maps: `Psia škôlka a Caffetéria` (OPERATIONAL); Офиц. страница Facebook активна (2026-09-25) |

---

## B. Кто из наших заведений проблемный или закрыт

Был проверен статус доступности сайтов (HTTP GET/HEAD) и карточек Google Maps (`businessStatus`) для всех **76 записей** из текущих файлов:
- `data/salons-bratislava.csv` (10 записей)
- `data/pet-hotels-bratislava.csv` (11 записей)
- `data/other-pet-services-bratislava.csv` (21 запись)
- `data/vet-clinics-bratislava.csv` (34 записи)

### Подтверждённые проблемные кейсы

| name | файл | google_maps_url | статус проблемы | доказательство (evidence) | дата проверки |
|---|---|---|---|---|---|
| Goio Pet Shop | data/other-pet-services-bratislava.csv | https://maps.google.com/?cid=7890112999246410043 | CLOSED_PERMANENTLY | Карточка Google Maps `Goio Pet Shop` (Bosákova 9, Petržalka) имеет официальный статус `CLOSED_PERMANENTLY`. Интернет-магазин на домене `goiopet.sk` (`Goio Pet – Chovateľské potreby`) продолжает работу, однако физическая торговая точка в Братиславе закрыта навсегда. | 2026-09-25 |

### Снятые подозрения (проверены, работают)

В ходе углублённой повторной проверки подтверждена нормальная деятельность следующих заведений:
1. **Zuzalo – Chovateľské potreby** (`data/other-pet-services-bratislava.csv`):
   - На официальном сайте `https://www.zuzalo.sk` прямо указана работа физического магазина: «Našu ponuku si môžete pozrieť aj osobne v našej predajni na Dunajskej ulici 64» с разделом «Kamenná predajňa».
   - Карточка Google Maps [cid=3489456233210268401](https://maps.google.com/?cid=3489456233210268401) (`Zuzalo - Chovateľské potreby`, Dunajská 64) активна со статусом `OPERATIONAL`. Заведение функционирует.
2. **ERPOL – Výcvik psov Bratislava** (`data/other-pet-services-bratislava.csv`):
   - Сайт `https://psivycvik.sk` полностью доступен (HTTP 200 OK, заголовок: `ERPOL Výcvik psov Bratislava - Dúbravka`).
   - Карточка Google Maps [cid=8892529814110688098](https://maps.google.com/?cid=8892529814110688098) (`Eva Poľanská - ERPOL`, Lipského 17) активна со статусом `OPERATIONAL`.
3. **Veterinárna ambulancia AHAvet** (`data/vet-clinics-bratislava.csv`):
   - Домен `https://ahavet.sk` доступен (HTTP 200 OK).
   - Карточка Google Maps [cid=13890847067888717291](https://maps.google.com/?cid=13890847067888717291) (`veterinárna klinika`, Ľ. Fullu 7, Karlova Ves) активна со статусом `OPERATIONAL`.
   - Отсутствие рейтинга в CSV обусловлено малым числом отзывов (<5), приём пациентов ведётся.
4. **EuroVet veterinárna ambulancia** (`data/vet-clinics-bratislava.csv`):
   - Сайт `http://www.eurovet.sk` доступен (HTTP 200 OK, заголовок: `EuroVet - Veterinarna ordinacia, veterinar, Petrzalka`).
   - Карточка Google Maps [cid=9860026320715689021](https://maps.google.com/?cid=9860026320715689021) (`EuroVet - veterinárna ambulancia`, Strečnianska 4, Petržalka) активна со статусом `OPERATIONAL`.
5. **Ako doma - Hotel pre psov** (`data/pet-hotels-bratislava.csv`):
   - Сайт `http://ako-doma.sk` активен (HTTP 200 OK, заголовок: `AKO DOMA – HOTEL PRE PSOV – Stráženie a starostlivosť o vašich domácich miláčikov`).
   - Представляет собой домашнюю квартирную передержку мелких собак в Петржалке. Заведение функционирует.

---

## Рекомендации для владельца проекта и следующих задач

1. **Исключение недействующей точки в CSV:**
   - `Goio Pet Shop` имеет официальный статус `CLOSED_PERMANENTLY` в Google Maps — исключить из публичной выдачи оффлайн-точек или пометить соответствующим флагом.

2. **Пополнение каталога проверенными кандидатами:**
   - 27 верифицированных кандидатов готовы к добавлению в соответствующие CSV-файлы в рамках последующих задач. Они полностью закрывают дефицит в категориях «салоны груминга» (+5 заведений), «зоомагазины» (+8 заведений), расширяют базу ветклиник (+6), отелей (+3), кинологических клубов (+3) и служб присмотра (+2).
