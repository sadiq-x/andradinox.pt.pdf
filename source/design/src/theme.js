// Andradinox Catalogue — Design System Tokens
// Palette derived from the real Andradinox logo (sampled core stroke colour ≈ #1E4A78).
// "Industrial Premium" direction: restrained blue + steel-grey, generous whitespace, no gradients/shadows.

export const mm = (v) => v * 2.8346456693; // mm -> pt

export const page = {
  width: mm(210), // A4 portrait
  height: mm(297),
  margin: mm(20),
  marginOuter: mm(20),
  marginInner: mm(20),
  bleed: mm(3), // for print variant only
};

export const contentWidth = page.width - page.margin * 2;

// 12-column grid helper: returns width in pt for N of 12 columns, with gutter.
export const grid = {
  columns: 12,
  gutter: mm(4),
};
export function colWidth(n) {
  const totalGutter = grid.gutter * (grid.columns - 1);
  const colUnit = (contentWidth - totalGutter) / grid.columns;
  return colUnit * n + grid.gutter * (n - 1);
}

export const color = {
  // Primary — deep steel blue, derived from the Andradinox logo wordmark
  primary: '#1B3A5C',
  primaryDark: '#12283F',
  primaryTint: '#E8EEF3',

  // Accent — brighter steel blue for links/CTAs, used sparingly
  accent: '#2E6FB0',
  accentTint: '#EAF2FA',

  // Neutrals — steel-grey family, echoing the mesh-icon grey in the logo
  ink: '#1A1D21',
  body: '#3A3F45',
  muted: '#6B7480',
  faint: '#9AA2AB',

  border: '#DCE1E6',
  borderStrong: '#B7C0C8',

  surface: '#FFFFFF',
  surfaceAlt: '#F4F6F7',
  surfaceDark: '#12283F',

  white: '#FFFFFF',

  tableHeaderBg: '#1B3A5C',
  tableHeaderText: '#FFFFFF',
  tableRowAlt: '#F4F6F7',

  success: '#2F6B4F',
  warn: '#9A6B1E',
};

export const font = {
  family: 'Inter',
  weight: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 },
};

// Typographic scale — section 20 of the brief
export const type = {
  h1: { fontSize: 28, lineHeight: 1.15, fontWeight: font.weight.bold, color: color.ink, letterSpacing: -0.3 },
  h2: { fontSize: 18, lineHeight: 1.2, fontWeight: font.weight.bold, color: color.ink, letterSpacing: -0.2 },
  h3: { fontSize: 13, lineHeight: 1.25, fontWeight: font.weight.semibold, color: color.ink },
  body: { fontSize: 9.5, lineHeight: 1.5, fontWeight: font.weight.regular, color: color.body },
  bodySmall: { fontSize: 8.5, lineHeight: 1.45, fontWeight: font.weight.regular, color: color.muted },
  caption: { fontSize: 7.5, lineHeight: 1.4, fontWeight: font.weight.medium, color: color.muted },
  eyebrow: { fontSize: 8, lineHeight: 1.2, fontWeight: font.weight.semibold, color: color.accent, letterSpacing: 1.6 },
  techLabel: { fontSize: 7, lineHeight: 1.3, fontWeight: font.weight.semibold, color: color.muted, letterSpacing: 0.6 },
  techValue: { fontSize: 9.5, lineHeight: 1.3, fontWeight: font.weight.medium, color: color.ink },
  tableHeader: { fontSize: 7.5, lineHeight: 1.2, fontWeight: font.weight.semibold, color: color.tableHeaderText, letterSpacing: 0.4 },
  tableBody: { fontSize: 8.5, lineHeight: 1.3, fontWeight: font.weight.regular, color: color.body },
  sku: { fontSize: 8, lineHeight: 1.2, fontWeight: font.weight.medium, color: color.muted, letterSpacing: 0.4 },
  cta: { fontSize: 9, lineHeight: 1.2, fontWeight: font.weight.semibold, color: color.accent, letterSpacing: 0.3 },
  pageNumber: { fontSize: 8, fontWeight: font.weight.medium, color: color.muted },
};

export const space = { xs: 4, sm: 8, md: 12, lg: 20, xl: 32, xxl: 48 };

export const CATALOGUE_EDITION = 'Edição 2026';
export const CATALOGUE_TITLE = 'Catálogo de Produtos';

export const COMPANY = {
  name: 'Andradinox',
  legalName: 'Andradinox, Unipessoal, Lda',
  tagline: 'Especialistas em Redes e Teias em Aço Inoxidável',
  address: 'Rua Afonso de Albuquerque N22B, 2625-102 Póvoa de Santa Iria, Portugal',
  phone: '(+351) 219 418 323',
  mobile: '(+351) 934 547 013',
  email: 'geral@andradinox.pt',
  website: 'www.andradinox.pt',
  websiteUrl: 'https://www.andradinox.pt',
};
