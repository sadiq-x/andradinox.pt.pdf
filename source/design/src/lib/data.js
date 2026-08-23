import fs from 'node:fs';
import path from 'node:path';

// Resolved from the process working directory rather than import.meta.url:
// these modules get bundled by esbuild into a single output file at build
// time, which would otherwise change their on-disk depth and break relative
// path math. All build scripts are run from the project root.
const ROOT = process.cwd();

// Hand-verified fold pairs: a "Brico" (small retail-pack) or "Painel" (panel-format)
// product is not a separate item in the catalogue — it's shown as an additional
// format/variant row on its parent product's detail page. Confirmed against the
// live site's own breadcrumbs/category membership, not guessed from slug patterns
// (e.g. "arame-inox-brico" has no non-Brico sibling, so it stays a standalone product).
const FOLD_PAIRS = {
  'rede-mosquiteira-inox-aisi-304': [
    { slug: 'rede-mosquiteira-inox-brico', label: 'Rolo retalho (linha Brico)' },
  ],
  'rede-mosquiteira-aluminio': [
    { slug: 'rede-mosquiteira-aluminio-brico', label: 'Rolo retalho (linha Brico)' },
  ],
  'rede-mosquiteira-fibra-anti-fogo': [
    { slug: 'rede-mosquiteira-fibra-anti-fogo-brico', label: 'Rolo retalho (linha Brico)' },
  ],
  'rede-electrosoldada-inox-aisi-304': [
    { slug: 'rede-electrosoldada-inox-aisi-304-em-painel', label: 'Painel' },
  ],
  'rede-electrosoldada-inox-aisi-316': [
    { slug: 'rede-electrosoldada-inox-aisi-316-em-painel', label: 'Painel' },
  ],
};

const FOLDED_SLUGS = new Set(Object.values(FOLD_PAIRS).flat().map((f) => f.slug));

export function loadCatalogue() {
  const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/products/products.json'), 'utf-8'));
  const categories = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/categories/categories.json'), 'utf-8'));
  const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));

  // Attach folded-in formats to their parent product.
  for (const [parentSlug, folds] of Object.entries(FOLD_PAIRS)) {
    const parent = bySlug[parentSlug];
    if (!parent) continue;
    parent.formats = [
      { label: 'Rolo / Metro²', ...pickSpec(parent) },
      ...folds
        .map((f) => {
          const child = bySlug[f.slug];
          if (!child) return null;
          return { label: f.label, ...pickSpec(child), sourceSlug: f.slug };
        })
        .filter(Boolean),
    ];
  }

  // Visible catalogue products = everything except the ones folded into a parent.
  const catalogueProducts = products.filter((p) => !FOLDED_SLUGS.has(p.slug));

  const familiesByCategory = {};
  for (const cat of categories) {
    familiesByCategory[cat.slug] = cat.product_slugs
      .filter((s) => !FOLDED_SLUGS.has(s))
      .map((s) => bySlug[s])
      .filter(Boolean);
  }

  return { products, catalogueProducts, categories, bySlug, familiesByCategory };
}

function pickSpec(product) {
  return {
    specifications: product.specifications,
    priceRange: product.price_range,
    priceUnitNote: product.price_unit_note,
  };
}

const OPTIMIZED_DIR = path.join(ROOT, 'source/design/.cache/images-digital');

// Prefers the optimized digital copy (see optimize-images.mjs) over the raw
// multi-megapixel original; falls back to the original if the cache hasn't
// been generated yet, so this never hard-fails a build.
export function resolveImage(product, role = 'hero') {
  const img = product.images?.find((i) => i.role === role) || product.images?.[0];
  if (!img?.local_path) return null;
  const rel = path.relative(ROOT, img.local_path);
  const optimized = path.join(OPTIMIZED_DIR, rel.replace(/\//g, '__')).replace(/\.(jpe?g|png)$/i, '.jpg');
  return fs.existsSync(optimized) ? optimized : img.local_path;
}

// Builds the Rede Mosquiteira material-comparison table (spec section 11).
export function buildMosquiteiraComparison(familiesByCategory) {
  const list = familiesByCategory['rede-mosquiteira'] || [];
  return list.map((p) => {
    const row = p.specifications?.tabela_precos?.[0] || {};
    return {
      slug: p.slug,
      material: p.specifications?.material || '—',
      malha: row.malha ?? '18 x 14',
      abertura: row.abertura_mm ? String(row.abertura_mm) + ' mm' : '—',
      arame: row.arame_mm ? row.arame_mm + ' mm' : '—',
      largura: Array.isArray(p.specifications?.largura_rolo)
        ? p.specifications.largura_rolo.join(' / ')
        : p.specifications?.rolo || '—',
      cor: p.specifications?.cor?.join(' / ') || '—',
    };
  });
}
