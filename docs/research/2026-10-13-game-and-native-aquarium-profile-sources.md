# Game fish and native aquarium profile research

Reviewed 13 October 2026. Covers the twelve existing game-fish profiles and
five new native aquarium profiles. Facts were restated in original language;
no source photographs or descriptive passages were copied into profiles.
Every profile lists the URLs supporting its populated fields.

## Source choices

- NOAA Fisheries and the U.S. Fish and Wildlife Service provide primary
  government accounts for marine and freshwater game fish. The USGS
  Nonindigenous Aquatic Species database provides current largemouth-bass
  naming, native range and common-carp ecology.
- Florida Fish and Wildlife Conservation Commission species accounts provide
  red-drum and Atlantic-tarpon identification, habitat and reported lengths.
  Michigan DNR and FWS support northern-pike identification and ecology.
- The Aquarium Wiki explicitly licenses its text under CC BY-SA 3.0. Its
  individual species pages support factual tank-volume, temperature, pH and
  temperament bundles for harlequin rasbora, chocolate gourami, Penang betta
  and dwarf rasbora. These numeric facts are recorded with source links;
  no wiki paragraphs were adapted or reproduced.
- Tan and Ng's 2005 Raffles Bulletin revision supports wild Betta identity,
  Malaysian distribution and habitat. Tan's 2020 Trigonostigma revision
  distinguishes harlequin rasbora from the newly described T. truncata.
- The Malaysian biodiversity database MyBIS supports local occurrence;
  its photograph licences were not treated as permission to download images.
  Photographs on that site can be non-commercial and were not copied.
- Neither FishBase nor the IUCN Red List site/API was used to populate fields.
  Conservation categories are imported separately from Wikidata.

## Taxonomic decisions

[Largemouth bass](https://researcharchive.calacademy.org/research/ichthyology/catalog/fishcatget.asp?spid=19779)
uses **Micropterus nigricans**. The Catalog of Fishes entry, current USGS
profile and [FWC naming announcement](https://myfwc.com/news/all-news/bass-name-724/)
agree. Older FWS descriptive material uses M. salmoides for the broader
historic concept, so the profile explains the name change. Taxonomic IDs
associated with the old scientific name were removed pending a fresh import.

Atlantic blue marlin keeps **Makaira nigricans**. [WoRMS](https://www.marinespecies.org/aphia.php?p=taxlist&tName=Makaira)
separates Indo-Pacific M. mazara, while NOAA's current Pacific blue-marlin
account uses M. nigricans across oceans. The profile explicitly records this
inconsistency and does not infer a Malaysian status for the Atlantic entry.

**Betta persephone is marked native, not endemic.** Tan and Ng (2005)
restricted it to Johor, but [Ding et al. (2025)](https://doi.org/10.3897/zookeys.1238.142857)
examined B. persephone from Sumatra and Peninsular Malaysia and suggested
that B. miniopinna represents a Bintan population of B. persephone. This
newer phylogenetic result makes an unconditional Malaysia-endemic claim
inappropriate. The profile preserves the Johor occurrence and explains the
range issue. No replacement scientific name was invented.

No generic Malay name was assigned to the five native aquarium fish. A name
such as “seluang” needs a source linking it to the particular species.
Yellowfin tuna uses DOF's “Tuna sirip kuning”, rather than a guessed name.

## Deliberate omissions and limits

Fishing methods, bait recommendations, seasons and named fishing spots
were omitted from these profiles because the required two independent
sources were not established. General sport-fishing use does not itself
justify a detailed fishing recommendation. Numeric aquarium conditions
were not inferred from wild-water measurements or laboratory tank sizes.

**Betta persephone has no aquarium-care object.** No complete commercially
reusable numeric bundle with tank minimum, temperature, pH and temperament
was verified. Seriously Fish's non-commercial reuse terms rule out
restating its care sheet commercially. Incomplete or invented values were
not supplied to satisfy the schema. Identification and habitat remain
sourced and visible; the missing care section stays hidden.

Unsupported legacy size maxima were removed. Where retained or replaced,
reported maxima were traced to the listed sources; inches, feet and pounds
were converted into centimetres and kilograms. Standard-length values from
museum sample series were not presented as total-length species maxima.

Mahi-mahi has a Malaysian native status supported by MyBIS's Pahang record
and local checklist. Yellowfin tuna's DOF page describes Malaysian-vessel
catches in the Indian Ocean; that alone does not establish presence in
Malaysian waters, so its Malaysian-status object was omitted. Common carp's
Malaysian wild establishment also needs an appropriate local source and is
not inferred solely from aquaculture or imported-fish lists.

Photo presence and identity are verified in a separate tool/browser pass.
A sources list and reviewed date certify the populated text fields; they
do not imply that every optional section has enough evidence to fill.

## Manual Commons photo audit

Original file bytes were downloaded to temporary storage and each image was
opened before copying it into public assets and publishing metadata. No
local resizing, colour changes or saved crops were applied.

| Profile | Commons source | Author credit | Exact licence | Visual audit |
|---|---|---|---|---|
| Cardinal tetra | [Cardinal tetra.jpg](https://commons.wikimedia.org/wiki/File:Cardinal_tetra.jpg) | Lerdsuwa | CC BY-SA 3.0 | Full-length red lower stripe and blue upper stripe; consistent with cardinal rather than neon tetra. |
| Discus | [Symphysodon aequifasciatus.jpg](https://commons.wikimedia.org/wiki/File:Symphysodon_aequifasciatus.jpg) | Discus (Dutch Wikipedia) | CC BY-SA 3.0 | Disc-shaped aquarium fish; uploader explicitly identifies the Leopard Snakeskin cultivar of S. aequifasciatus. Captive forms are allowed for this aquarium profile. |
| Hemibagrus wyckioides | [Redtail-Catfish.jpg](https://commons.wikimedia.org/wiki/File:Redtail-Catfish.jpg) | FloUdon | CC BY-SA 3.0 | Elongate Asian catfish with red tail and barbels; source explicitly identifies H. wyckioides, consistent with the image. |
| Neon tetra | [Paracheirodon innesi.jpg](https://commons.wikimedia.org/wiki/File:Paracheirodon_innesi.jpg) | Leo D'lion | CC BY-SA 2.0 | Red stripe confined chiefly to rear half, pale forward belly and blue upper stripe distinguish it from cardinal tetra. |

The candidate [Chitala lopis.jpg](https://commons.wikimedia.org/wiki/File:Chitala_lopis.jpg)
(BEDO Thailand, CC BY-SA 4.0) was opened but **not published**. Its general
featherback appearance is consistent with Chitala, but species-level
identity cannot be established confidently given the recently revised
lopis/borneensis complex and missing specimen provenance. The Commons
category also includes a research photograph explicitly labelled
“Chitala cf. lopis”; that qualified identification is not strong enough to
present as a confirmed species photograph. The giant-featherback profile
therefore deliberately omits the photo section.
