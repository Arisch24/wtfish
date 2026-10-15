# Malaysia fish profiles — design

## Context

The directory in `apps/web` holds 27 mostly non-Malaysian fish with seven thin
fields each (name, scientific name, family, category, water, max length,
summary), written from memory with no sources. The user wants much richer
profiles — real/local names, scientific name, habitat, freshwater/saltwater,
where they can be caught, "whatever you can find" — starting with fish found
in Malaysia.

Data is already one JSON file per fish in `apps/web/data/fish/<id>.json`,
loaded with Astro's `glob()` loader (commit `1e6e98f` on branch
`refactor/fish-per-file`, not yet merged into `main`). This work happens on
`feat/malaysia-fish-profiles`, which is branched from `refactor/fish-per-file`.

The site is commercial, so every source must allow commercial use.

## Decisions

- **English name leads** each page and is the basis of the fish's id / URL
  (`/fish/giant-snakehead/`). The Malay name is shown directly under it and is
  searchable. When a fish has no usable English name, or two fish share one,
  the id falls back to the scientific name (`/fish/betta-persephone/`).
- **The 27 existing fish stay** and are rewritten into the new shape. Two of
  them are also on the Malaysian list and are merged rather than duplicated:
  `barramundi` = siakap, `giant-trevally` = gerepuh.
- **~45 Malaysian fish in the first batch**, giving ~69 fish in total.
- Until a fish has been researched it shows a **"Not yet fact-checked"** label
  instead of pretending to be reviewed.

## What a fish page shows

Sections in page order. A section is hidden when the fish has no data for it
(e.g. no "Aquarium care" for a sailfish, no "Where in Malaysia" for a walleye).

1. **Names** — English name (headline), scientific name, Malay name, other
   local / regional names (giant trevally is *gerepuh*, *ebek* or *cupak*
   depending on the state).
2. **Photo** — first photo large, with credit and licence.
3. **Summary** — two or three sentences.
4. **Quick facts** — water (freshwater / brackish / saltwater), uses (sport /
   food / aquarium), status in Malaysia (native / endemic / introduced /
   invasive), IUCN Red List category, size, family and order.
5. **How to identify** — 3–5 visible features, plus **look-alikes** with the
   tell-apart feature (sebarau vs tengas; siakap vs siakap merah).
6. **Habitat** — environments (forest river, reservoir, peat swamp, mangrove,
   reef, open ocean…), description, native range, diet.
7. **Where in Malaysia** — states it is recorded in (from GBIF, with a note
   that few records can mean few surveys), plus hand-picked well-known spots
   (Tasik Kenyir, Royal Belum / Temenggor, Rompin, Pulau Aur…).
8. **Catching it** — season (tied to the monsoon: east coast slows Nov–Feb),
   methods, common baits/lures, difficulty.
9. **Rules and conservation** — Malaysian protection (sanctuaries, state
   inland-fisheries rules, catch-and-release zones, CITES for arowana),
   banned/invasive status (e.g. *baung ekor merah* banned from 1 July 2024).
   The page always adds "Rules change and differ by state. Check with your
   state Fisheries Office before you fish." and the date last checked, so the
   rules text itself doesn't repeat them.
10. **Eating** — food value and how it is commonly cooked or sold.
11. **Aquarium care** — tank size, temperature, pH, temperament, group size.
12. **More photos**, then **Sources** and "Last reviewed <date>" (or "not
    fact-checked yet").

The directory index searches across English, Malay, scientific and other
names, and filters by water, use, Malaysian state, status in Malaysia (incl.
"found in Malaysia — any"), and "threatened only" (IUCN VU / EN / CR).

## Data shape (one file per fish)

Only six fields are required, so every existing fish is valid on day one:
`names.english`, `names.scientific`, `taxonomy.family`, `water`, `uses`,
`summary`. Everything else is optional. A fish with `lastReviewed` set must
list at least one source. Unknown keys are rejected so typos fail the build.

Fields marked *(gen)* are written by the import script from open data; all
others are researched and written by hand in our own words.

Example, `data/fish/malaysian-mahseer.json` (facts illustrative — verified in
the research batch):

```json
{
  "names": {
    "english": "Malaysian mahseer",
    "scientific": "Tor tambroides",
    "malay": "Kelah",
    "other": ["Kelah merah", "Empurau (Sarawak)", "Thai mahseer"]
  },
  "taxonomy": { "family": "Cyprinidae", "order": "Cypriniformes", "gbifKey": 2364503, "wikidata": "Q3768599" },
  "water": ["freshwater"],
  "uses": ["sport", "food"],
  "summary": "Malaysia's most prized river fish …",
  "nativeRange": "Mainland Southeast Asia, the Malay Peninsula and Borneo.",
  "iucn": "DD",
  "size": { "maxCm": 100, "commonCm": 50, "maxKg": 20 },
  "identify": {
    "features": ["Large scales", "Thick lips with a fleshy lobe", "Two pairs of barbels"],
    "lookAlikes": [{ "id": "soro-brook-carp", "difference": "Tengas has thin lips without the lobe and stays smaller." }]
  },
  "habitat": {
    "environments": ["forest-river", "reservoir"],
    "description": "Clear, fast upland rivers with rocky beds under forest canopy.",
    "diet": "Omnivore — fallen fruit and seeds, insects, small fish."
  },
  "malaysia": {
    "status": "native",
    "states": [{ "state": "Sarawak", "records": 42 }, { "state": "Pahang", "records": 16 }],
    "spots": ["Tasik Kenyir (Kelah Sanctuary, Sungai Petang)", "Taman Negara (Sungai Tahan)"],
    "rules": "Protected in Terengganu: catching, moving or killing kelah needs written permission from the state Fisheries Director. Kenyir Kelah Sanctuary is catch-and-release only."
  },
  "fishing": { "season": "Year-round; rivers run high and murky in the Nov–Feb monsoon.", "methods": ["bottom-bait", "casting"], "baits": ["Oil palm fruit"], "difficulty": "hard" },
  "eating": "One of the most expensive freshwater fish in Malaysia; usually steamed.",
  "photos": [{ "file": "inat-123456.jpg", "credit": "(c) Someone, some rights reserved (CC BY)", "license": "CC BY", "url": "https://www.inaturalist.org/photos/123456" }],
  "sources": ["https://www.wikidata.org/wiki/Q3768599", "https://www.gbif.org/species/2364503"],
  "lastReviewed": "2026-10-13"
}
```

*(gen)* fields: `taxonomy.order`, `taxonomy.family`, `taxonomy.gbifKey`,
`taxonomy.wikidata`, `iucn`, `malaysia.states` (only when a `malaysia`
section already exists — whether a fish is native or introduced is a
research decision, not something the script guesses).

Controlled values:

- `water`: `freshwater`, `brackish`, `marine` (shown as "Saltwater")
- `uses`: `sport`, `food`, `aquarium`
- `malaysia.status`: `native`, `endemic`, `introduced`, `invasive`
- `habitat.environments`: `forest-river`, `lowland-river`, `lake`,
  `reservoir`, `peat-swamp`, `rice-field`, `mangrove`, `estuary`, `coastal`,
  `reef`, `offshore`
- `iucn`: `LC`, `NT`, `VU`, `EN`, `CR`, `EW`, `EX`, `DD`, `NE`
- `fishing.methods`: `casting`, `jigging`, `trolling`, `fly`, `bottom-bait`,
  `popping`, `float`
- `fishing.difficulty`: `easy`, `moderate`, `hard`
- `aquarium.temperament`: `peaceful`, `semi-aggressive`, `aggressive`
- `photos[].license`: `CC0`, `CC BY`, `CC BY-SA`
- states: the 13 states + 3 federal territories, spelled one way

## Sources and licensing

| Source | What we take | Licence | Notes |
|---|---|---|---|
| **Wikidata** | IUCN category, Wikidata id; Malay label as a *suggestion* | CC0 | Malay labels are uneven (gives GT as *bagat mamung*) — printed for a human to check, never written automatically. IUCN status can lag the live Red List. |
| **GBIF** | Taxonomy (family, order), which Malaysian states a fish is recorded in | Per record | Count CC0 + CC BY records only. State names need cleaning (`sarawak`, `Ile de Bornéo`). |
| **iNaturalist** | Photos | Per photo | CC0 / CC BY / CC BY-SA only, research-grade, Malaysian observations first. Coverage is thin: kelah has **0** usable photos, most others 1–3 from Malaysia. |
| **Wikimedia Commons** | Photo fallback | Per file | Same three licences; credit author. |
| **Catalog of Fishes / WoRMS** | Check valid scientific name | Facts / CC BY | Settles disputes (*Wallago leeri* vs *W. attu*). |
| **Dept. of Fisheries (DOF), state Fisheries Offices, gazetted rules** | Protection, sanctuaries, banned species | Government facts | Cite, re-word, record the date. |
| **DOF "Valid local name of Malaysian marine fishes" (2009)**, DBP glossary | Malay names | Book (facts only) | Best authority for marine Malay names. |
| **News, angling sites, charter operators** | Spots, seasons, baits, methods | Copyrighted text | Facts only, our own words, cross-checked with a second source. |
| FishBase | — | CC BY-NC | **Do not copy.** Cross-check only. |
| IUCN Red List API | — | Restricts redistribution / commercial use | **Not used.** Category comes via Wikidata. |

CC BY-SA photos are shown unmodified with credit; share-alike would only bite
if we edited the photo.

## How data gets in

1. **Research batch** (~10 fish): write or rewrite each fish file by hand with
   sources.
2. **Import script** `node scripts/import-open-data.ts <ids…>`: fills the
   *(gen)* fields from GBIF + Wikidata, never touches hand-written fields,
   warns (and writes nothing) when GBIF treats the scientific name as a
   synonym or has no exact match.
3. **Photo script** `node scripts/fetch-photos.ts <id> [count]`: downloads up
   to `count` openly-licensed iNaturalist photos into
   `apps/web/public/photos/<id>/` and records credit + licence.
4. **Checks**: zod schema in the build, plus `pnpm test` (schema rules,
   look-alike links point at real fish, photos exist on disk, no duplicate
   scientific names, ids are lowercase kebab-case).

## Fish list

**27 existing fish (rewritten into the new shape)**
Aquarium: clown-anemonefish, neon-tetra, cardinal-tetra, betta, guppy,
zebra-danio, bronze-corydoras, freshwater-angelfish, discus, oscar, goldfish,
palette-surgeonfish, mandarinfish.
Game: largemouth-bass, bluegill, rainbow-trout, atlantic-salmon,
northern-pike, walleye, common-carp, red-drum, tarpon, mahi-mahi,
yellowfin-tuna, blue-marlin, **barramundi** (= siakap), **giant-trevally**
(= gerepuh).

**42 new Malaysian fish** — id · Malay · scientific. ⚠ = name or taxonomy to
check during research.

Freshwater, native: malaysian-mahseer · Kelah · *Tor tambroides* ·
hampala-barb · Sebarau · *Hampala macrolepidota* · giant-snakehead · Toman ·
*Channa micropeltes* · striped-snakehead · Haruan · *Channa striata* ·
julliens-golden-carp · Temoleh · *Probarbus jullieni* · asian-arowana ·
Kelisa · *Scleropages formosus* · sultan-fish · Jelawat · *Leptobarbus
hoevenii* · asian-redtail-catfish · Baung · *Hemibagrus nemurus* ·
tinfoil-barb · Lampam sungai · *Barbonymus schwanenfeldii* · soro-brook-carp
· Tengas · *Neolissochilus soroides* · climbing-perch · Puyu · *Anabas
testudineus* · wallago-catfish · Tapah · *Wallago leeri* ⚠ ·
giant-featherback · Belida · *Chitala lopis* ⚠ · pangasius-nasutus · Patin
buah · *Pangasius nasutus* ⚠ · giant-gourami · Kaloi · *Osphronemus goramy*
⚠ native status · three-spot-gourami · Sepat benang · *Trichopodus
trichopterus*

Freshwater, introduced / invasive: butterfly-peacock-bass · Ikan raja ·
*Cichla ocellaris* ⚠ (four *Cichla* species in Malaysia) · nile-tilapia ·
Tilapia · *Oreochromis niloticus* · iridescent-shark · Patin sangkar ·
*Pangasianodon hypophthalmus* · north-african-catfish · Keli Afrika ·
*Clarias gariepinus* · pirapitinga · Pacu · *Piaractus brachypomus* ·
hemibagrus-wyckioides · Baung ekor merah · *Hemibagrus wyckioides* (banned)

Brackish / estuary: mangrove-jack · Siakap merah · *Lutjanus
argentimaculatus* · johns-snapper · Jenahak · *Lutjanus johnii* ·
fourfinger-threadfin · Kurau · *Eleutheronema tetradactylum* ⚠

Marine, sport: indo-pacific-sailfish · Layaran · *Istiophorus platypterus* ·
talang-queenfish · Talang · *Scomberoides commersonnianus* ·
narrow-barred-spanish-mackerel · Tenggiri batang · *Scomberomorus commerson*
· hound-needlefish · Todak · *Tylosurus crocodilus* ⚠ · cobia · Aruan tasik
⚠ · *Rachycentron canadum* · brown-marbled-grouper · Kerapu harimau ·
*Epinephelus fuscoguttatus* · giant-grouper · Kerapu kertang · *Epinephelus
lanceolatus*

Marine, food: indian-mackerel · Kembung · *Rastrelliger kanagurta* ·
black-pomfret · Bawal hitam · *Parastromateus niger* · yellowstripe-scad ·
Selar kuning · *Selaroides leptolepis* · kawakawa · Tongkol ⚠ · *Euthynnus
affinis* · humphead-wrasse · Mameng · *Cheilinus undulatus*

Aquarium, native: harlequin-rasbora · Seluang ⚠ · *Trigonostigma
heteromorpha* · chocolate-gourami · *Sphaerichthys osphromenoides* ·
betta-persephone · *Betta persephone* ⚠ · penang-betta · *Betta pugnax* ·
dwarf-rasbora · *Boraras maculatus*

## Accuracy

- **Malay names vary by state** — one headline Malay name plus `other`;
  prefer DOF lists over Wikidata.
- **Taxonomy is moving** — every ⚠ fish is checked against Catalog of Fishes;
  the import script refuses to write taxonomy for GBIF synonyms.
- **Rules change** — the "Before you fish" box always tells readers to check
  with the state Fisheries Office and shows the date the profile was last
  reviewed. The rules text itself repeats neither.
- **No made-up specifics** — unsourced facts stay out; empty sections are
  hidden.

## Out of scope (this pass)

- Occurrence map (needs a map library + GBIF point data).
- Malay-language UI (page chrome stays English).
- User-submitted spots or catches.
- Hosting photos on R2 — photos live in `apps/web/public/photos/`.
