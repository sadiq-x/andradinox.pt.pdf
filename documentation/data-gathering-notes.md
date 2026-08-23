# Andradinox Catalogue — Content & Data Audit

Raw material for the catalogue designer. Everything here comes from live crawls of andradinox.pt on 2026-08-23. Nothing is invented — every gap below is a genuine gap on the live site, not a Claude omission.

## 1. Coverage

- **20 of 20** target product URLs fetched successfully and written to `data/products/products.json`.
- **6 of 6** target category URLs fetched successfully and written to `data/categories/categories.json`.
- All 20 products have: name, breadcrumb/category, description (or explicitly noted as absent), price/price range, and at least one downloaded image.

## 2. Images — download results

**25 of 25 image downloads succeeded (100%).** All files verified with `file` to be genuine JPEG images (not HTML error pages), all at full original phone-camera resolution (2000–4600px on the long edge) — none of the small WordPress size-suffixed thumbnails (`-324x324`, `-416x555` etc.) were needed; the unsuffixed original filenames all resolved directly.

| Product | Images downloaded |
|---|---|
| 16 products | 1 image each (hero.jpg) |
| rede-mosquiteira-inox-aisi-316 | 2 (hero + gallery-2) |
| rede-mosquiteira-nylon-pvc | 2 (hero + gallery-2) |
| rede-mosquiteira-latao | 2 (hero + gallery-2) |
| rede-mosquiteira-inox-brico | 2 (hero + gallery-2) |

Files live under `assets/products/<slug>/`. Zero failures — no retries or fallback-to-thumbnail were needed.

### Image quality/reuse issues to flag before layout
- **Shared/reused photos across different products:** `arame-farpado-plastificado` and `arame-farpado-zincado` (plastic-coated vs. plain galvanized barbed wire — visually different materials) use the **exact same photo file** (`43-Arame-farpado.jpg`). Recommend the client supply a distinct photo of the plastic-coated wire (usually visibly black/green-coated) before print.
- `Mosquiteira-Inox_2.jpg` is reused as the second gallery image on **both** `rede-mosquiteira-inox-aisi-316` and `rede-mosquiteira-inox-brico` — same stock photo, two different SKUs.
- **Mislabeled filename:** the only photo on `rede-electrosoldada-inox-aisi-316` is literally named `12-Rede-electrosoldada-inox-304.jpg` — filename says "304" on the 316 product page. Likely a copy/paste reuse of the 304 photo. Recommend a genuine AISI 316 photo be sourced for accuracy.
- Every product has only 1–2 photos, mostly casual phone shots (Exif shows iPhone XR, Asus Z017D, Motorola XT1032 — i.e., staff phone photos, not studio product photography). For a "premium B2B catalogue" this is a real production constraint — expect to either commission proper photography or lean heavily on layout/graphics to compensate.

### Logo
Downloaded from the URL given to `assets/logos/andradinox-logo-original.jpg`. **Actual dimensions: 260 × 64 px, 4.4 KB, lossy JPEG (quality 82).** This is unambiguously a small cropped web-header logo, not a print-ready asset — at 260px wide it will look pixelated at any size larger than a business card. **A vector (SVG/EPS/AI) or high-resolution PNG logo must be requested from the client before this catalogue goes to print.**

## 3. Missing / null data

- **SKU: every single one of the 20 products has no SKU/Referência on the live site** (all show "REF: n.d." or nothing). If SKUs are needed for the catalogue (e.g. for order forms), the client must supply a SKU list — none exist to scrape.
- **Weight ("Peso"): "n.d." (not available) on every product that has a spec table field for it.** No weight data exists on the site at all.
- 6 of 6 category pages have **no intro/description copy** — all `description` fields in categories.json are `null`. If the catalogue wants category-intro paragraphs, new copy will need to be written/approved by the client (cannot be scraped, doesn't exist).
- `rede-mosquiteira-nylon-pvc` has no detailed spec/pricing table — only a single flat price and "Peso: n.d." (see price anomaly below).
- Several products' variant dropdowns list mesh/wire/opening values that don't appear anywhere in the visible pricing table (`teia-inox-aisi-316`, `rede-electrosoldada-inox-aisi-304`, `rede-electrosoldada-inox-aisi-304-em-painel`, `rede-mosquiteira-inox-aisi-304`, `rede-mosquiteira-inox-aisi-316`). This looks like leftover/orphaned WooCommerce variation data on the live site rather than a scraping miss — flagged per-product in `products.json` notes, not guessed at or filled in.

## 4. Terminology inconsistencies (need client confirmation — NOT silently merged)

1. **"Zincada/Zincado" vs. "Galvanizada"** — both mean "galvanized" in Portuguese, but the site uses them for different product lines: `teia-zincada`, `arame-farpado-zincado` use "Zincad-"; `rede-mosquiteira-galvanizada` uses "Galvanizada". The product description text elsewhere also says "arame galvanizado (H.D)". Unclear if this reflects two different processes/grades or is just inconsistent copywriting. **Do not merge these terms in the catalogue without asking the client which is correct/intended.**
2. **"MT" unit** — roll widths/lengths are shown on-site as e.g. "1.00MT", "1.25MT". I normalized this to "1.00 m" / "1.25 m" for formatting consistency, on the reasonable assumption MT = metros (supported by consistent use alongside m² pricing and "ml" = metro linear elsewhere). This is an assumption, not 100% site-confirmed — worth a quick client sanity check.
3. **VAT/IVA basis inconsistency** — the three "Brico" mosquiteira products (`rede-mosquiteira-inox-brico`, `-aluminio-brico`, `-fibra-anti-fogo-brico`) explicitly label their price as "Preço/rolo **sem IVA**" (excl. VAT). No other product on the site states whether its price includes or excludes VAT. **This needs to be resolved with the client before printing any prices** — either all prices are ex-VAT and it's just unlabeled elsewhere, or there's a real inconsistency.
4. **Fibra Anti-Fogo material** — site calls this material "fibra antifogo" (fire-resistant fiber) but never explicitly says "fibra de vidro" (fiberglass). Recorded verbatim as "Fibra Anti-Fogo" rather than assuming it's fiberglass.

## 5. Pricing anomalies worth a second look

- **`rede-mosquiteira-nylon-pvc`: €18.00 for a full 1m × 30m roll** works out to €0.60/m², far below every comparable mosquiteira product (roughly €1.17–€3.70/m² material cost elsewhere on the site). Could be a genuine site pricing error, a clearance price, or a different pricing basis Claude couldn't determine from the page. Recommend confirming this price with the client before printing.
- **`arame-farpado-zincado`: the category archive page shows the range as "€0.00 – €40.05"** (a €0 floor), which doesn't match any real row on the product page (real floor is €11.96). Likely a WooCommerce display bug on the live site involving a hidden/empty-priced variant. The product-page-derived range (€11.96–€40.05) was used in products.json instead of the buggy category-page range.
- `rede-mosquiteira-aluminio` and `rede-mosquiteira-fibra-anti-fogo`: the displayed price ranges (e.g. €76.50–€114.75) only make sense as **full-roll totals** (per-m² price × roll area), not as a per-m² figure — worth double-checking the catalogue presents these the same way the client's actual price list/checkout does.

## 6. Structural/categorization notes

- `arame-inox-brico` is named with "Brico" in its title and breadcrumb-categorized under "Arame," but it does **not** appear on the site's own "Brico" category archive page (only the 3 mosquiteira-brico products do). Naming vs. actual site categorization is inconsistent for this one product.
- The "Brico" category is a genuine cross-listing on the live site — its 3 products also belong to "Rede Mosquiteira." `categories.json` reflects this (they appear under both categories), which is intentional, not a duplication error.

## 7. Summary of top gaps for the designer

1. **Logo is not print-ready** — 260×64px JPEG, needs a vector/high-res replacement from the client before layout.
2. **Zero SKUs and zero weights exist anywhere on the site** — if the catalogue design assumes these fields, that's new content the client must supply.
3. **VAT basis of listed prices is unclear/inconsistent** (3 Brico products explicitly say ex-VAT, nothing else specifies) — confirm with client before printing any price.
4. **Photography is thin and inconsistent** — mostly 1 casual phone photo per product, two products share an identical photo despite being different materials, one product's photo file is literally named after the wrong grade (304 vs 316). Consider new photography or heavier reliance on iconography/diagrams in the design.
5. **"Zincada" vs. "Galvanizada" terminology** is used inconsistently for what may or may not be the same material — needs a client decision before writing catalogue copy, so the print piece doesn't imply two different products where there's really one.
