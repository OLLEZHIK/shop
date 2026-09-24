// Locales, URL helpers and UI dictionaries.
//
// URL scheme (decision 2026-09-23, replaces docs/design-plan.md 2.2's
// "English-only UI"): English lives at the unprefixed URLs
// (`/grooming/bratislava/`), each city's local language gets a full
// parallel version under its prefix (`/sk/psi-salon/bratislava/`), and
// the two are linked with hreflang. `proxy.ts` maps unprefixed URLs onto
// the `app/[lang]` route tree.
//
// Scaling rule: a new city in an already-supported country is data only.
// A new *language* means one more dictionary here plus slugs in
// lib/categories.ts - effort grows with languages, not cities.

export const LOCALES = ["en", "sk"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// Local language per country (City.country). English is always available.
const COUNTRY_LANGUAGE: Record<string, Locale> = { SK: "sk" };

export function localesForCountry(country: string | null | undefined): Locale[] {
  const local = country ? COUNTRY_LANGUAGE[country.toUpperCase()] : undefined;
  return local && local !== "en" ? ["en", local] : ["en"];
}

/** Prefix a locale-neutral path ("/grooming/bratislava/") for a locale. */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}/` : `/${locale}${path}`;
}

export const DATE_LOCALE: Record<Locale, string> = { en: "en-GB", sk: "sk-SK" };

export function formatDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(DATE_LOCALE[locale], { year: "numeric", month: "short", day: "numeric" });
}

/** Slovak has three count forms (1 / 2-4 / 0,5+); English two. */
export function plural(locale: Locale, n: number, forms: { one: string; few?: string; other: string }): string {
  if (n === 1) return forms.one;
  if (locale === "sk" && n >= 2 && n <= 4) return forms.few ?? forms.other;
  return forms.other;
}

// Locative city names for "in {city}" phrases in Slovak. Missing city
// falls back to the "{label} – {city}" nominative pattern, so a new city
// still renders correctly without an entry here.
const CITY_LOCATIVE: Partial<Record<Locale, Record<string, string>>> = {
  sk: { bratislava: "Bratislave" },
};

/** "in Bratislava" / "v Bratislave" (or "– Bratislava" if unknown). */
export function inCity(locale: Locale, citySlug: string, cityName: string): string {
  if (locale === "en") return `in ${cityName}`;
  const loc = CITY_LOCATIVE[locale]?.[citySlug];
  return loc ? `v ${loc}` : `– ${cityName}`;
}

// Slovak sentences need "in <place>" in the locative; `inCity` gives
// "v Bratislave" for known cities and "– Petržalka, Bratislava" (a
// heading-style label) otherwise. This turns the latter into the
// always-grammatical "v lokalite Petržalka, Bratislava".
function skIn(where: string): string {
  return where.startsWith("– ") ? `v lokalite ${where.slice(2)}` : where;
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const en = {
  nav: {
    browse: "Browse",
    help: "Help",
    listBusiness: "List your business on pawenn",
    findCare: "Find pet care",
    browseServices: "Browse",
    services: "Services",
    foodAndSupplies: "Food & supplements",
    comingSoon: "Coming soon",
    howItWorks: "Help - how pawenn works",
    listYourBusiness: "List your business",
    openMenu: "Browse",
    closeMenu: "Close menu",
    language: "Language",
    locating: "Finding your city…",
  },
  food: [
    { label: "Dog food", blurb: "Best food for your dog's breed and age" },
    { label: "Cat food", blurb: "Wet, dry and special diets" },
    { label: "Supplements", blurb: "Joints, skin, coat and digestion" },
  ],
  footer: {
    tagline: (city: string) =>
      `A friendly, independent guide to pet services in ${city}. No sign-ups, no ads - just the details you need to pick up the phone.`,
    sourced: "Every listing links to its source",
    services: "Services",
    about: "pawenn",
    legal: "Legal",
    howItWorks: "How it works",
    addBusiness: "Add your business",
    fixListing: "Fix a listing",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    englishOnly: "",
    madeWithCare: (city: string) => `Made with care for pets in ${city}`,
  },
  animals: {
    any: "Any pet",
    choose: "Which pet?",
    dog: "Dogs",
    cat: "Cats",
    "small-pet": "Small pets",
    bird: "Birds",
    fish: "Fish",
  } as Record<string, string>,
  animalSingular: {
    dog: "Dog",
    cat: "Cat",
    "small-pet": "Small pet",
    bird: "Bird",
    fish: "Fish",
  } as Record<string, string>,
  home: {
    metaTitle: (city: string) => `pawenn - Pet Services in ${city}`,
    metaDescription: (city: string) =>
      `Find trusted pet services in ${city} - groomers, vets, hotels, training and more`,
    h1Before: "Find trusted",
    h1Highlight: "pet services",
    subtitle: (city: string) =>
      `Groomers, vets, pet hotels and trainers in ${city} - with honest details, clear sources and one-tap contact.`,
    popular: "Popular:",
    statPlaces: "places listed",
    statDistricts: "districts covered",
    statKinds: "kinds of service",
    statAds: "ads or sign-ups",
    browseEyebrow: "Browse by service",
    browseTitle: "What does your pet need today?",
    browseBody: "Six kinds of pet care, each with its own list of places and a source for every listing.",
    places: (n: number) => `${n} ${n === 1 ? "place" : "places"}`,
    listed: (n: number) => `${n} listed`,
    collageCenter: "places to explore",
    exploreEyebrow: "Explore the city",
    exploreTitle: (city: string) => `What's in your part of ${city}?`,
    exploreBody: "Tap a district to see what's nearby. Bigger bubbles mean more places listed.",
    partnersEyebrow: "Partners",
    partnersTitle: "Featured partners",
    partnersBody: "Paid placements - always labelled, never mixed into the regular order.",
    howEyebrow: "How it works",
    howTitle: "From “I need a groomer” to a phone call in a minute",
    steps: [
      { title: "Pick what you need", body: "Choose your pet, the service and a district - or just browse a category." },
      {
        title: "Compare with confidence",
        body: "Every listing links to where its details came from. Paid placements are always labelled.",
      },
      {
        title: "Contact them directly",
        body: "Call, open the website or get directions in one tap. No accounts, no booking fees.",
      },
    ],
    howLink: "How we check listings",
    careEyebrow: "Pet care corner",
    careTitle: "Test yourself, pick up a tip",
    careBody: "A one-minute quiz on the pet myths everyone has heard - and a few habits worth keeping.",
    tips: [
      {
        title: "Trim nails every 3-4 weeks",
        body: "Overgrown nails change how dogs and cats walk and are more likely to split. A quick trim every few weeks keeps paws comfortable.",
      },
      {
        title: "Why does my cat need a scratching post?",
        body: "It's not about your furniture - scratching stretches muscles, sheds the outer claw layer, and marks territory. Cats do it whether or not you give them a post.",
      },
      {
        title: "Signs it's time for a vet visit",
        items: [
          "Eating or drinking noticeably more or less than usual",
          "Limping or reluctance to jump",
          "Any change that lasts more than a couple of days",
        ],
      },
      {
        title: "Brush short-haired dogs weekly, long-haired daily",
        body: "Regular brushing catches mats before they need to be shaved out, and it's a lot cheaper than a grooming visit for a tangled coat.",
      },
    ] as { title: string; body?: string; items?: string[] }[],
    ctaTitle: (city: string) => `Run a pet business in ${city}?`,
    ctaBody: "Add your salon, clinic or hotel, or tell us if something on your listing is out of date.",
    ctaButton: "Add or fix a listing",
  },
  search: {
    pet: "Pet",
    service: "Service",
    where: "Where",
    petPlaceholder: "Which pet?",
    servicePlaceholder: "What do you need?",
    all: (city: string) => `All ${city}`,
    search: "Search",
    showResults: "Show results",
    pickService: "Pick a service to search",
    chooseServiceFirst: "Choose a service first",
    stepPet: "1 · Your pet",
    stepService: "2 · Service",
    stepWhere: "3 · Where",
    popular: "Popular",
    close: "Close",
    nearMe: "Near me",
    nearYou: "Near you",
    locatingYou: "Finding your location…",
    geoDenied: "No problem - just pick your district.",
    geoFar: (city: string) => `We're not in your area yet - pick a district in ${city}.`,
    dialogTitle: "Find pet care",
    dialogBody: "Pick your pet and what it needs - we'll show the places nearby.",
  },
  explorer: {
    district: (city: string) => `${city} district`,
    placesListed: (n: number): string => (n === 1 ? "place listed" : "places listed"),
    tabs: "Districts",
  },
  quiz: {
    title: "Myth or fact?",
    question: (i: number, n: number) => `Question ${i} of ${n}`,
    myth: "Myth",
    fact: "Fact",
    correct: "Correct!",
    notQuite: "Not quite.",
    itsA: (isFact: boolean) => `It's a ${isFact ? "fact" : "myth"}.`,
    next: "Next question",
    seeScore: "See my score",
    playAgain: "Play again",
    perfect: "Perfect score - your pet is in great hands.",
    good: "Nicely done - you know your stuff.",
    meh: "A few surprises there - now you know!",
    statements: [
      {
        claim: "A warm, dry nose means your dog is sick.",
        isFact: false,
        explanation:
          "Nose temperature and moisture change throughout the day in healthy dogs. Appetite, energy and behaviour are far better signals.",
      },
      {
        claim: "Chocolate is toxic to dogs.",
        isFact: true,
        explanation:
          "Chocolate contains theobromine, which dogs break down very slowly. Dark and baking chocolate are the most dangerous.",
      },
      {
        claim: "A saucer of milk is a good treat for an adult cat.",
        isFact: false,
        explanation:
          "Many adult cats are lactose intolerant, and milk can upset their stomach. Fresh water is all they need.",
      },
      {
        claim: "Grapes and raisins can be dangerous for dogs.",
        isFact: true,
        explanation:
          "They can cause kidney failure in some dogs, and there's no known safe amount. Keep them out of reach.",
      },
      {
        claim: "A wagging tail always means a happy dog.",
        isFact: false,
        explanation:
          "Wagging shows the dog is aroused or engaged - that can be excitement, but also nervousness. Read the whole body, not just the tail.",
      },
      {
        claim: "Cats always land on their feet, so falls from a balcony are harmless.",
        isFact: false,
        explanation:
          "Cats have a righting reflex, but falls from windows and balconies still injure many cats every year. Secure balconies with a net.",
      },
      {
        claim: "Indoor-only cats still benefit from vaccinations.",
        isFact: true,
        explanation:
          "Some viruses can travel in on shoes and clothes, and indoor cats still visit vets or boarding. Ask your vet which core vaccines fit.",
      },
    ],
  },
  listing: {
    home: "Home",
    browseCount: (count: number, what: string, where: string) =>
      `Browse ${count} ${what} ${where}, with a source for every listing.`,
    listed: "listed",
    verified: "verified",
    priceRange: "price range",
    districts: "districts",
    from: "from",
    otherServices: "Other services",
    filterAnimal: "Filter by animal",
    filterDistrict: "Filter by district",
    allOf: (city: string) => `All of ${city}`,
    results: (n: number) => `${n} ${n === 1 ? "result" : "results"}`,
    forAnimal: (animal: string) => ` for ${animal.toLowerCase()}`,
    unconfirmedTitle: (animal: string) => `Not yet confirmed for ${animal.toLowerCase()}`,
    unconfirmedBody:
      "These places haven't told us whether they cater for this pet. Many do - give them a quick call before you go.",
    moreToCheck: (n: number) => `${n} more to check`,
    confirmedFor: (n: number, animal: string) => `${n} confirmed for ${animal.toLowerCase()}`,
    fairTurn: "order changes daily so everyone gets a fair turn",
    nearest: "nearest first",
    kmAway: (km: string) => `${km} km away`,
    goodToKnow: "Good to know",
    faqTitle: "Frequently asked questions",
    byDistrict: "By district",
    missingTitle: "Know a place we're missing?",
    missingBody: "Tell us about it, or flag details that look out of date.",
    missingLink: "Add or fix a listing",
    emptyTitle: "Nothing here yet",
    emptyBody: "No places match these filters. Try another district or pet.",
    reset: "Reset filters",
    metaTitle: (label: string, where: string) => `${label} ${where} | Pawenn`,
    metaDescription: (count: number, what: string, where: string) =>
      `Compare ${count} ${what} ${where}: district, which pets they take, and one tap to call, open the website or get directions.`,
    faqCount: (plural: string, where: string) => `How many ${plural} are there ${where}?`,
    faqCountAnswer: (n: number, singular: string, where: string) =>
      `There are currently ${n} listed ${singular}${n === 1 ? "" : "s"} ${where}.`,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Slovak phrasing needs the label
    faqPrice: (singular: string, where: string, _pluralLabel: string) => `How much does ${singular} cost ${where}?`,
    faqPriceAnswer: (range: string) => `Prices among listed businesses range ${range}, based on published price lists.`,
    faqVerified: (plural: string, where: string) => `Which ${plural} ${where} are verified?`,
    faqVerifiedAnswer: (v: number, n: number, pct: number) =>
      `${v} out of ${n} listings (${pct}%) have had their details manually verified.`,
  },
  card: {
    priceLevel: (tier: number) => `Price level ${tier} of 5`,
  },
  rating: {
    countGoogle: (count: string) => `${count} · Google`,
    aria: (value: string, count: number) => `Rated ${value} out of 5 from ${count} Google ratings`,
  },
  actions: { call: "Call", website: "Website", route: "Route" },
  badges: { verified: (date: string) => `Verified ${date}`, partner: "Partner" },
  business: {
    metaTitle: (name: string, label: string, where: string) => `${name} - ${label}${where ? ` ${where}` : ""}`,
    metaDescription: (name: string, where: string) =>
      `${name}${where ? ` ${where}` : ""}: address, contact details and directions.`,
    about: "About",
    welcomes: "Welcomes",
    specialties: "Specialties",
    openingHours: "Opening hours",
    prices: "Prices",
    standard: "Standard",
    sizes: { MINI: "mini", SMALL: "small", MEDIUM: "medium", LARGE: "large", XL: "XL" } as Record<string, string>,
    location: "Location",
    openInMaps: "Open in Maps",
    mapTitle: (name: string) => `Map showing ${name}`,
    reviews: "Reviews",
    reviewsCount: (n: number) => `(${n} reviews)`,
    fromN: (n: number) => `from ${n}`,
    noReviews: "No reviews yet - been here with your pet? Be the first.",
    leaveReview: "Leave a review",
    getInTouch: "Get in touch",
    phone: "Phone",
    website: "Website",
    email: "Email",
    address: "Address",
    noFees: "Contact the business directly - pawenn takes no fees.",
    keepExploring: "Keep exploring",
    moreNearby: (label: string) => `More ${label.toLowerCase()} nearby`,
    seeAll: "See all",
    infoVerified: (date: string) => `Info verified: ${date}`,
    source: "source:",
    reportIssue: "Report an issue",
  },
  reviewForm: {
    name: "Your name",
    rating: "Rating",
    stars: (n: number) => `${n} ${n === 1 ? "star" : "stars"}`,
    review: "Review",
    submit: "Submit review",
    submitting: "Submitting...",
    thanks: "Thanks, your review will appear after it's checked.",
    error: "Something went wrong.",
  },
  notFound: {
    title: "This trail went cold",
    body: "We sniffed around but couldn't find that page. It may have moved, or the link has a typo.",
    back: "Back to home",
  },
};

export type Dictionary = typeof en;

const sk: Dictionary = {
  nav: {
    browse: "Prehľadávať",
    help: "Pomoc",
    listBusiness: "Pridajte svoj podnik na pawenn",
    findCare: "Nájsť starostlivosť",
    browseServices: "Prehľadávať",
    services: "Služby",
    foodAndSupplies: "Krmivá a doplnky",
    comingSoon: "Už čoskoro",
    howItWorks: "Pomoc - ako pawenn funguje",
    listYourBusiness: "Pridať podnik",
    openMenu: "Prehľadávať",
    closeMenu: "Zavrieť menu",
    language: "Jazyk",
    locating: "Hľadáme vaše mesto…",
  },
  food: [
    { label: "Krmivo pre psov", blurb: "Najlepšie krmivo podľa plemena a veku" },
    { label: "Krmivo pre mačky", blurb: "Mokré, suché a diétne krmivá" },
    { label: "Doplnky výživy", blurb: "Kĺby, koža, srsť a trávenie" },
  ],
  footer: {
    tagline: (city: string) =>
      `Priateľský a nezávislý sprievodca službami pre zvieratá v meste ${city}. Bez registrácie a bez reklám - len informácie, ktoré potrebujete, aby ste mohli zavolať.`,
    sourced: "Každý záznam odkazuje na svoj zdroj",
    services: "Služby",
    about: "pawenn",
    legal: "Právne informácie",
    howItWorks: "Ako to funguje",
    addBusiness: "Pridať podnik",
    fixListing: "Opraviť záznam",
    privacy: "Ochrana osobných údajov",
    terms: "Podmienky používania",
    englishOnly: " (EN)",
    madeWithCare: (city: string) => `S láskou k zvieratám v meste ${city}`,
  },
  animals: {
    any: "Všetky zvieratá",
    choose: "Aké zviera?",
    dog: "Psy",
    cat: "Mačky",
    "small-pet": "Malé zvieratá",
    bird: "Vtáky",
    fish: "Ryby",
  },
  animalSingular: {
    dog: "Pes",
    cat: "Mačka",
    "small-pet": "Malé zviera",
    bird: "Vták",
    fish: "Ryba",
  },
  home: {
    metaTitle: (city: string) => `pawenn - Služby pre zvieratá v meste ${city}`,
    metaDescription: (city: string) =>
      `Služby pre zvieratá v meste ${city} - psie salóny, veterinári, hotely pre zvieratá, výcvik a ďalšie, s kontaktom na jeden dotyk`,
    h1Before: "Nájdite spoľahlivé",
    h1Highlight: "služby pre zvieratá",
    subtitle: (city: string) =>
      `Psie salóny, veterinári, hotely pre zvieratá a cvičitelia v meste ${city} - s poctivými údajmi, jasnými zdrojmi a kontaktom na jeden dotyk.`,
    popular: "Obľúbené:",
    statPlaces: "podnikov v zozname",
    statDistricts: "mestských častí",
    statKinds: "druhov služieb",
    statAds: "reklám a registrácií",
    browseEyebrow: "Podľa služby",
    browseTitle: "Čo dnes potrebuje váš miláčik?",
    browseBody: "Šesť druhov starostlivosti, každý s vlastným zoznamom podnikov a zdrojom pri každom zázname.",
    places: (n: number) => `${n} ${plural("sk", n, { one: "podnik", few: "podniky", other: "podnikov" })}`,
    listed: (n: number) => `${n} v zozname`,
    collageCenter: "podnikov na preskúmanie",
    exploreEyebrow: "Preskúmajte mesto",
    exploreTitle: (city: string) => `Čo nájdete vo svojej časti mesta ${city}?`,
    exploreBody: "Ťuknite na mestskú časť a uvidíte, čo je nablízku. Väčšia bublina znamená viac podnikov.",
    partnersEyebrow: "Partneri",
    partnersTitle: "Odporúčaní partneri",
    partnersBody: "Platené umiestnenie - vždy označené, nikdy nie je zamiešané do bežného poradia.",
    howEyebrow: "Ako to funguje",
    howTitle: "Od „potrebujem strihanie“ k telefonátu za minútu",
    steps: [
      {
        title: "Vyberte, čo potrebujete",
        body: "Zvoľte zviera, službu a mestskú časť - alebo si jednoducho prezrite kategóriu.",
      },
      {
        title: "Porovnajte s istotou",
        body: "Každý záznam odkazuje na zdroj svojich údajov. Platené umiestnenia sú vždy označené.",
      },
      {
        title: "Kontaktujte ich priamo",
        body: "Zavolajte, otvorte web alebo navigáciu jedným dotykom. Bez účtov a bez poplatkov za rezerváciu.",
      },
    ],
    howLink: "Ako overujeme záznamy",
    careEyebrow: "Kútik starostlivosti",
    careTitle: "Otestujte sa a naučte sa niečo nové",
    careBody: "Minútový kvíz o mýtoch, ktoré o zvieratách počul každý - a pár užitočných návykov.",
    tips: [
      {
        title: "Pazúriky strihajte každé 3-4 týždne",
        body: "Prerastené pazúry menia chôdzu psov aj mačiek a ľahšie sa lámu. Krátke strihanie raz za pár týždňov udrží labky v pohodlí.",
      },
      {
        title: "Prečo moja mačka potrebuje škrabadlo?",
        body: "Nejde len o nábytok - škrabanie naťahuje svaly, odstraňuje vonkajšiu vrstvu pazúrov a značkuje teritórium. Mačky to robia tak či tak.",
      },
      {
        title: "Kedy je čas navštíviť veterinára",
        items: [
          "Je alebo pije výrazne viac či menej ako zvyčajne",
          "Krivkanie alebo neochota skákať",
          "Akákoľvek zmena, ktorá trvá dlhšie ako pár dní",
        ],
      },
      {
        title: "Krátkosrsté psy kefujte raz týždenne, dlhosrsté denne",
        body: "Pravidelné kefovanie zachytí plsť skôr, než ju treba vystrihať - a je oveľa lacnejšie než návšteva salónu so zacuchanou srsťou.",
      },
    ],
    ctaTitle: (city: string) => `Máte podnik pre zvieratá v meste ${city}?`,
    ctaBody: "Pridajte svoj salón, ambulanciu alebo hotel, alebo nám dajte vedieť, ak niečo vo vašom zázname nesedí.",
    ctaButton: "Pridať alebo opraviť záznam",
  },
  search: {
    pet: "Zviera",
    service: "Služba",
    where: "Kde",
    petPlaceholder: "Aké zviera?",
    servicePlaceholder: "Čo potrebujete?",
    all: (city: string) => `Celá ${city}`,
    search: "Hľadať",
    showResults: "Zobraziť výsledky",
    pickService: "Vyberte službu",
    chooseServiceFirst: "Najprv vyberte službu",
    stepPet: "1 · Vaše zviera",
    stepService: "2 · Služba",
    stepWhere: "3 · Kde",
    popular: "Obľúbené",
    close: "Zavrieť",
    nearMe: "V mojej blízkosti",
    nearYou: "Vo vašej blízkosti",
    locatingYou: "Zisťujeme vašu polohu…",
    geoDenied: "Nevadí - vyberte si mestskú časť.",
    geoFar: (city: string) => `Vo vašej oblasti zatiaľ nie sme - vyberte mestskú časť v meste ${city}.`,
    dialogTitle: "Nájsť starostlivosť",
    dialogBody: "Vyberte zviera a to, čo potrebuje - ukážeme vám podniky nablízku.",
  },
  explorer: {
    district: (city: string) => `Mestská časť - ${city}`,
    placesListed: (n: number) => plural("sk", n, { one: "podnik", few: "podniky", other: "podnikov" }),
    tabs: "Mestské časti",
  },
  quiz: {
    title: "Mýtus alebo fakt?",
    question: (i: number, n: number) => `Otázka ${i} z ${n}`,
    myth: "Mýtus",
    fact: "Fakt",
    correct: "Správne!",
    notQuite: "Tak celkom nie.",
    itsA: (isFact: boolean) => `Je to ${isFact ? "fakt" : "mýtus"}.`,
    next: "Ďalšia otázka",
    seeScore: "Moje skóre",
    playAgain: "Hrať znova",
    perfect: "Plný počet - váš miláčik je vo výborných rukách.",
    good: "Výborne - viete, o čom je reč.",
    meh: "Pár prekvapení - teraz už to viete!",
    statements: [
      {
        claim: "Teplý a suchý ňufák znamená, že je pes chorý.",
        isFact: false,
        explanation:
          "Teplota a vlhkosť ňufáka sa u zdravých psov počas dňa mení. Chuť do jedla, energia a správanie sú oveľa lepšie signály.",
      },
      {
        claim: "Čokoláda je pre psy jedovatá.",
        isFact: true,
        explanation:
          "Čokoláda obsahuje teobromín, ktorý psy odbúravajú veľmi pomaly. Najnebezpečnejšia je horká a varná čokoláda.",
      },
      {
        claim: "Miska mlieka je dobrá maškrta pre dospelú mačku.",
        isFact: false,
        explanation:
          "Mnohé dospelé mačky neznášajú laktózu a mlieko im môže podráždiť žalúdok. Stačí im čerstvá voda.",
      },
      {
        claim: "Hrozno a hrozienka môžu byť pre psy nebezpečné.",
        isFact: true,
        explanation:
          "U niektorých psov môžu spôsobiť zlyhanie obličiek a bezpečné množstvo nie je známe. Držte ich mimo dosahu.",
      },
      {
        claim: "Vrtiaci chvost vždy znamená šťastného psa.",
        isFact: false,
        explanation:
          "Vrtenie ukazuje, že je pes vzrušený alebo zaujatý - môže ísť o radosť, ale aj o nervozitu. Sledujte celé telo, nielen chvost.",
      },
      {
        claim: "Mačky vždy dopadnú na nohy, takže pád z balkóna je neškodný.",
        isFact: false,
        explanation:
          "Mačky majú vzpriamovací reflex, no pády z okien a balkónov každý rok zrania veľa mačiek. Zabezpečte balkón sieťou.",
      },
      {
        claim: "Aj mačkám, ktoré nechodia von, sa oplatí očkovanie.",
        isFact: true,
        explanation:
          "Niektoré vírusy sa môžu dostať domov na topánkach a oblečení a aj domáce mačky chodia k veterinárovi či do hotela. Poraďte sa s veterinárom.",
      },
    ],
  },
  listing: {
    home: "Domov",
    // Slovak count agreement differs per category noun, so the sentence
    // counts "podniky" instead of repeating the category label.
    browseCount: (count: number, _what: string, where: string) =>
      `${cap(skIn(where))} máme ${count} ${plural("sk", count, {
        one: "podnik",
        few: "podniky",
        other: "podnikov",
      })} a pri každom uvádzame zdroj údajov.`,
    listed: "v zozname",
    verified: "overených",
    priceRange: "cenové rozpätie",
    districts: "mestských častí",
    from: "od",
    otherServices: "Ďalšie služby",
    filterAnimal: "Filtrovať podľa zvieraťa",
    filterDistrict: "Filtrovať podľa mestskej časti",
    allOf: (city: string) => `Celá ${city}`,
    results: (n: number) => `${n} ${plural("sk", n, { one: "výsledok", few: "výsledky", other: "výsledkov" })}`,
    forAnimal: (animal: string) => ` - ${animal.toLowerCase()}`,
    unconfirmedTitle: (animal: string) => `Zatiaľ nepotvrdené: ${animal.toLowerCase()}`,
    unconfirmedBody:
      "Tieto podniky nám zatiaľ neuviedli, či sa venujú aj tomuto zvieraťu. Mnohé áno - pred návštevou im radšej zavolajte.",
    moreToCheck: (n: number) => `ďalšie na overenie: ${n}`,
    confirmedFor: (n: number, animal: string) => `${cap(animal)} – potvrdené: ${n}`,
    fairTurn: "poradie sa mení každý deň, aby mal každý rovnakú šancu",
    nearest: "najbližšie ako prvé",
    kmAway: (km: string) => `${km} km od vás`,
    goodToKnow: "Dobré vedieť",
    faqTitle: "Časté otázky",
    byDistrict: "Podľa mestskej časti",
    missingTitle: "Poznáte podnik, ktorý tu chýba?",
    missingBody: "Dajte nám o ňom vedieť alebo nahláste zastarané údaje.",
    missingLink: "Pridať alebo opraviť záznam",
    emptyTitle: "Zatiaľ tu nič nie je",
    emptyBody: "Týmto filtrom nezodpovedá žiadny podnik. Skúste inú mestskú časť alebo zviera.",
    reset: "Zrušiť filtre",
    metaTitle: (label: string, where: string) => `${label} ${where} | Pawenn`,
    metaDescription: (count: number, what: string, where: string) =>
      `${cap(what)} ${skIn(where)}: ${count} ${plural("sk", count, {
        one: "podnik",
        few: "podniky",
        other: "podnikov",
      })} s kontaktmi, mapou a zdrojmi údajov.`,
    faqCount: (pluralLabel: string, where: string) =>
      `Koľko podnikov v kategórii „${cap(pluralLabel)}“ je ${skIn(where)}?`,
    faqCountAnswer: (n: number, _singular: string, where: string) =>
      `${cap(skIn(where))} je momentálne v zozname ${n} ${plural("sk", n, {
        one: "podnik",
        few: "podniky",
        other: "podnikov",
      })}.`,
    faqPrice: (_singular: string, where: string, pluralLabel: string) =>
      `Aké sú ceny v kategórii „${cap(pluralLabel)}“ ${skIn(where)}?`,
    faqPriceAnswer: (range: string) => `Ceny v zozname sa pohybujú v rozpätí ${range} podľa zverejnených cenníkov.`,
    faqVerified: (pluralLabel: string, where: string) =>
      `Ktoré podniky v kategórii „${cap(pluralLabel)}“ ${skIn(where)} sú overené?`,
    faqVerifiedAnswer: (v: number, n: number, pct: number) =>
      `${v} z ${n} záznamov (${pct} %) má ručne overené údaje.`,
  },
  card: {
    priceLevel: (tier: number) => `Cenová úroveň ${tier} z 5`,
  },
  rating: {
    countGoogle: (count: string) => `${count} · Google`,
    aria: (value: string, count: number) => `Hodnotenie ${value} z 5 podľa ${count} hodnotení na Google`,
  },
  actions: { call: "Zavolať", website: "Web", route: "Trasa" },
  badges: { verified: (date: string) => `Overené ${date}`, partner: "Partner" },
  business: {
    metaTitle: (name: string, label: string, where: string) => `${name} - ${label}${where ? ` ${where}` : ""}`,
    metaDescription: (name: string, where: string) =>
      `${name}${where ? ` ${where}` : ""}: adresa, kontakt a trasa.`,
    about: "O podniku",
    welcomes: "Prijíma",
    specialties: "Špecializácie",
    openingHours: "Otváracie hodiny",
    prices: "Ceny",
    standard: "Štandard",
    sizes: { MINI: "mini", SMALL: "malý", MEDIUM: "stredný", LARGE: "veľký", XL: "XL" },
    location: "Poloha",
    openInMaps: "Otvoriť v mapách",
    mapTitle: (name: string) => `Mapa - ${name}`,
    reviews: "Recenzie",
    reviewsCount: (n: number) => `(${n} ${plural("sk", n, { one: "recenzia", few: "recenzie", other: "recenzií" })})`,
    fromN: (n: number) => `z ${n}`,
    noReviews: "Zatiaľ bez recenzií - boli ste tu so svojím zvieraťom? Buďte prvý.",
    leaveReview: "Napísať recenziu",
    getInTouch: "Kontakt",
    phone: "Telefón",
    website: "Web",
    email: "E-mail",
    address: "Adresa",
    noFees: "Kontaktujte podnik priamo - pawenn si neúčtuje žiadne poplatky.",
    keepExploring: "Preskúmajte ďalej",
    moreNearby: (label: string) => `Ďalšie ${label.toLowerCase()} v okolí`,
    seeAll: "Zobraziť všetky",
    infoVerified: (date: string) => `Údaje overené: ${date}`,
    source: "zdroj:",
    reportIssue: "Nahlásiť chybu",
  },
  reviewForm: {
    name: "Vaše meno",
    rating: "Hodnotenie",
    stars: (n: number) => `${n} ${plural("sk", n, { one: "hviezdička", few: "hviezdičky", other: "hviezdičiek" })}`,
    review: "Recenzia",
    submit: "Odoslať recenziu",
    submitting: "Odosiela sa...",
    thanks: "Ďakujeme, recenzia sa zobrazí po kontrole.",
    error: "Niečo sa pokazilo.",
  },
  notFound: {
    title: "Stopa sa stratila",
    body: "Všetko sme prečuchali, no túto stránku sme nenašli. Možno sa presunula alebo je v odkaze preklep.",
    back: "Späť na úvod",
  },
};

const DICTIONARIES: Record<Locale, Dictionary> = { en, sk };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
