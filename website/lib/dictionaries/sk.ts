// Slovak UI strings (docs/playbooks/add-language.md).
import { plural } from "../locales";
import type { Dictionary } from "./en";

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

export const sk: Dictionary = {
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
    tagline: (where: string | null) =>
      `Priateľský a nezávislý sprievodca službami pre zvieratá${where ? ` ${skIn(where)}` : ""}. Bez registrácie a bez reklám - len informácie, ktoré potrebujete, aby ste mohli zavolať.`,
    sourced: "Každý záznam odkazuje na svoj zdroj",
    services: "Služby",
    about: "pawenn",
    legal: "Právne informácie",
    howItWorks: "Ako to funguje",
    addBusiness: "Pridať podnik",
    fixListing: "Opraviť záznam",
    privacy: "Ochrana osobných údajov",
    terms: "Podmienky používania",
    madeWithCare: (where: string | null) => `S láskou k zvieratám${where ? ` ${skIn(where)}` : ""}`,
    cities: "Mestá",
  },
  cityHub: {
    metaTitle: (where: string) => `Služby pre zvieratá ${where} – veterinári, psie salóny, hotely | Pawenn`,
    metaDescription: (n: number, where: string) =>
      `Služby pre zvieratá ${where}: ${n} ${plural("sk", n, { one: "podnik", few: "podniky", other: "podnikov" })} – veterinári, psie salóny, hotely pre zvieratá, výcvik, chovateľské potreby a opatrovanie, s otváracími hodinami, cenami a kontaktom na jeden dotyk.`,
    h1Before: "Služby pre zvieratá",
    intro: "Všetky služby pre zvieratá v jednom zozname: veterinári, psie salóny, hotely, výcvik, chovateľské potreby a opatrovanie, každý podnik so zdrojom. Hore si vyberte službu a zúžte výber.",
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
    metaTitle: (where: string) => `Služby pre zvieratá ${skIn(where)} – veterinári, psie salóny, hotely | Pawenn`,
    metaDescription: (where: string) =>
      `Služby pre zvieratá ${skIn(where)} - psie salóny, veterinári, hotely pre zvieratá, výcvik a ďalšie, s kontaktom na jeden dotyk`,
    h1Before: "Nájdite spoľahlivé",
    h1Highlight: "služby pre zvieratá",
    subtitle: (where: string) =>
      `Psie salóny, veterinári, hotely pre zvieratá a cvičitelia ${skIn(where)} - s poctivými údajmi, jasnými zdrojmi a kontaktom na jeden dotyk.`,
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
    ctaTitle: (where: string) => `Máte podnik pre zvieratá ${skIn(where)}?`,
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
    stepPet: "1 · Vaše zviera",
    stepService: "2 · Služba",
    stepWhere: "3 · Kde",
    popular: "Obľúbené",
    close: "Zavrieť",
    nearMe: "V mojej blízkosti",
    nearYou: "Vo vašej blízkosti",
    locatingYou: "Zisťujeme vašu polohu…",
    geoDenied: "Nevadí - napíšte svoje mesto.",
    cityPlaceholder: "Napíšte mesto",
    cityLabel: "Mesto",
    cityNotCovered: (typed: string, cities: string) => `V meste ${typed} zatiaľ nie sme. Pawenn nájdete v: ${cities}.`,
    geoFar: (city: string) => `Vo vašej oblasti zatiaľ nie sme - napíšte mesto, napr. ${city}.`,
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
    sortLabel: "Zoradiť",
    sortRecommended: "Odporúčané",
    sortNearest: "Najbližšie",
    sortRating: "Najlepšie hodnotené",
    sortReviews: "Najviac hodnotení",
    ratingFirst: "najlepšie hodnotené navrchu",
    reviewsFirst: "najviac hodnotení navrchu",
    filterRating: "Filtrovať podľa hodnotenia na Google",
    ratingAny: "Všetky",
    hiddenUnrated: (n: number) => `skryté bez hodnotenia: ${n}`,
    openNowFilter: "Otvorené teraz",
    allServices: "Všetky služby",
    geoOff: "Poloha je vypnutá - zobrazujeme všetky podniky.",
    hiddenNoHours: (n: number) => `skryté bez otváracích hodín: ${n}`,
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
    vsMarket: (pct: number, marketBand: boolean) =>
      marketBand ? "Trhová cena" : pct < 0 ? `o ${-pct} % pod trhom` : `o ${pct} % nad trhom`,
    vsMarketHint: "V porovnaní s mediánom cien rovnakých služieb v meste",
  },
  rating: {
    countGoogle: (count: string) => `${count} · Google`,
    aria: (value: string, count: number) => `Hodnotenie ${value} z 5 podľa ${count} hodnotení na Google`,
  },
  insights: {
    title: "Čo hovoria zákazníci",
    summary: (n: number, period: string) => `Zhrnutie pawenn z ${n} recenzií na Google za obdobie ${period}`,
    allOnGoogle: "Všetky recenzie na Google",
    disclosure: "Súhrn verejných recenzií z Google, pawenn ich neoverujeme.",
    sentiment: { positive: "Prevažne pozitívne", mixed: "Zmiešané", negative: "Prevažne negatívne" },
    mentions: (m: number, n: number) => `${m} z ${n} recenzií`,
    faqTitle: "Časté otázky",
  },
  actions: { call: "Zavolať", website: "Web", route: "Trasa" },
  badges: { verified: (date: string) => `Overené ${date}`, partner: "Partner" },
  business: {
    metaTitle: (name: string, label: string, where: string) => `${name} - ${label}${where ? ` ${where}` : ""}`,
    metaDescription: (name: string, where: string) =>
      `${name}${where ? ` ${where}` : ""}: adresa, kontakt a trasa.`,
    metaDescriptionTail: (hasPrices: boolean) =>
      `Otváracie hodiny${hasPrices ? ", ceny" : ""} a telefón, web či trasa na jeden dotyk.`,
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
    days: { mo: "Pondelok", tu: "Utorok", we: "Streda", th: "Štvrtok", fr: "Piatok", sa: "Sobota", su: "Nedeľa" } as Record<string, string>,
    openNow: "Otvorené",
    closedNow: "Zatvorené",
    closedDay: "Zatvorené",
    allDay: "Nonstop",
    byAppointment: "Na objednávku",
    hoursChecked: (date: string) => `Hodiny overené ${date}`,
    nonstop: "Nonstop 24/7",
    emergency: "Pohotovosť",
    // "Psí salón v mestskej časti " + <district> + ", Bratislava" (keeps the
    // district name in the nominative, as people search it)
    placeIn: { before: (singular: string) => `${singular.charAt(0).toUpperCase()}${singular.slice(1)} v mestskej časti ` },
    homeVisits: "Výjazd k pacientovi",
    languages: (list: string) => `Hovoria: ${list}`,
    instagram: "Instagram",
    facebook: "Facebook",
    priceFrom: (price: string) => `od ${price}`,
    weightUpTo: (kg: string) => `do ${kg} kg`,
    weightOver: (kg: string) => `nad ${kg} kg`,
    weightRange: (from: string, to: string) => `${from}–${to} kg`,
    pricesChecked: (date: string) => `Overené ${date}`,
    priceList: "cenník",
    perUnit: { per_hour: "/ hod.", per_km: "/ km" },
    notCompared: "neporovnávame s inými podnikmi",
    cityMedian: (price: string, places: number) =>
      `Medián v meste ${price} · ${places} ${plural("sk", places, { one: "podnik", few: "podniky", other: "podnikov" })}`,
    pricesDisclaimer: "Ceny tak, ako ich podnik zverejnil k uvedenému dátumu. Môžu sa zmeniť - pred objednaním si ich overte.",
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
  attributes: {
    nonstop: {
      chip: "Nonstop 24/7",
      h1: (where: string) => `Veterinár nonstop ${skIn(where)}`,
      lead: (n: number, total: number) =>
        `${n} z ${total} veterinárnych ambulancií prijíma pacientov 24 hodín denne, 7 dní v týždni. Pred cestou zavolajte.`,
      metaTitle: (where: string) => `Veterinár nonstop ${skIn(where)} – pohotovosť 24/7 | Pawenn`,
      metaDescription: (n: number, where: string) =>
        `Nonstop veterinárne ambulancie ${skIn(where)}: ${n} ${plural("sk", n, { one: "ambulancia", few: "ambulancie", other: "ambulancií" })} otvorených 24 hodín denne, 7 dní v týždni – adresa, telefón a trasa.`,
    },
    saturday: {
      chip: "Otvorené v sobotu",
      h1: (where: string) => `Veterinár otvorený v sobotu ${skIn(where)}`,
      lead: (n: number, total: number) =>
        `V sobotu má otvorené ${n} z ${total} veterinárnych ambulancií. Otváracie hodiny nižšie, overené pri každej ambulancii.`,
      metaTitle: (where: string) => `Veterinár v sobotu ${skIn(where)} | Pawenn`,
      metaDescription: (n: number, where: string) =>
        `${n} ${plural("sk", n, { one: "veterinárna ambulancia", few: "veterinárne ambulancie", other: "veterinárnych ambulancií" })} ${skIn(where)} otvorených v sobotu – hodiny, telefón a trasa.`,
    },
    sunday: {
      chip: "Otvorené v nedeľu",
      h1: (where: string) => `Veterinár otvorený v nedeľu ${skIn(where)}`,
      lead: (n: number, total: number) =>
        `V nedeľu má otvorené ${n} z ${total} veterinárnych ambulancií. Otváracie hodiny nižšie, overené pri každej ambulancii.`,
      metaTitle: (where: string) => `Veterinár v nedeľu ${skIn(where)} | Pawenn`,
      metaDescription: (n: number, where: string) =>
        `${n} ${plural("sk", n, { one: "veterinárna ambulancia", few: "veterinárne ambulancie", other: "veterinárnych ambulancií" })} ${skIn(where)} otvorených v nedeľu – hodiny, telefón a trasa.`,
    },
    exotics: {
      chip: "Exotické zvieratá",
      h1: (where: string) => `Veterinár pre exotické zvieratá ${skIn(where)}`,
      lead: (n: number, total: number) =>
        `Exotické zvieratá – plazy, vtáky, hlodavce – ošetruje ${n} z ${total} veterinárnych ambulancií. Pred návštevou si overte váš druh.`,
      metaTitle: (where: string) => `Veterinár pre exoty ${skIn(where)} | Pawenn`,
      metaDescription: (n: number, where: string) =>
        `${n} ${plural("sk", n, { one: "veterinárna ambulancia", few: "veterinárne ambulancie", other: "veterinárnych ambulancií" })} ${skIn(where)} pre exotické zvieratá: plazy, vtáky, hlodavce. Hodiny, telefón a trasa.`,
    },
    "home-visits": {
      chip: "Výjazd domov",
      h1: (where: string) => `Veterinár s výjazdom domov ${skIn(where)}`,
      lead: (n: number, total: number) => `Výjazd k vám domov ponúka ${n} z ${total} veterinárnych ambulancií.`,
      metaTitle: (where: string) => `Veterinár domov ${skIn(where)} – výjazd | Pawenn`,
      metaDescription: (n: number, where: string) =>
        `${n} ${plural("sk", n, { one: "veterinárna ambulancia", few: "veterinárne ambulancie", other: "veterinárnych ambulancií" })} ${skIn(where)} s výjazdom domov – telefón, hodiny a služby.`,
    },
  },
  prices: {
    crumb: "Ceny",
    overviewH1: (label: string, where: string) => `${cap(label)} ${skIn(where)} – ceny`,
    overviewMetaTitle: (label: string, where: string) => `${cap(label)} ${skIn(where)} – koľko čo stojí | Pawenn`,
    overviewIntro:
      "Koľko stojí ktorá služba – porovnanie podnikov, ktoré zverejňujú cenník. Medián je stredná cena: polovica podnikov je lacnejšia, polovica drahšia.",
    overviewMetaDescription: (label: string, where: string, services: number) =>
      `${cap(label)} ${skIn(where)}: ceny ${services} ${plural("sk", services, { one: "služby", few: "služieb", other: "služieb" })} porovnané medzi podnikmi, s mediánom a rozpätím. Zo zverejnených cenníkov, s dátumom.`,
    serviceH1: (service: string, where: string) => `${service} ${skIn(where)} – ceny`,
    serviceMetaTitle: (service: string, where: string, from: string) => `${service} ${skIn(where)} – od ${from} | Pawenn`,
    answer: (from: string, to: string, median: string, places: number, date: string) =>
      `Stojí od ${from} do ${to}, medián ${median}. Porovnali sme ${places} ${plural("sk", places, { one: "podnik", few: "podniky", other: "podnikov" })}, ceny overené ${date}.`,
    fewPlaces: (places: number) =>
      `Túto cenu zatiaľ ${plural("sk", places, { one: "zverejnil", few: "zverejnili", other: "zverejnilo" })} len ${places} ${plural("sk", places, { one: "podnik", few: "podniky", other: "podnikov" })} – na porovnanie je to málo.`,
    question: (service: string, where: string) => `Koľko stojí ${service.toLowerCase()} ${skIn(where)}?`,
    includes: "Čo zahŕňa cena",
    place: "Podnik",
    price: "Cena",
    vsMarket: "Oproti trhu",
    notComparedTitle: "Ďalšie ceny (neporovnávame)",
    notComparedIntro: "Čiastočné ceny, ceny za hodinu či kilometer alebo ceny, ktoré zahŕňajú viac ako štandard.",
    otherServices: "Ďalšie ceny",
    service: "Služba",
    range: "Rozpätie",
    median: "Medián",
    places: "Podniky",
    seeAll: (label: string) => `Všetky: ${label.toLowerCase()}`,
    linkFromListing: (where: string) => `Ceny ${skIn(where)}`,
    source: "cenník",
  },
};
