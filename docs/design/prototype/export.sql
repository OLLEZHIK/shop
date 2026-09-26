\pset format unaligned
\pset tuples_only on
select json_build_object(
 'businesses', (select json_agg(json_build_object(
   'id', b.id, 'name', b.name, 'slug', b.slug, 'cat', b.category, 'address', b.address,
   'district', d.name, 'districtSlug', d.slug, 'districtIn', d."inPhrases",
   'lat', b.lat, 'lng', b.lng, 'phone', b.phone, 'email', b.email, 'web', b.website,
   'hours', b."openingHours", 'animals', b.animals, 'spec', b.specialties,
   'verified', to_char(b."verifiedAt", 'YYYY-MM-DD'), 'sources', b."sourceUrls",
   'desc', coalesce(b."descriptionLocal", b.description), 'short', coalesce(b."shortDescriptionLocal", b."shortDescription"),
   'gRating', b."googleRating", 'gCount', b."googleRatingCount", 'gUrl', b."googleMapsUrl",
   'logo', b."logoFile", 'insights', b."reviewInsights", 'e247', b."emergency247", 'emergencyNote', b."emergencyNote",
   'home', b."homeVisits", 'hoursObserved', to_char(b."hoursObservedAt", 'YYYY-MM-DD'), 'hoursSource', b."hoursSourceUrl",
   'langs', b."languagesSpoken", 'ig', b.instagram, 'fb', b.facebook
 ) order by b.id) from "Business" b left join "District" d on d.id=b."districtId"),
 'prices', (select json_agg(json_build_object(
   'b', p."businessId", 'code', split_part(s.slug, ':', 2), 'from', p."priceFrom"::float, 'to', p."priceTo"::float,
   'wf', p."weightFromKg", 'wt', p."weightToKg", 'note', p.note, 'noteLocal', p."noteLocal", 'partial', p.partial, 'unit', p.unit,
   'observed', to_char(p."observedAt", 'YYYY-MM-DD'), 'src', p."sourceUrl"
 ) order by p.id) from "PriceItem" p join "Service" s on s.id=p."serviceId"),
 'districts', (select json_agg(json_build_object('name', name, 'slug', slug, 'in', "inPhrases") order by name) from "District")
);
