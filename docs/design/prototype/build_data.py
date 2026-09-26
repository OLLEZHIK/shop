# Build the prototype's data from the local site database export, using the
# same rules as website/lib (priceMarket.ts, services.ts, vet.ts).
import json, statistics, os, re
S = os.path.dirname(os.path.abspath(__file__))  # raw.json: export of the local seeded DB (see README.md)
d = json.load(open(os.path.join(S, 'raw.json')))

CATS = [
  ('VET_CLINIC', 'veterinar', 'Veterinárne ambulancie', 'Veterinári', 'veterinárna ambulancia', 'veterinárne ambulancie'),
  ('GROOMING', 'psi-salon', 'Psie salóny', 'Psie salóny', 'psí salón', 'psie salóny'),
  ('PET_HOTEL', 'hotel-pre-zvierata', 'Hotely pre zvieratá', 'Hotely', 'hotel pre zvieratá', 'hotely pre zvieratá'),
  ('PET_SHOP', 'chovatelske-potreby', 'Chovateľské potreby', 'Potreby', 'chovateľské potreby', 'chovateľské potreby'),
  ('DOG_TRAINING', 'vycvik-psov', 'Výcvik psov', 'Výcvik psov', 'výcvik psov', 'výcvik psov'),
  ('PET_SITTING', 'opatrovanie-zvierat', 'Opatrovanie zvierat', 'Opatrovanie', 'opatrovanie zvierat', 'opatrovanie zvierat'),
]
SERVICES = {
 'GROOMING': [('full_groom','Kompletná úprava','kompletna-uprava','Kúpanie, strih a pazúriky'),('bath_dry','Kúpanie a fénovanie','kupanie-a-fenovanie',None),('hand_stripping','Trimovanie','trimovanie','Celá procedúra'),('deshedding','Vyčesávanie podsady','vycesavanie-podsady',None),('nail_trim','Strihanie pazúrikov','strihanie-pazurikov',None),('cat_groom','Úprava mačky','uprava-macky',None)],
 'VET_CLINIC': [('exam','Klinické vyšetrenie','vysetrenie','Základné vyšetrenie bez testov'),('vaccination_dog','Očkovanie psa','ockovanie-psa','Kombinovaná vakcína + besnota'),('microchip','Čipovanie','cipovanie','Čip, aplikácia a registrácia'),('neuter_cat','Kastrácia kocúra','kastracia-kocura','Operácia + anestézia'),('spay_cat','Kastrácia mačky','kastracia-macky','Operácia + anestézia'),('spay_dog','Kastrácia suky','kastracia-suky','Operácia + anestézia')],
 'PET_HOTEL': [('dog_night','Pes, noc','pes-noc',None),('cat_night','Mačka, noc','macka-noc',None),('daycare_day','Psia škôlka, deň','psia-skolka',None),('daycare_pass','Permanentka do škôlky','permanentka-do-skolky',None),('pickup','Dovoz a odvoz','dovoz-a-odvoz','Jedným smerom'),('extra_walk','Venčenie navyše / individuálna starostlivosť','vencenie-navyse',None)],
 'DOG_TRAINING': [('puppy_course','Šteňacia škôlka','stenacia-skolka',None),('obedience_course','Kurz základnej poslušnosti','kurz-poslusnosti',None),('group_lesson','Skupinová hodina','skupinova-hodina',None),('private_lesson','Individuálna hodina','individualna-hodina',None),('behavior_consult','Konzultácia problémového správania','konzultacia-spravania',None),('membership','Členský poplatok','clensky-poplatok',None)],
 'PET_SITTING': [('walk_30','Venčenie 30 min','vencenie-30-min',None),('walk_60','Venčenie 60 min','vencenie-60-min',None),('cat_visit','Návšteva mačky','navsteva-macky',None),('house_sitting_night','Stráženie u vás doma, noc','strazenie-u-vas-doma',None),('boarding_night','Stráženie u opatrovateľa, noc','strazenie-u-opatrovatela',None),('daycare_day','Denné stráženie','denne-strazenie',None)],
}
SPEC = {'surgery':'Chirurgia','orthopedics':'Ortopédia','dentistry':'Stomatológia','dermatology':'Dermatológia','cardiology':'Kardiológia','ophthalmology':'Oftalmológia','oncology':'Onkológia','neurology':'Neurológia','internal-medicine':'Interná medicína','reproduction':'Reprodukcia','rehabilitation':'Rehabilitácia','exotics':'Exotické zvieratá','ultrasound':'Sonografia','x-ray':'RTG','ct':'CT','mri':'Magnetická rezonancia','endoscopy':'Endoskopia','laboratory':'Laboratórium','hospitalization':'Hospitalizácia'}

biz = d['businesses']; by_id = {b['id']: b for b in biz}
cat_of = {b['id']: b['cat'] for b in biz}

# Comparable prices: whole service only (no partial, unit or note).
comp = [p for p in d['prices'] if not p['partial'] and not p['unit'] and not p['note']]
place = {}  # (bid, code) -> cheapest "from" price
for p in comp:
    k = (p['b'], p['code'])
    if k not in place or p['from'] < place[k]: place[k] = p['from']
market = {}
bycode = {}
for (bid, code), v in place.items():
    bycode.setdefault(cat_of[bid] + ':' + code, []).append(v)
for key, vals in bycode.items():
    if len(vals) >= 3:
        market[key] = {'median': statistics.median(vals), 'min': min(vals), 'max': max(vals), 'places': len(vals)}
def tier_for(pct):
    if pct < -25: return 1
    if pct < -7.5: return 2
    if pct <= 7.5: return 3
    if pct <= 25: return 4
    return 5
levels = {}
for bid in by_id:
    ratios = [v / market[cat_of[bid] + ':' + code]['median'] for (b2, code), v in place.items() if b2 == bid and cat_of[bid] + ':' + code in market]
    if ratios:
        pct = round((statistics.median(ratios) - 1) * 100)
        levels[bid] = (tier_for(pct), pct)

logos = sorted({b['logo'] for b in biz if b['logo']})
def short_host(u):
    return re.sub(r'^https?://(www\.)?', '', u or '').rstrip('/') if u else None

out_biz = []
for b in biz:
    ins = b['insights']
    insights = None
    if ins:
        insights = {
            'n': ins.get('reviews_in_period'), 'from': ins.get('period_from'), 'to': ins.get('period_to'),
            'cards': [{'t': c['title']['sk'], 's': c['sentiment'], 'm': c['mentions'], 'x': (c.get('text') or {}).get('sk')} for c in ins.get('cards', [])],
            'faq': [{'q': f['q']['sk'], 'a': f['a']['sk']} for f in ins.get('faq', []) if isinstance(f.get('q'), dict)],
        }
    tier = levels.get(b['id'])
    out_biz.append({
        'id': b['id'], 'n': b['name'], 's': b['slug'], 'c': b['cat'], 'a': b['address'], 'd': b['districtSlug'],
        'ph': b['phone'], 'em': b['email'], 'w': b['web'], 'wh': short_host(b['web']), 'h': b['hours'],
        'sp': [SPEC.get(x, x) for x in (b['spec'] or [])], 'ex': 'exotics' in (b['spec'] or []), 'an': b['animals'] or [],
        'de': b['desc'], 'sh': b['short'], 'r': b['gRating'], 'rc': b['gCount'], 'g': b['gUrl'],
        'lg': ('logos/' + b['logo'].split('/')[-1]) if b['logo'] else None,
        'ins': insights, 'e': b['e247'], 'hv': b['home'], 'ho': b['hoursObserved'], 'hs': short_host(b['hoursSource']),
        'src': (b['sources'] or [None])[0], 'ig': b['ig'], 'fb': b['fb'],
        't': tier[0] if tier else None, 'pct': tier[1] if tier else None,
    })
prices = [{'b': p['b'], 'c': p['code'], 'f': p['from'], 't': p['to'], 'wf': p['wf'], 'wt': p['wt'],
           'n': p['noteLocal'] or p['note'], 'pa': p['partial'], 'u': p['unit'], 'o': p['observed'],
           'cmp': (not p['partial'] and not p['unit'] and not p['note'])} for p in d['prices']]
data = {
  'cats': [{'k': k, 'slug': s, 'label': l, 'short': sh, 'one': one, 'many': many} for k, s, l, sh, one, many in CATS],
  'districts': [{'slug': x['slug'], 'name': x['name'], 'in': x['in']['sk']} for x in d['districts']],
  'services': {k: [{'code': c, 'label': l, 'slug': s, 'inc': i} for c, l, s, i in v] for k, v in SERVICES.items()},
  'market': market, 'biz': out_biz, 'prices': prices,
}
json.dump(data, open(os.path.join(S, 'data.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump(logos, open(os.path.join(S, 'logos.json'), 'w'))
print('biz', len(out_biz), 'prices', len(prices), 'market', len(market), 'levels', len(levels), 'logos', len(logos))
print('size KB', os.path.getsize(os.path.join(S, 'data.json')) // 1024)
print({k: v for k, v in market.items() if k.startswith('VET')})
b = [x for x in out_biz if x['s'] == 'veterinarna-poliklinika-bajvet'][0]; print(b['t'], b['pct'], b['ins']['cards'][0])
