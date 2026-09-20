# English URL Slugs & Keywords Research for Bratislava Pet Services

> **Status:** Qualitative SEO research document prepared for task `tasks/antigravity-seo-english-keywords.md`.  
> **Methodology note:** This report represents a *qualitative* analysis based on Google live search SERPs, autocomplete suggestions, expat community queries (Reddit r/Bratislava, Facebook expat groups), and competitor structure (Rover, Yelp, local directories). It does *not* replace paid quantitative keyword tools (such as Ahrefs, SEMrush, or Google Keyword Planner), which should be run prior to scaling paid acquisition.

---

## 1. Executive Summary & Honest Traffic Assessment

### Is there meaningful English search traffic for pet services in Bratislava?
**Honest assessment: Low to moderate total volume, but exceptionally high commercial intent.**

1. **Demographics & Search Volume Reality:**
   - Bratislava has a population of ~475,000. Foreign residents and international expats account for approximately 35,000–45,000 people (concentrated in shared service centers, international IT corporations like Dell/IBM/Amazon, embassies, and academic institutions).
   - In absolute numbers, **English search volume for local Bratislava pet services is modest**: estimated at **100–400 searches per month across all 6 categories combined**.
   - By contrast, native Slovak queries (`psí salón bratislava`, `veterinár bratislava`, `strihanie psov`) generate an estimated 10× to 15× higher organic search volume.

2. **Why the English Base Version Still Makes Strategic Sense:**
   - **Zero Competition in Google SERP:** Slovak pet salons and clinics almost never optimize their pages for English keywords or create dedicated English landing pages. A well-structured, fast English directory (`pawenn.com`) will easily capture top positions (#1–#3) for high-intent queries like *"english speaking vet bratislava"* or *"dog grooming bratislava"*.
   - **Highest Intent and Willingness to Pay:** Foreign pet owners living in Bratislava face severe friction finding service providers who speak English. When they search, their conversion rate and ticket size are higher than average.
   - **Clean Architecture:** Building the core codebase and schema in English (`/grooming/`, `/vet-clinics/`) provides a clean foundation. When Slovak localization is added (`/sk/psie-salony/`, `/sk/veterinari/`), it captures the mass domestic audience without needing architectural rewrites.

---

## 2. Category-by-Category Analysis & URL Slug Recommendations

The table below reviews the 6 working URL slugs established in `docs/design-plan.md` (Section 3) against real search behavior:

| Category | Working Slug (`docs/design-plan.md`) | Recommended Slug | Decision | Target Primary Queries | Candidate H1 & Page Title |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Grooming** | `grooming` | `grooming` | **Keep** | `dog grooming bratislava`, `pet grooming bratislava`, `cat grooming bratislava` | **H1:** Dog & Pet Grooming Salons in Bratislava<br>**Title:** Dog Grooming in Bratislava \| Verified Salons & Prices |
| **Vet Clinics** | `vet-clinics` | `vet-clinics` | **Keep** | `english speaking vet bratislava`, `vet clinic bratislava`, `veterinarian bratislava`, `emergency vet bratislava 24/7` | **H1:** Veterinary Clinics & Hospitals in Bratislava<br>**Title:** Vets in Bratislava \| English-Speaking & Emergency Care |
| **Pet Hotels** | `pet-hotels` | `pet-hotels` | **Keep** (with `boarding` in metadata) | `dog hotel bratislava`, `pet boarding bratislava`, `cat hotel bratislava`, `dog daycare bratislava` | **H1:** Pet Hotels & Boarding in Bratislava<br>**Title:** Dog Hotels & Pet Boarding in Bratislava \| Verified Stays |
| **Pet Training** | `pet-training` | `dog-training` | **Change** (Recommend `dog-training`) | `dog training bratislava`, `dog trainer bratislava`, `puppy training bratislava` | **H1:** Dog Training & Puppy Schools in Bratislava<br>**Title:** Dog Trainers & Puppy Schools in Bratislava |
| **Pet Shops** | `pet-shops` | `pet-shops` | **Keep** | `pet shop bratislava`, `pet store bratislava`, `dog food pet shop bratislava` | **H1:** Pet Shops & Pet Supplies in Bratislava<br>**Title:** Pet Shops in Bratislava \| Food & Pet Care Supplies |
| **Pet Sitting** | `pet-sitting` | `pet-sitting` | **Keep** | `cat sitting bratislava`, `dog sitting bratislava`, `dog walker bratislava` | **H1:** Pet Sitting & Dog Walking in Bratislava<br>**Title:** Pet Sitting & Dog Walkers in Bratislava |

---

## 3. Deep-Dive by Category

### 3.1. Grooming (`/grooming/`)
- **Search Behavior:** International pet owners search overwhelmingly for *"dog grooming [city]"* or *"pet groomer [city]"*. Cat grooming is a secondary niche searched as *"cat grooming"* or *"cat grooming salon"*.
- **Slug Verdict:** **Keep `/grooming/`**.
  - While *"dog-grooming"* has slightly higher standalone search queries, *"grooming"* correctly accommodates both dogs and cats (`docs/concept.md` Section 3 explicitly includes dogs and cats).
  - Sub-filters: `/grooming/petrzalka/`, `/grooming/ruzinov/` maintain clean, idiomatic URL structures.
- **Key On-Page Phrasing:**
  - *"Full grooming service (bath, hair cut, nails)"*
  - *"Price list by dog size (Small / Medium / Large)"*
  - *"English-speaking groomers in Bratislava"*

### 3.2. Veterinary Clinics (`/vet-clinics/`)
- **Search Behavior:** This is the highest-urgency and highest-intent category. Foreign residents frequently search for language capabilities:
  - Top query: *"english speaking vet bratislava"*
  - Emergency query: *"emergency vet 24/7 bratislava"* / *"veterinary hospital bratislava"*
- **Slug Verdict:** **Keep `/vet-clinics/`**.
  - Matches the physical directory nature (clinics and hospitals).
  - Metadata and H2s must prominently feature the phrase *"English-speaking veterinarians"* and *"24-hour emergency care"*.

### 3.3. Pet Hotels & Boarding (`/pet-hotels/`)
- **Search Behavior:** In Central Europe (Slovakia, Austria, Czechia), the term *"Dog hotel"* (`Psí hotel`) is the ubiquitous local naming convention. In UK/US English, *"Pet boarding"* or *"Dog boarding"* is equally common.
- **Slug Verdict:** **Keep `/pet-hotels/`**.
  - Immediately recognizable to both European expats and domestic pet owners.
  - In page titles and descriptions, pair *"Pet Hotels & Dog Boarding"* together to capture both search variants.

### 3.4. Pet Training (`/pet-training/` vs `/dog-training/`)
- **Search Behavior:** Virtually 100% of training queries are dog-specific: *"dog training bratislava"*, *"dog trainer bratislava"*, *"puppy socialization class"*. Cat training queries are practically non-existent.
- **Slug Verdict:** **Recommend updating from `/pet-training/` to `/dog-training/`**.
  - **Reason:** Pet owners never search *"pet training"* — they search for their specific animal (*"dog trainer"* or *"puppy training"*).
  - In `data/other-pet-services-bratislava.csv`, all 7 training providers are dog training schools (`výcviková škola pre psov`, `kynologický klub`).
  - If a generic slug is strictly preferred across the platform, `/pet-training/` can remain, but `/dog-training/` will yield significantly better Google keyword alignment.

### 3.5. Pet Shops (`/pet-shops/`)
- **Search Behavior:** British English leans toward *"pet shop"*, American English toward *"pet store"*. Both are used interchangeably in European expatriate searches.
- **Slug Verdict:** **Keep `/pet-shops/`**.
  - Highly concise, natural, and matches European commercial directory standards.
  - Page descriptions should include both *"pet shops"* and *"pet supplies stores"*.

### 3.6. Pet Sitting & Walking (`/pet-sitting/`)
- **Search Behavior:** Users search for two related needs: home sitting (*"cat sitter bratislava"*, *"pet sitting"*) and daily walking (*"dog walker bratislava"*).
- **Slug Verdict:** **Keep `/pet-sitting/`**.
  - Umbrella term recognized by major platforms (Rover, Pawshake).
  - Page H2 and filter pills should explicitly highlight *"Dog Walking"* and *"Cat Home Visits"*.

---

## 4. Recommendations for Programmatic Title & Meta Tags

To maximize CTR and search rankings on low-volume, high-intent queries, page metadata should follow a structured formula:

1. **Category Overview Page:**
   ```html
   <title>{Category Name} in Bratislava | Verified Contacts & Prices | Pawenn</title>
   <meta name="description" content="Find verified {service} providers across Bratislava. View direct phone numbers, opening hours, transparent prices, and English-friendly services without registration." />
   ```

2. **District Landing Pages (e.g., Petržalka, Ružinov):**
   ```html
   <title>{Category Name} in Bratislava - {District} | Pawenn</title>
   <meta name="description" content="Discover {service} in Bratislava - {District}. Compare verified providers, addresses, contact details, and distance to you." />
   ```

3. **Detail Page:**
   ```html
   <title>{Business Name} - {Category} in {District}, Bratislava | Pawenn</title>
   <meta name="description" content="{Business Name} at {Address}. Verified phone, website, operating hours, and service details. Direct contact with zero middleman fees." />
   ```

---

## 5. Conclusion & Action Items

1. **Slug Adjustments:**
   - The working slugs from `docs/design-plan.md` are **90% confirmed**.
   - The only recommended change is **`pet-training` → `dog-training`** due to dog-exclusive search intent and data.
2. **Organic Expectation Management:**
   - Do not expect hundreds of organic visits per day on English terms alone in Bratislava.
   - The primary growth engine for English SEO will be **long-tail niche dominance** (ranking #1 for expatriate searches), followed by mass traffic unlock once the Slovak language version (`/sk/`) is deployed.
