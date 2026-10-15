# Category pages — design

## Context

wtfish (`apps/web`) is a static Astro site with 69 fish. Today a visitor can
only reach a fish from the home page grid, where the filters work in the
browser. There is no page for a kind of fish, such as "fish in Sabah" or
"mangrove fish".

The user wants pages for each characteristic of a fish. They serve two
purposes:
- **Google:** each page answers a search such as "fish in Sabah" or "invasive
  fish Malaysia" with its own address, title and description.
- **Browsing on the site:** a reader on a fish page can click a tag, such as
  "Mangroves", and see every fish that shares it.

The choices below were made with the user in a brainstorming session. They
asked for plain words on the pages, with no jargon.

The work is split into two plans:
- **Plan A:** the category pages, and the tags on fish pages becoming links.
- **Plan B:** a Browse page listing every category page, linked from the top
  menu.

## Decisions

- **Groups.** Pages for water types, uses, habitats, states, and two
  conservation lists: threatened fish, and introduced and invasive fish in
  Malaysia.
- **No family pages.** Most of the 35 families have only 1 or 2 fish.
- **A page for every category that has at least one fish.** Pages grow as fish
  are added. A category with no fish gets no page, because an empty page helps
  nobody; it appears by itself when its first fish is added. Today that leaves
  out two states, Labuan and Putrajaya, and gives **33 pages**.
- **Invasive is about a place.** A fish is invasive where people brought it and
  it spreads and harms local fish; the same fish is native in its home range.
  The data's `malaysia.status` is about Malaysia only, so that page is
  "Introduced and invasive fish in Malaysia" and sits under `/malaysia/`. The
  IUCN Red List is worldwide, so "Threatened fish" is not tied to a country.
- **Room for countries.** States and the invasive list sit under `/malaysia/`,
  so other countries can be added later as, for example, `/indonesia/bali/`.
  Country pages aren't part of this work.
- **Branch.** The work goes on `feat/category-pages`, made from
  `feat/wet-market-redesign` because PR #1 isn't merged yet. Its pull request
  targets `staging`.

## The pages

Each page has:
- an **address** under its group;
- a **name**, used for links, such as "Mangroves";
- a **title**, used as the heading and in the browser tab;
- a **description** of one or two plain sentences. It's general, needs no
  sources, and is also the description Google shows, so it is at most 160
  characters.

| Group | Address | Name | Title | Description |
|---|---|---|---|---|
| Water | `/water/freshwater/` | Freshwater | Freshwater fish | Fish of rivers, lakes, swamps and reservoirs, where the water has almost no salt. Many popular aquarium fish come from fresh water. |
| Water | `/water/brackish/` | Brackish | Brackish water fish | Fish of water that is part fresh and part salt, where rivers meet the sea in estuaries and mangroves. Many move between rivers and the sea. |
| Water | `/water/saltwater/` | Saltwater | Saltwater fish | Fish of the sea, from coral reefs and coasts to the open ocean. Malaysia's seas include the Strait of Malacca and the South China, Sulu and Celebes Seas. |
| Use | `/use/sport/` | Sport fishing | Sport fish | Fish that anglers go after for the fight, from snakeheads in rivers to sailfish at sea. Many anglers release what they catch. |
| Use | `/use/food/` | Food | Food fish | Fish caught or farmed to eat, from wet-market staples such as mackerel and pomfret to prized river fish. |
| Use | `/use/aquarium/` | Aquarium | Aquarium fish | Fish kept in home aquariums, from tiny rasboras and tetras to large arowanas. Malaysia breeds many aquarium fish for sale overseas. |
| Habitat | `/habitat/forest-rivers/` | Forest rivers | Forest river fish | Fish of clear, fast streams under rainforest, often over rocks and gravel. They need clean, shaded water and suffer when forests are cleared. |
| Habitat | `/habitat/lowland-rivers/` | Lowland rivers | Lowland river fish | Fish of the slow, wide rivers that wind across the plains towards the sea, often with muddy water and soft banks. |
| Habitat | `/habitat/lakes/` | Lakes | Lake fish | Fish of natural lakes and ponds, where the water is still or slow. Many lake fish also do well in reservoirs. |
| Habitat | `/habitat/reservoirs/` | Reservoirs | Reservoir fish | Fish of the lakes made by dams, such as Kenyir in Terengganu and Temenggor in Perak. Many anglers fish them from boats. |
| Habitat | `/habitat/peat-swamps/` | Peat swamps | Peat swamp fish | Fish of dark, acidic water in swamp forests on deep peat. Many live nowhere else, so they suffer when swamps are drained. |
| Habitat | `/habitat/rice-fields/` | Rice fields and canals | Rice field and canal fish | Fish of rice fields, irrigation canals and ditches, where the water is shallow and warm. Hardy fish such as snakeheads do well here. |
| Habitat | `/habitat/mangroves/` | Mangroves | Mangrove fish | Mangroves are coastal forests that flood with each tide. Their roots shelter young fish, which is why many sea fish start life here. |
| Habitat | `/habitat/estuaries/` | Estuaries | Estuary fish | Fish of river mouths, where fresh water mixes with the sea and the saltiness changes with the tide. |
| Habitat | `/habitat/coastal/` | Coastal waters | Coastal fish | Fish of the shallow sea near the shore, over sand, mud and seagrass. Many of the sea fish sold in wet markets are caught here. |
| Habitat | `/habitat/reefs/` | Reefs | Reef fish | Fish of coral and rocky reefs, among the most colourful in the sea. Malaysia's reefs are mostly around Sabah and the islands off the east coast. |
| Habitat | `/habitat/open-ocean/` | Open ocean | Open ocean fish | Fish of the open sea far from shore, such as tuna, marlin and sailfish. Many are fast swimmers that travel long distances. |
| State | `/malaysia/johor/` | Johor | Fish in Johor | The southern tip of the peninsula, with coasts on both the Strait of Malacca and the South China Sea, and peat swamps inland. |
| State | `/malaysia/kedah/` | Kedah | Fish in Kedah | A state in the northwest of the peninsula, known for its rice fields, with a coast on the Strait of Malacca and the islands of Langkawi. |
| State | `/malaysia/kelantan/` | Kelantan | Fish in Kelantan | A state in the northeast of the peninsula, drained by the Kelantan River and its forest streams, with a coast on the South China Sea. |
| State | `/malaysia/melaka/` | Melaka | Fish in Melaka | A small state on the Strait of Malacca, with mudflats and mangroves along its coast and the Melaka River running through it. |
| State | `/malaysia/negeri-sembilan/` | Negeri Sembilan | Fish in Negeri Sembilan | A state on the Strait of Malacca between Selangor and Melaka, with hill streams inland and the coast at Port Dickson. |
| State | `/malaysia/pahang/` | Pahang | Fish in Pahang | The largest state on the peninsula, with the long Pahang River, Lake Chini and Lake Bera, and a coast on the South China Sea. |
| State | `/malaysia/perak/` | Perak | Fish in Perak | A state on the west of the peninsula, drained by the Perak River, with large reservoirs such as Temenggor and old tin-mining pools. |
| State | `/malaysia/perlis/` | Perlis | Fish in Perlis | Malaysia's smallest state, in the far northwest by the Thai border, with rice fields and a short coast. |
| State | `/malaysia/pulau-pinang/` | Pulau Pinang | Fish in Pulau Pinang | Penang Island and a strip of mainland in the northwest of the peninsula, facing the Strait of Malacca. |
| State | `/malaysia/sabah/` | Sabah | Fish in Sabah | The north of Borneo, with coral reefs, the Kinabatangan River and three seas: the South China Sea, the Sulu Sea and the Celebes Sea. |
| State | `/malaysia/sarawak/` | Sarawak | Fish in Sarawak | Malaysia's largest state, in northwest Borneo, with the long Rajang River, wide peat swamps and a long South China Sea coast. |
| State | `/malaysia/selangor/` | Selangor | Fish in Selangor | The state around Kuala Lumpur, on the Strait of Malacca, with mangrove coasts, peat swamps and old mining pools. |
| State | `/malaysia/terengganu/` | Terengganu | Fish in Terengganu | A state on the east coast of the peninsula, with Kenyir Lake, island reefs such as Redang and a long South China Sea coast. |
| State | `/malaysia/kuala-lumpur/` | Kuala Lumpur | Fish in Kuala Lumpur | Malaysia's capital, a federal territory where the Klang and Gombak rivers meet. |
| State | `/malaysia/labuan/` | Labuan | Fish in Labuan | A federal territory of islands off the coast of Sabah, in the South China Sea. |
| State | `/malaysia/putrajaya/` | Putrajaya | Fish in Putrajaya | The federal government's city, a federal territory built around a large man-made lake and wetlands. |
| Conservation | `/threatened/` | Threatened | Threatened fish | Fish the IUCN Red List rates as Vulnerable, Endangered or Critically Endangered, so at risk of dying out in the wild. The ratings are worldwide. |
| Conservation | `/malaysia/invasive/` | Introduced and invasive | Introduced and invasive fish in Malaysia | Fish that people brought to Malaysia. Introduced fish live here; invasive ones spread and harm local fish. The same fish can be native in its home range. |

Labuan and Putrajaya have descriptions so that their pages appear, complete,
as soon as a fish is recorded there.

**Group labels and headings:**

| Group | Label above the title | Heading of the group's links |
|---|---|---|
| Water | Water | Water types |
| Use | Use | Uses |
| Habitat | Habitat | Habitats |
| State | State in Malaysia | States in Malaysia |
| Conservation | Conservation | Conservation |

## Which fish go on each page

| Group | A fish is on the page when |
|---|---|
| Water | its `water` includes the type |
| Use | its `uses` includes the use |
| Habitat | its `habitat.environments` includes the habitat |
| State | its `malaysia.states` has a record for the state |
| Threatened | its `iucn` is VU, EN or CR (`THREATENED` in `src/lib/filter.ts`). Extinct fish (EX, EW) are not on it. |
| Introduced and invasive | its `malaysia.status` is `introduced` or `invasive` |

A fish is on every page it belongs to. For example, the barramundi is on all
three water pages. The counts are never typed by hand; they're counted when
the site is built.

## Plan A: the category pages

### Layout

One template draws every category page:
1. **Top band.** The tiled band used by Identify and About, with:
   - the group label in small salt capitals, such as "Habitat";
   - the title as the page heading, such as "Mangrove fish";
   - the description;
   - on state pages only, the note "Based on open-licence records on GBIF.
     Few records can mean few surveys, not few fish.";
   - the count, such as "3 fish".
2. **Fish cards.** The home page's cards, in the same grid, A to Z by English
   name. No filters.
3. **The group's links.** Under a thin line, the group heading (such as
   "Habitats") and a row of chips, one per page in the group that has fish,
   each with its count, such as "Reefs · 12". The current page's chip is
   salt on `salt-soft` and isn't a link.

The browser tab reads "{title} | wtfish", and the description is the page's
`<meta name="description">`.

### Tags on fish pages become links

| On a fish page | Links to |
|---|---|
| Each water chip | its water page |
| Each word on the cardboard use tag ("Sport · Food") | its use page |
| Each habitat chip | its habitat page |
| Each state name in "Recorded in Pahang, Perak and Sabah" | its state page |
| The "Introduced to Malaysia" or "Invasive in Malaysia" badge | `/malaysia/invasive/` |
| The "Vulnerable", "Endangered" or "Critically Endangered" badge | `/threatened/` |

- **The tags look the same.** A linked tag underlines on hover and on
  keyboard focus, and gets the site's usual focus outline.
  (Changed after review, 2026-10-16: the state names in the sentence under
  the map are always underlined, like the GBIF link beside them, because a
  link inside a sentence needs an underline to be noticed.)
- **Tags with no page stay plain text:** "Native to Malaysia", "Endemic to
  Malaysia", the other IUCN categories, and the fishing methods and baits.
- **The state map stays a picture.** The sentence under it has the links.
- **Cards don't change.** A card is already one link, and a link can't hold
  another link, so the tags inside cards stay plain text.
- A fish's tag link always leads to a page, because that fish puts the
  category on the list.

### Code

- **`src/lib/categories.ts`** (new) holds:
  - the groups, their labels and headings, and the state note;
  - the address of each page, built by `waterPath`, `usePath`, `habitatPath`
    and `statePath`, plus `THREATENED_PATH` and `INTRODUCED_PATH`;
  - `statusPath` and `iucnPath`, which give a badge's page, or nothing;
  - every page's name, title and description, and the rule for which fish
    belong;
  - `fishIn` (a page's fish, A to Z), `categoriesWithFish` (the pages to
    build) and `groupLinks` (a group's chips with counts).

  It doesn't import `astro:content`, so unit tests can run it directly.
- **`src/pages/[...category].astro`** (new) builds every page with fish from
  that list. It's one route for every group, so a future group or country
  needs no new route file.
- **`src/components/CategoryLinks.astro`** (new) draws a row of chips. Plan B
  reuses it.
- **`src/lib/format.ts`** gains `listParts`, which splits "Pahang, Perak, and
  Sabah" into the names and the words between them, so each name can be a
  link.
- `WaterLabel` gains an optional `href`, and `UseTag` an optional `linked`.
  Without them they're drawn exactly as today, so cards don't change.

## Plan B: the Browse page

- **Address:** `/browse/`, titled "Browse fish", with the label "Browse" and
  the text "Find fish by water, use, habitat, state or conservation status."
- **Content:** one section per group, in the order Water, Use, Habitat,
  States in Malaysia, Conservation. Each section has the group's heading and
  its chips with counts, such as "Sabah · 26". Each section's heading has the
  group's id (`#water`, `#use`, `#habitat`, `#state`, `#conservation`).
- **Top menu:** "Browse" sits between "Fish" and "Identify", and is marked as
  the current page on `/browse/`.
  - Four links don't fit beside the logo on a 360 px phone with today's
    spacing. Below 640 px the links get 6 px side padding instead of 10 px,
    no gap between them, and an 8 px gap after the logo. They then fit on one
    row from 360 px.
  - Below 360 px the menu wraps under the logo instead of making the page
    scroll sideways.
- **Category pages:** the group label above the title becomes a link to its
  section on the Browse page, such as `/browse/#habitat`.

## Testing

**Unit tests** (`pnpm test`):
- every water type, use, habitat and state has exactly one page, plus the two
  conservation pages;
- names, titles and descriptions are filled in, unique, and descriptions are
  40–160 characters;
- addresses are lower case, unique, and never start with `/fish/`,
  `/identify/`, `/about/` or `/browse/`;
- the exact addresses and titles of a sample of pages;
- which fish go on each kind of page, including a fish on several pages,
  threatened (not extinct) fish, and introduced and invasive (not native or
  endemic) fish;
- pages with no fish are left out;
- `listParts` joins back into the same text as `listOf`.

**Build tests** (`pnpm test:build`):
- a page is built for each category with fish, and none for the rest;
- each page's tab title, description, heading and group label;
- each page's cards, A to Z, and its count;
- no filters on category pages;
- each page's group links, with counts, and the current page marked;
- the GBIF note on state pages only;
- every fish page links each of its tags, and links its status and IUCN
  badges only when they have a page;
- every internal link on every built page leads to a built file;
- every fish card is still a single link;
- the existing English-only tests cover the new pages, so no Malay fish names
  or Malay words appear in the descriptions.

**In a browser** (a throwaway Playwright script, not committed): no page
scrolls sideways at 360, 768 or 1280 px; for Plan B, the menu fits on one row
from 360 px and nothing scrolls sideways at 320 px.

## Out of scope

- Country pages, and the `/malaysia/` page itself.
- Family pages.
- Filters or sorting on category pages.
- Links on the state map tiles and inside fish cards.
- A sitemap.
