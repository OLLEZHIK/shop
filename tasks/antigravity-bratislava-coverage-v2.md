# Задача: Братислава — добрать ветклиники до 50+ и цены

**Исполнитель:** Antigravity
**Роль:** Data agent.
**Тип:** сбор данных по городу.
**Ветка:** `antigravity/bratislava-coverage-v2`
**Зависимости:** нет.

## Зачем

Решение владельца (2026-09-25): для каталога полнота — главный продукт.
У нас 34 ветклиники Братиславы, у старых каталогов 52–56 (SEO-аудит
владельца). Каждое новое место и каждая сравнимая цена усиливают сразу
все страницы города: списки, районы, страницы цен (`/…/prices/…`) и
сравнение «выше/ниже рынка».

## Что сделать

Работать в `data/cities/bratislava/` по `docs/playbooks/add-city.md` и
`docs/card-spec.md` — **все поля карточки сразу**, как для нового
города, только для недостающих мест.

### 1. Ветклиники: довести до 50+

Кандидаты, которых у нас нет (найдены поиском 2026-09-25, **ничего не
проверено** — только отправная точка):

| Кандидат | Где | Откуда |
|---|---|---|
| Vetklinika | Ružinov | vetklinika.sk |
| MlynVet (MVDr. Andrej Barta) | Karlova Ves, Staré grunty 9/A | mlynvet.sk |
| MVDr. Dušan Jurášik | Petržalka, Topoľčianska 25 | каталоги (near-place) |
| Veterinárna ambulancia Veterinka | Ružinov, Dulovo námestie 13 | каталоги (polomap) |
| Klinika na Odborárskom námestí 4 | Nové Mesto | azet.sk (название уточнить) |
| MVDr. Vojtech Baculák | Devínska Nová Ves | zzz.sk |
| Zvierací Doktor | уточнить | zvieracidoktor.sk |
| Veterinárna ambulancia Petržalka | Gercenova 9 | Facebook — проверить, не тот же ли это `vetpetrzalka-veterinarna-ambulancia` |
| Veterina Vrakuňa | Hradská 58 | Facebook — проверить, не тот же ли это `veterinarna-klinika-vrakuna` |
| Ambulancia na Tehelnej 16 | Nové Mesto | каталоги (название уточнить) |

Дальше — по каталогам azet.sk, zzz.sk, oma.sk и Google Maps как **списку
названий для поиска**. Данные карточки — только с официального сайта
или официальной соцсети заведения (`AGENTS.md`, `docs/card-spec.md`).
Дубли с уже существующими местами не создавать: сверять по адресу и
телефону.

Выездные ветеринары без помещения (`vyjazdovyveterinar.sk` и т.п.) —
можно добавить: координаты пустые, в `notes` —
`coords: none (mobile service, no premises)`, `home_visits=yes`.

### 2. Цены: по `docs/card-spec.md`, «Цены»

- Для **новых** ветклиник — 6 услуг, как у остальных.
- Для **уже существующих** мест всех категорий — добрать цены, где на
  сайте есть прайс, а у нас нет. Сейчас сравнимых цен (страница
  услуги в индексе от 3 мест) не хватает по услугам: `hand_stripping`,
  `deshedding`, `nail_trim`, `cat_groom`, `daycare_pass`, `pickup`,
  `extra_walk`, `puppy_course`, `group_lesson`, `private_lesson`,
  `behavior_consult`, `membership` и всем `PET_SITTING`.
- Правило сравнимости: части складывать, `partial` / `unit` / `note` —
  как в стандарте.

### 3. Круглосуточность — только по правилу «Nonstop 24/7»

`docs/card-spec.md`, раздел 8. У `vetpoint-veterinarna-klinika` источники
противоречат друг другу (см. `notes`) — если сможешь подтвердить по
официальному сайту или звонком, поправь по правилу.

## Перед PR

Самопроверка из `docs/playbooks/quality.md` (§2) — в описание PR, с
доказательствами. PR без неё возвращается без ревью.

## Готово, когда

- `cd website && npm run check-city -- bratislava` печатает `READY`,
  вывод — в описании PR.
- Ветклиник ≥ 50 или в PR объяснено, каких кандидатов нет и почему
  (закрыты, дубли, нет сайта и соцсети).
- В описании PR — таблица: сколько добавлено мест, сколько новых цен по
  каждому коду услуги.

## Чего не делать

- Не выдумывать данные и не брать их из каталогов (каталоги — только
  список названий).
- Не трогать код сайта и файлы других городов.
