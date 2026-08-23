// source/design/scripts/build-prototype.jsx
import React13 from "react";
import { Document, renderToFile } from "@react-pdf/renderer";
import path3 from "node:path";

// source/design/src/lib/fonts.js
import { Font } from "@react-pdf/renderer";
import path from "node:path";
var FONT_DIR = path.join(process.cwd(), "assets/fonts");
var registered = false;
function registerFonts() {
  if (registered) return;
  registered = true;
  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(FONT_DIR, "Inter-Light.ttf"), fontWeight: 300 },
      { src: path.join(FONT_DIR, "Inter-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "Inter-Medium.ttf"), fontWeight: 500 },
      { src: path.join(FONT_DIR, "Inter-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(FONT_DIR, "Inter-Bold.ttf"), fontWeight: 700 }
    ]
  });
  Font.registerHyphenationCallback((word) => [word]);
}

// source/design/src/lib/qr.js
import QRCode from "qrcode";
async function qrVector(text, { margin = 1 } = {}) {
  const svg = await QRCode.toString(text, { type: "svg", margin, errorCorrectionLevel: "M" });
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  const bgPathMatch = svg.match(/<path fill="([^"]+)" d="([^"]+)"\/>/);
  const fgPathMatch = svg.match(/<path stroke="([^"]+)" d="([^"]+)"\/>/);
  if (!viewBoxMatch || !fgPathMatch) {
    throw new Error(`Could not parse QR SVG output for "${text}"`);
  }
  const [, , , vw, vh] = [0, 0, 0, ...viewBoxMatch[1].split(" ").slice(2)];
  return {
    viewBox: viewBoxMatch[1],
    size: Number(vw),
    bg: bgPathMatch ? { fill: bgPathMatch[1], d: bgPathMatch[2] } : null,
    fg: { stroke: fgPathMatch[1], d: fgPathMatch[2] }
  };
}

// source/design/src/lib/data.js
import fs from "node:fs";
import path2 from "node:path";
var ROOT = process.cwd();
var FOLD_PAIRS = {
  "rede-mosquiteira-inox-aisi-304": [
    { slug: "rede-mosquiteira-inox-brico", label: "Rolo retalho (linha Brico)" }
  ],
  "rede-mosquiteira-aluminio": [
    { slug: "rede-mosquiteira-aluminio-brico", label: "Rolo retalho (linha Brico)" }
  ],
  "rede-mosquiteira-fibra-anti-fogo": [
    { slug: "rede-mosquiteira-fibra-anti-fogo-brico", label: "Rolo retalho (linha Brico)" }
  ],
  "rede-electrosoldada-inox-aisi-304": [
    { slug: "rede-electrosoldada-inox-aisi-304-em-painel", label: "Painel" }
  ],
  "rede-electrosoldada-inox-aisi-316": [
    { slug: "rede-electrosoldada-inox-aisi-316-em-painel", label: "Painel" }
  ]
};
var FOLDED_SLUGS = new Set(Object.values(FOLD_PAIRS).flat().map((f) => f.slug));
function loadCatalogue() {
  const products = JSON.parse(fs.readFileSync(path2.join(ROOT, "data/products/products.json"), "utf-8"));
  const categories = JSON.parse(fs.readFileSync(path2.join(ROOT, "data/categories/categories.json"), "utf-8"));
  const bySlug2 = Object.fromEntries(products.map((p) => [p.slug, p]));
  for (const [parentSlug, folds] of Object.entries(FOLD_PAIRS)) {
    const parent = bySlug2[parentSlug];
    if (!parent) continue;
    parent.formats = [
      { label: "Rolo / Metro\xB2", ...pickSpec(parent) },
      ...folds.map((f) => {
        const child = bySlug2[f.slug];
        if (!child) return null;
        return { label: f.label, ...pickSpec(child), sourceSlug: f.slug };
      }).filter(Boolean)
    ];
  }
  const catalogueProducts = products.filter((p) => !FOLDED_SLUGS.has(p.slug));
  const familiesByCategory2 = {};
  for (const cat of categories) {
    familiesByCategory2[cat.slug] = cat.product_slugs.filter((s13) => !FOLDED_SLUGS.has(s13)).map((s13) => bySlug2[s13]).filter(Boolean);
  }
  return { products, catalogueProducts, categories, bySlug: bySlug2, familiesByCategory: familiesByCategory2 };
}
function pickSpec(product) {
  return {
    specifications: product.specifications,
    priceRange: product.price_range,
    priceUnitNote: product.price_unit_note
  };
}
var OPTIMIZED_DIR = path2.join(ROOT, "source/design/.cache/images-digital");
function resolveImage(product, role = "hero") {
  const img = product.images?.find((i) => i.role === role) || product.images?.[0];
  if (!img?.local_path) return null;
  const rel = path2.relative(ROOT, img.local_path);
  const optimized = path2.join(OPTIMIZED_DIR, rel.replace(/\//g, "__")).replace(/\.(jpe?g|png)$/i, ".jpg");
  return fs.existsSync(optimized) ? optimized : img.local_path;
}

// source/design/src/components/Cover.jsx
import React from "react";
import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

// source/design/src/theme.js
var mm = (v) => v * 2.8346456693;
var page = {
  width: mm(210),
  // A4 portrait
  height: mm(297),
  margin: mm(20),
  marginOuter: mm(20),
  marginInner: mm(20),
  bleed: mm(3)
  // for print variant only
};
var contentWidth = page.width - page.margin * 2;
var grid = {
  columns: 12,
  gutter: mm(4)
};
var color = {
  // Primary — deep steel blue, derived from the Andradinox logo wordmark
  primary: "#1B3A5C",
  primaryDark: "#12283F",
  primaryTint: "#E8EEF3",
  // Accent — brighter steel blue for links/CTAs, used sparingly
  accent: "#2E6FB0",
  accentTint: "#EAF2FA",
  // Neutrals — steel-grey family, echoing the mesh-icon grey in the logo
  ink: "#1A1D21",
  body: "#3A3F45",
  muted: "#6B7480",
  faint: "#9AA2AB",
  border: "#DCE1E6",
  borderStrong: "#B7C0C8",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F6F7",
  surfaceDark: "#12283F",
  white: "#FFFFFF",
  tableHeaderBg: "#1B3A5C",
  tableHeaderText: "#FFFFFF",
  tableRowAlt: "#F4F6F7",
  success: "#2F6B4F",
  warn: "#9A6B1E"
};
var font = {
  family: "Inter",
  weight: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 }
};
var type = {
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
  pageNumber: { fontSize: 8, fontWeight: font.weight.medium, color: color.muted }
};
var space = { xs: 4, sm: 8, md: 12, lg: 20, xl: 32, xxl: 48 };
var CATALOGUE_EDITION = "Edi\xE7\xE3o 2026";
var CATALOGUE_TITLE = "Cat\xE1logo de Produtos";
var COMPANY = {
  name: "Andradinox",
  legalName: "Andradinox, Unipessoal, Lda",
  tagline: "Especialistas em Redes e Teias em A\xE7o Inoxid\xE1vel",
  address: "Rua Afonso de Albuquerque N22B, 2625-102 P\xF3voa de Santa Iria, Portugal",
  phone: "(+351) 219 418 323",
  mobile: "(+351) 934 547 013",
  email: "geral@andradinox.pt",
  website: "www.andradinox.pt",
  websiteUrl: "https://www.andradinox.pt"
};

// source/design/src/components/Cover.jsx
import { jsx, jsxs } from "react/jsx-runtime";
var s = StyleSheet.create({
  page: { padding: 0 },
  photo: { position: "absolute", top: 0, left: 0, width: page.width, height: page.height, objectFit: "cover" },
  scrim: { position: "absolute", top: 0, left: 0, width: page.width, height: page.height, backgroundColor: color.primaryDark, opacity: 0.8 },
  content: {
    flexGrow: 1,
    padding: page.margin,
    paddingVertical: page.margin * 1.4,
    justifyContent: "space-between"
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  wordmark: { fontFamily: "Inter", fontSize: 15, fontWeight: 700, color: "#FFFFFF", letterSpacing: 2 },
  tagline: { fontFamily: "Inter", fontSize: 8.5, fontWeight: 500, color: "#C6D3E0", letterSpacing: 0.6, marginTop: 5 },
  meshMark: { width: 20, height: 20, marginRight: 9 },
  titleBlock: {},
  kicker: { fontFamily: "Inter", fontSize: 9, fontWeight: 600, color: "#8FB3D9", letterSpacing: 3, marginBottom: 10, textTransform: "uppercase" },
  title: { fontFamily: "Inter", fontSize: 40, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.05 },
  edition: { fontFamily: "Inter", fontSize: 12, fontWeight: 500, color: "#C6D3E0", marginTop: 10 },
  accentLine: { width: 46, height: 3, backgroundColor: color.accent, marginTop: 18, marginBottom: 18 },
  categories: { flexDirection: "row", flexWrap: "wrap", maxWidth: 380 },
  catChip: {
    fontFamily: "Inter",
    fontSize: 8,
    fontWeight: 500,
    color: "#E4EAF0",
    borderColor: "rgba(255,255,255,0.35)",
    borderWidth: 0.75,
    borderRadius: 2,
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6
  },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  footerLabel: { fontFamily: "Inter", fontSize: 7.5, fontWeight: 600, color: "#8FB3D9", letterSpacing: 1, marginBottom: 3, textTransform: "uppercase" },
  footerValue: { fontFamily: "Inter", fontSize: 9, fontWeight: 500, color: "#FFFFFF" }
});
var CATEGORY_CHIPS = [
  "Teia Inox",
  "Teia Zincada",
  "Rede Electrosoldada Inox",
  "Rede Mosquiteira",
  "Arame"
];
function Cover({ coverPhoto }) {
  return /* @__PURE__ */ jsxs(Page, { size: "A4", style: s.page, children: [
    coverPhoto ? /* @__PURE__ */ jsx(Image, { src: coverPhoto, style: s.photo }) : /* @__PURE__ */ jsx(View, { style: [s.photo, { backgroundColor: color.primaryDark }] }),
    /* @__PURE__ */ jsx(View, { style: s.scrim }),
    /* @__PURE__ */ jsxs(View, { style: s.content, children: [
      /* @__PURE__ */ jsx(View, { style: s.brandRow, children: /* @__PURE__ */ jsx(Text, { style: s.wordmark, children: "ANDRADINOX" }) }),
      /* @__PURE__ */ jsxs(View, { style: s.titleBlock, children: [
        /* @__PURE__ */ jsx(Text, { style: s.kicker, children: "Importa\xE7\xE3o \xB7 Distribui\xE7\xE3o \xB7 Exporta\xE7\xE3o de Redes Met\xE1licas" }),
        /* @__PURE__ */ jsx(Text, { style: s.title, children: CATALOGUE_TITLE }),
        /* @__PURE__ */ jsx(View, { style: s.accentLine }),
        /* @__PURE__ */ jsx(Text, { style: s.edition, children: CATALOGUE_EDITION }),
        /* @__PURE__ */ jsx(View, { style: { height: 22 } }),
        /* @__PURE__ */ jsx(View, { style: s.categories, children: CATEGORY_CHIPS.map((c) => /* @__PURE__ */ jsx(Text, { style: s.catChip, children: c }, c)) })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: s.footerRow, children: [
        /* @__PURE__ */ jsxs(View, { children: [
          /* @__PURE__ */ jsx(Text, { style: s.footerLabel, children: "Website" }),
          /* @__PURE__ */ jsx(Text, { style: s.footerValue, children: COMPANY.website })
        ] }),
        /* @__PURE__ */ jsxs(View, { children: [
          /* @__PURE__ */ jsx(Text, { style: s.footerLabel, children: "Contacto" }),
          /* @__PURE__ */ jsx(Text, { style: s.footerValue, children: COMPANY.phone })
        ] }),
        /* @__PURE__ */ jsxs(View, { children: [
          /* @__PURE__ */ jsx(Text, { style: s.footerLabel, children: "Email" }),
          /* @__PURE__ */ jsx(Text, { style: s.footerValue, children: COMPANY.email })
        ] })
      ] })
    ] })
  ] });
}

// source/design/src/components/TOCPage.jsx
import React4 from "react";
import { Page as Page2, View as View4, Text as Text4, Link as Link3, StyleSheet as StyleSheet4 } from "@react-pdf/renderer";

// source/design/src/components/Chrome.jsx
import React2 from "react";
import { View as View2, Text as Text2, Link, StyleSheet as StyleSheet2 } from "@react-pdf/renderer";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var HEADER_H = 34;
var FOOTER_H = 28;
var s2 = StyleSheet2.create({
  header: {
    position: "absolute",
    top: -(HEADER_H + 14),
    left: 0,
    right: 0,
    height: HEADER_H,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `0.75pt solid ${color.border}`
  },
  headerLeft: { flexDirection: "row", alignItems: "baseline" },
  headerBrand: { fontFamily: "Inter", fontSize: 9, fontWeight: 700, color: color.primary, letterSpacing: 0.5 },
  headerDivider: { fontSize: 9, color: color.border, marginHorizontal: 6 },
  headerEdition: { fontFamily: "Inter", fontSize: 8, fontWeight: 500, color: color.muted, letterSpacing: 0.4 },
  headerSection: { fontFamily: "Inter", fontSize: 8, fontWeight: 500, color: color.muted },
  footer: {
    position: "absolute",
    bottom: -(FOOTER_H + 14),
    left: 0,
    right: 0,
    height: FOOTER_H,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: `0.75pt solid ${color.border}`
  },
  footerLink: { fontFamily: "Inter", fontSize: 8, fontWeight: 600, color: color.accent, textDecoration: "none" },
  footerCenter: { fontFamily: "Inter", fontSize: 8, fontWeight: 500, color: color.muted },
  footerPage: { fontFamily: "Inter", fontSize: 8, fontWeight: 600, color: color.ink }
});
function Header({ section }) {
  return /* @__PURE__ */ jsxs2(View2, { style: s2.header, fixed: true, children: [
    /* @__PURE__ */ jsxs2(View2, { style: s2.headerLeft, children: [
      /* @__PURE__ */ jsx2(Text2, { style: s2.headerBrand, children: "ANDRADINOX" }),
      /* @__PURE__ */ jsx2(Text2, { style: s2.headerDivider, children: "|" }),
      /* @__PURE__ */ jsxs2(Text2, { style: s2.headerEdition, children: [
        "CAT\xC1LOGO ",
        CATALOGUE_EDITION.replace("Edi\xE7\xE3o ", "")
      ] })
    ] }),
    section ? /* @__PURE__ */ jsx2(Text2, { style: s2.headerSection, children: section }) : null
  ] });
}
function Footer({ section }) {
  return /* @__PURE__ */ jsxs2(View2, { style: s2.footer, fixed: true, children: [
    /* @__PURE__ */ jsx2(Link, { src: "#toc", style: s2.footerLink, children: "\u2190 \xCDndice" }),
    /* @__PURE__ */ jsx2(Text2, { style: s2.footerCenter, children: section || COMPANY.name }),
    /* @__PURE__ */ jsx2(
      Text2,
      {
        style: s2.footerPage,
        render: ({ pageNumber }) => `P\xE1gina ${pageNumber}`
      }
    )
  ] });
}
var CHROME_PAD = {
  paddingTop: HEADER_H + 14,
  paddingBottom: FOOTER_H + 14,
  paddingLeft: page.margin,
  paddingRight: page.margin
};
function PageChrome({ id, section, bookmark, style, children }) {
  return /* @__PURE__ */ jsxs2(View2, { id, bookmark, style, children: [
    /* @__PURE__ */ jsx2(Header, { section }),
    children,
    /* @__PURE__ */ jsx2(Footer, { section })
  ] });
}

// source/design/src/components/Bits.jsx
import React3 from "react";
import { View as View3, Text as Text3, Image as Image2, Link as Link2, Svg, Path, StyleSheet as StyleSheet3 } from "@react-pdf/renderer";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var s3 = StyleSheet3.create({
  eyebrow: { ...type.eyebrow, textTransform: "uppercase", marginBottom: 4 },
  h1: { ...type.h1 },
  h2: { ...type.h2 },
  h3: { ...type.h3 },
  ruleThin: { height: 0.75, backgroundColor: color.border, marginVertical: space.md },
  ruleAccent: { height: 2, width: 32, backgroundColor: color.accent, marginTop: 6, marginBottom: 12 },
  tag: {
    borderRadius: 2,
    paddingVertical: 3,
    paddingHorizontal: 7,
    backgroundColor: color.primaryTint,
    alignSelf: "flex-start"
  },
  tagText: { fontFamily: "Inter", fontSize: 7.5, fontWeight: 600, color: color.primary, letterSpacing: 0.4 },
  appGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  appItem: { width: "50%", flexDirection: "row", alignItems: "flex-start", marginBottom: 5, paddingRight: 8 },
  appDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: color.accent, marginTop: 4.5, marginRight: 6 },
  appText: { ...type.body, fontSize: 9 },
  specRail: { borderLeft: `2pt solid ${color.border}`, paddingLeft: 10 },
  specRow: { marginBottom: 7 },
  specLabel: { ...type.techLabel, textTransform: "uppercase" },
  specValue: { ...type.techValue, marginTop: 1.5 },
  qrWrap: { alignItems: "center" },
  qrCaption: { ...type.caption, marginTop: 5, textAlign: "center" },
  ctaBox: {
    borderRadius: 2,
    border: `1pt solid ${color.accent}`,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start"
  },
  ctaText: { ...type.cta }
});
function SectionHeading({ eyebrow, title, subtitle }) {
  return /* @__PURE__ */ jsxs3(View3, { children: [
    eyebrow ? /* @__PURE__ */ jsx3(Text3, { style: s3.eyebrow, children: eyebrow }) : null,
    /* @__PURE__ */ jsx3(Text3, { style: s3.h1, children: title }),
    /* @__PURE__ */ jsx3(View3, { style: s3.ruleAccent }),
    subtitle ? /* @__PURE__ */ jsx3(Text3, { style: type.body, children: subtitle }) : null
  ] });
}
function Tag({ children }) {
  return /* @__PURE__ */ jsx3(View3, { style: s3.tag, children: /* @__PURE__ */ jsx3(Text3, { style: s3.tagText, children }) });
}
function ApplicationsList({ items }) {
  if (!items?.length) return null;
  return /* @__PURE__ */ jsxs3(View3, { children: [
    /* @__PURE__ */ jsx3(Text3, { style: type.h3, children: "APLICA\xC7\xD5ES" }),
    /* @__PURE__ */ jsx3(View3, { style: s3.appGrid, children: items.map((it, i) => /* @__PURE__ */ jsxs3(View3, { style: s3.appItem, children: [
      /* @__PURE__ */ jsx3(View3, { style: s3.appDot }),
      /* @__PURE__ */ jsx3(Text3, { style: s3.appText, children: it })
    ] }, i)) })
  ] });
}
function SpecRow({ label, value }) {
  if (value === void 0 || value === null || value === "") return null;
  return /* @__PURE__ */ jsxs3(View3, { style: s3.specRow, children: [
    /* @__PURE__ */ jsx3(Text3, { style: s3.specLabel, children: label }),
    /* @__PURE__ */ jsx3(Text3, { style: s3.specValue, children: value })
  ] });
}
function SpecRail({ children }) {
  return /* @__PURE__ */ jsx3(View3, { style: s3.specRail, children });
}
function QRSvg({ qr, caption, size = 62 }) {
  if (!qr) return null;
  return /* @__PURE__ */ jsxs3(View3, { style: s3.qrWrap, children: [
    /* @__PURE__ */ jsxs3(Svg, { width: size, height: size, viewBox: qr.viewBox, children: [
      qr.bg ? /* @__PURE__ */ jsx3(Path, { d: qr.bg.d, fill: qr.bg.fill }) : null,
      /* @__PURE__ */ jsx3(Path, { d: qr.fg.d, stroke: qr.fg.stroke, strokeWidth: 1 })
    ] }),
    caption ? /* @__PURE__ */ jsx3(Text3, { style: s3.qrCaption, children: caption }) : null
  ] });
}

// source/design/src/components/TOCPage.jsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var s4 = StyleSheet4.create({
  page: { padding: 0, ...CHROME_PAD },
  list: { marginTop: 26 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottom: `0.75pt solid ${color.border}`
  },
  subRow: { paddingVertical: 7, paddingLeft: 18, borderBottom: `0.5pt solid ${color.border}` },
  num: { width: 22, fontFamily: "Inter", fontSize: 9, fontWeight: 700, color: color.accent },
  label: { flex: 1, fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: color.ink },
  subLabel: { flex: 1, fontFamily: "Inter", fontSize: 9, fontWeight: 400, color: color.body },
  pageNo: { fontFamily: "Inter", fontSize: 9, fontWeight: 600, color: color.muted, width: 30, textAlign: "right" },
  link: { textDecoration: "none" }
});
function TOCPage({ entries }) {
  return /* @__PURE__ */ jsx4(Page2, { size: "A4", style: s4.page, children: /* @__PURE__ */ jsxs4(PageChrome, { id: "toc", section: "\xCDndice", bookmark: { title: "\xCDndice", ref: "toc" }, children: [
    /* @__PURE__ */ jsx4(SectionHeading, { eyebrow: "Navega\xE7\xE3o", title: "\xCDndice" }),
    /* @__PURE__ */ jsx4(View4, { style: s4.list, children: entries.map((e, i) => /* @__PURE__ */ jsxs4(View4, { children: [
      /* @__PURE__ */ jsx4(Link3, { src: `#${e.id}`, style: s4.link, children: /* @__PURE__ */ jsxs4(View4, { style: s4.row, children: [
        /* @__PURE__ */ jsx4(Text4, { style: s4.num, children: String(i + 1).padStart(2, "0") }),
        /* @__PURE__ */ jsx4(Text4, { style: s4.label, children: e.label }),
        /* @__PURE__ */ jsx4(Text4, { style: s4.pageNo, children: e.page })
      ] }) }),
      e.sub?.map((se) => /* @__PURE__ */ jsx4(Link3, { src: `#${se.id}`, style: s4.link, children: /* @__PURE__ */ jsx4(View4, { style: s4.subRow, children: /* @__PURE__ */ jsxs4(View4, { style: { flexDirection: "row", alignItems: "center" }, children: [
        /* @__PURE__ */ jsx4(Text4, { style: s4.subLabel, children: se.label }),
        /* @__PURE__ */ jsx4(Text4, { style: s4.pageNo, children: se.page })
      ] }) }) }, se.id))
    ] }, e.id)) })
  ] }) });
}

// source/design/src/components/IntroPage.jsx
import React5 from "react";
import { Page as Page3, View as View5, Text as Text5, StyleSheet as StyleSheet5 } from "@react-pdf/renderer";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var s5 = StyleSheet5.create({
  page: { padding: 0, ...CHROME_PAD },
  desc: { ...type.body, fontSize: 11, lineHeight: 1.6, marginTop: 8, marginBottom: 20, maxWidth: "82%" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 22 },
  tagSpacing: { marginRight: 6, marginBottom: 6 },
  grid: { flexDirection: "row", marginTop: 6 },
  col: { width: "50%", paddingRight: 20 },
  blockTitle: { ...type.h3, marginBottom: 8 },
  row: { marginBottom: 12 },
  rowLabel: { ...type.techLabel, textTransform: "uppercase" },
  rowValue: { ...type.techValue, marginTop: 2 },
  tbc: {
    marginTop: 22,
    padding: 12,
    backgroundColor: color.surfaceAlt,
    borderRadius: 2,
    border: `0.5pt solid ${color.border}`
  },
  tbcTitle: { fontFamily: "Inter", fontSize: 7.5, fontWeight: 700, color: color.muted, letterSpacing: 0.5, marginBottom: 5, textTransform: "uppercase" },
  tbcText: { ...type.bodySmall }
});
function IntroPage() {
  return /* @__PURE__ */ jsx5(Page3, { size: "A4", style: s5.page, children: /* @__PURE__ */ jsxs5(PageChrome, { id: "intro-andradinox", bookmark: { title: "A Andradinox", ref: "intro-andradinox" }, section: "Introdu\xE7\xE3o", children: [
    /* @__PURE__ */ jsx5(SectionHeading, { eyebrow: "Introdu\xE7\xE3o", title: "A ANDRADINOX" }),
    /* @__PURE__ */ jsx5(Text5, { style: s5.desc, children: "Importa\xE7\xE3o, distribui\xE7\xE3o e exporta\xE7\xE3o de redes met\xE1licas \u2014 rede hexagonal, rede e teia inox, rede mosquiteira, rede ovelheira, entre outras. A Andradinox fornece redes e teias em a\xE7o inoxid\xE1vel, a\xE7o galvanizado, alum\xEDnio e outros materiais para aplica\xE7\xF5es industriais, de constru\xE7\xE3o e de prote\xE7\xE3o." }),
    /* @__PURE__ */ jsx5(View5, { style: s5.tagRow, children: ["Teia Inox", "Teia Zincada", "Rede Electrosoldada Inox", "Rede Mosquiteira", "Arame"].map((c) => /* @__PURE__ */ jsx5(View5, { style: s5.tagSpacing, children: /* @__PURE__ */ jsx5(Tag, { children: c }) }, c)) }),
    /* @__PURE__ */ jsxs5(View5, { style: s5.grid, children: [
      /* @__PURE__ */ jsxs5(View5, { style: s5.col, children: [
        /* @__PURE__ */ jsx5(Text5, { style: s5.blockTitle, children: "DADOS DA EMPRESA" }),
        /* @__PURE__ */ jsxs5(View5, { style: s5.row, children: [
          /* @__PURE__ */ jsx5(Text5, { style: s5.rowLabel, children: "Denomina\xE7\xE3o social" }),
          /* @__PURE__ */ jsx5(Text5, { style: s5.rowValue, children: COMPANY.legalName })
        ] }),
        /* @__PURE__ */ jsxs5(View5, { style: s5.row, children: [
          /* @__PURE__ */ jsx5(Text5, { style: s5.rowLabel, children: "Morada" }),
          /* @__PURE__ */ jsx5(Text5, { style: s5.rowValue, children: COMPANY.address })
        ] })
      ] }),
      /* @__PURE__ */ jsxs5(View5, { style: s5.col, children: [
        /* @__PURE__ */ jsx5(Text5, { style: s5.blockTitle, children: "CONTACTOS" }),
        /* @__PURE__ */ jsxs5(View5, { style: s5.row, children: [
          /* @__PURE__ */ jsx5(Text5, { style: s5.rowLabel, children: "Telefone / Telem\xF3vel" }),
          /* @__PURE__ */ jsxs5(Text5, { style: s5.rowValue, children: [
            COMPANY.phone,
            " \xB7 ",
            COMPANY.mobile
          ] })
        ] }),
        /* @__PURE__ */ jsxs5(View5, { style: s5.row, children: [
          /* @__PURE__ */ jsx5(Text5, { style: s5.rowLabel, children: "Email / Website" }),
          /* @__PURE__ */ jsxs5(Text5, { style: s5.rowValue, children: [
            COMPANY.email,
            " \xB7 ",
            COMPANY.website
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs5(View5, { style: s5.tbc, children: [
      /* @__PURE__ */ jsx5(Text5, { style: s5.tbcTitle, children: "Informa\xE7\xE3o a confirmar" }),
      /* @__PURE__ */ jsx5(Text5, { style: s5.tbcText, children: "Hist\xF3ria da empresa, certifica\xE7\xF5es, capacidades de produ\xE7\xE3o e mercados servidos n\xE3o est\xE3o dispon\xEDveis nas fontes verificadas utilizadas para este cat\xE1logo. Estes conte\xFAdos devem ser fornecidos e aprovados pela Andradinox antes da edi\xE7\xE3o final." })
    ] })
  ] }) });
}

// source/design/src/components/CategoryIntro.jsx
import React6 from "react";
import { Page as Page4, View as View6, Text as Text6, Image as Image3, StyleSheet as StyleSheet6 } from "@react-pdf/renderer";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var s6 = StyleSheet6.create({
  page: { padding: 0, ...CHROME_PAD },
  layout: { flexDirection: "row", marginTop: 20, flexGrow: 1 },
  colText: { width: "46%", paddingRight: 22 },
  colPhoto: { width: "54%" },
  photoFrame: { border: `0.75pt solid ${color.border}`, borderRadius: 2, overflow: "hidden", height: 320 },
  photo: { width: "100%", height: "100%", objectFit: "cover" },
  photoCaption: { ...type.caption, marginTop: 6 },
  desc: { ...type.body, marginTop: 4, marginBottom: 18 },
  blockTitle: { ...type.h3, marginBottom: 8, marginTop: 4 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 18 },
  tagSpacing: { marginRight: 6, marginBottom: 6 },
  familyList: { marginTop: 4 },
  familyRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5, borderBottom: `0.5pt solid ${color.border}` },
  familyIndex: { width: 16, fontFamily: "Inter", fontSize: 8, fontWeight: 700, color: color.accent },
  familyName: { flex: 1, fontFamily: "Inter", fontSize: 9, fontWeight: 500, color: color.ink }
});
function CategoryIntro({ id, bookmark, index, name, description, materials, applications, families, photo, photoCaption }) {
  return /* @__PURE__ */ jsx6(Page4, { size: "A4", style: s6.page, children: /* @__PURE__ */ jsxs6(PageChrome, { id, bookmark, section: name, children: [
    /* @__PURE__ */ jsx6(SectionHeading, { eyebrow: `Categoria ${String(index).padStart(2, "0")}`, title: name.toUpperCase() }),
    /* @__PURE__ */ jsxs6(View6, { style: s6.layout, children: [
      /* @__PURE__ */ jsxs6(View6, { style: s6.colText, children: [
        description ? /* @__PURE__ */ jsx6(Text6, { style: s6.desc, children: description }) : /* @__PURE__ */ jsx6(Text6, { style: [s6.desc, { color: color.faint }], children: "Descri\xE7\xE3o da categoria a confirmar com a Andradinox." }),
        materials?.length ? /* @__PURE__ */ jsxs6(View6, { children: [
          /* @__PURE__ */ jsx6(Text6, { style: s6.blockTitle, children: "MATERIAIS DISPON\xCDVEIS" }),
          /* @__PURE__ */ jsx6(View6, { style: s6.tagRow, children: materials.map((m) => /* @__PURE__ */ jsx6(View6, { style: s6.tagSpacing, children: /* @__PURE__ */ jsx6(Tag, { children: m }) }, m)) })
        ] }) : null,
        applications?.length ? /* @__PURE__ */ jsx6(ApplicationsList, { items: applications }) : null
      ] }),
      /* @__PURE__ */ jsxs6(View6, { style: s6.colPhoto, children: [
        /* @__PURE__ */ jsx6(View6, { style: s6.photoFrame, children: photo ? /* @__PURE__ */ jsx6(Image3, { src: photo, style: s6.photo }) : null }),
        photoCaption ? /* @__PURE__ */ jsx6(Text6, { style: s6.photoCaption, children: photoCaption }) : null,
        /* @__PURE__ */ jsxs6(View6, { style: s6.familyList, children: [
          /* @__PURE__ */ jsx6(Text6, { style: [s6.blockTitle, { marginTop: 18 }], children: "PRODUTOS NESTA CATEGORIA" }),
          families.map((f, i) => /* @__PURE__ */ jsxs6(View6, { style: s6.familyRow, children: [
            /* @__PURE__ */ jsx6(Text6, { style: s6.familyIndex, children: String(i + 1).padStart(2, "0") }),
            /* @__PURE__ */ jsx6(Text6, { style: s6.familyName, children: f })
          ] }, f))
        ] })
      ] })
    ] })
  ] }) });
}

// source/design/src/components/ProductOverview.jsx
import React7 from "react";
import { Page as Page5, View as View7, Text as Text7, Image as Image4, Link as Link4, StyleSheet as StyleSheet7 } from "@react-pdf/renderer";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var s7 = StyleSheet7.create({
  page: { padding: 0, ...CHROME_PAD },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 20 },
  card: {
    width: "48.5%",
    marginRight: "3%",
    marginBottom: 11,
    border: `0.75pt solid ${color.border}`,
    borderRadius: 2,
    overflow: "hidden"
  },
  cardLast: { marginRight: 0 },
  cardPhoto: { width: "100%", height: 70, objectFit: "cover", backgroundColor: color.surfaceAlt },
  cardBody: { padding: 9 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7 },
  cardName: { fontFamily: "Inter", fontSize: 10, fontWeight: 700, color: color.ink, flex: 1, paddingRight: 6 },
  specStrip: { flexDirection: "row", marginBottom: 8 },
  specCell: { flex: 1 },
  cardChar: { fontFamily: "Inter", fontSize: 8, fontWeight: 500, color: color.body },
  cardCharLabel: { fontFamily: "Inter", fontSize: 6, color: color.faint, letterSpacing: 0.4, marginBottom: 1 },
  cta: { fontFamily: "Inter", fontSize: 8, fontWeight: 600, color: color.accent, textDecoration: "none" },
  refRow: { borderTop: `0.5pt solid ${color.border}`, paddingTop: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }
});
function ProductOverview({ id, bookmark, section, title, products }) {
  return /* @__PURE__ */ jsx7(Page5, { size: "A4", style: s7.page, children: /* @__PURE__ */ jsxs7(PageChrome, { id, bookmark, section, children: [
    /* @__PURE__ */ jsx7(SectionHeading, { eyebrow: "Gama de produtos", title }),
    /* @__PURE__ */ jsx7(View7, { style: s7.grid, children: products.map((p, i) => /* @__PURE__ */ jsxs7(View7, { style: [s7.card, i % 2 === 1 ? s7.cardLast : null], wrap: false, children: [
      p.photo ? /* @__PURE__ */ jsx7(Image4, { src: p.photo, style: s7.cardPhoto }) : /* @__PURE__ */ jsx7(View7, { style: s7.cardPhoto }),
      /* @__PURE__ */ jsxs7(View7, { style: s7.cardBody, children: [
        /* @__PURE__ */ jsxs7(View7, { style: s7.cardTopRow, children: [
          /* @__PURE__ */ jsx7(Text7, { style: s7.cardName, children: p.name }),
          /* @__PURE__ */ jsx7(Tag, { children: p.material })
        ] }),
        /* @__PURE__ */ jsxs7(View7, { style: s7.specStrip, children: [
          /* @__PURE__ */ jsxs7(View7, { style: s7.specCell, children: [
            /* @__PURE__ */ jsx7(Text7, { style: s7.cardCharLabel, children: "MALHA" }),
            /* @__PURE__ */ jsx7(Text7, { style: s7.cardChar, children: p.mainSpec })
          ] }),
          /* @__PURE__ */ jsxs7(View7, { style: s7.specCell, children: [
            /* @__PURE__ */ jsx7(Text7, { style: s7.cardCharLabel, children: "DI\xC2METRO DO FIO" }),
            /* @__PURE__ */ jsx7(Text7, { style: s7.cardChar, children: p.wireDiameter })
          ] })
        ] }),
        /* @__PURE__ */ jsxs7(View7, { style: s7.refRow, children: [
          /* @__PURE__ */ jsx7(Text7, { style: [s7.cardCharLabel, { fontSize: 7 }], children: "REF. a confirmar" }),
          /* @__PURE__ */ jsx7(Link4, { src: p.href, style: s7.cta, children: "Ver produto \u2192" })
        ] })
      ] })
    ] }, p.slug)) })
  ] }) });
}

// source/design/src/components/ProductDetail.jsx
import React9 from "react";
import { Page as Page6, View as View9, Text as Text9, Image as Image5, Link as Link5, StyleSheet as StyleSheet9 } from "@react-pdf/renderer";

// source/design/src/components/TechTable.jsx
import React8 from "react";
import { View as View8, Text as Text8, StyleSheet as StyleSheet8 } from "@react-pdf/renderer";
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
var s8 = StyleSheet8.create({
  table: { borderTop: `1pt solid ${color.tableHeaderBg}`, borderBottom: `0.75pt solid ${color.border}` },
  headerRow: { flexDirection: "row", backgroundColor: color.tableHeaderBg },
  headerCell: { paddingVertical: 6, paddingHorizontal: 7, justifyContent: "center" },
  row: { flexDirection: "row", borderBottom: `0.5pt solid ${color.border}` },
  rowAlt: { backgroundColor: color.tableRowAlt },
  cell: { paddingVertical: 5.5, paddingHorizontal: 7, justifyContent: "center" },
  caption: { marginTop: 6, fontFamily: "Inter", fontSize: 7.5, color: color.faint }
});
function TechTable({ columns, rows, caption, continued }) {
  return /* @__PURE__ */ jsxs8(View8, { children: [
    /* @__PURE__ */ jsxs8(View8, { style: s8.table, children: [
      /* @__PURE__ */ jsx8(View8, { style: s8.headerRow, fixed: false, children: columns.map((c) => /* @__PURE__ */ jsx8(View8, { style: [s8.headerCell, { flex: c.flex ?? 1 }], children: /* @__PURE__ */ jsx8(Text8, { style: [type.tableHeader, { textAlign: c.align || "left" }], children: c.label }) }, c.key)) }),
      rows.map((row, i) => /* @__PURE__ */ jsx8(View8, { style: [s8.row, i % 2 === 1 ? s8.rowAlt : null], wrap: false, children: columns.map((c) => /* @__PURE__ */ jsx8(View8, { style: [s8.cell, { flex: c.flex ?? 1 }], children: /* @__PURE__ */ jsx8(Text8, { style: [type.tableBody, { textAlign: c.align || "left" }], children: row[c.key] ?? "\u2014" }) }, c.key)) }, i))
    ] }),
    caption ? /* @__PURE__ */ jsx8(Text8, { style: s8.caption, children: caption }) : null
  ] });
}

// source/design/src/components/ProductDetail.jsx
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var s9 = StyleSheet9.create({
  page: { padding: 0, ...CHROME_PAD },
  header: { marginTop: 4, marginBottom: 16 },
  eyebrow: { ...type.eyebrow, textTransform: "uppercase" },
  nameRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  name: { ...type.h1, fontSize: 22 },
  refNote: { ...type.sku, marginTop: 4 },
  layout: { flexDirection: "row" },
  colLeft: { width: "34%", paddingRight: 18 },
  photoFrame: { border: `0.75pt solid ${color.border}`, borderRadius: 2, overflow: "hidden", height: 142, marginBottom: 12 },
  photo: { width: "100%", height: "100%", objectFit: "cover" },
  colRight: { width: "66%" },
  desc: { ...type.body, marginBottom: 12 },
  tablesBlock: { marginTop: 18 },
  formatLabel: { ...type.h3, marginBottom: 6, marginTop: 14 },
  priceCta: {
    marginTop: 14,
    padding: 10,
    backgroundColor: color.primaryTint,
    borderRadius: 2,
    flexDirection: "row",
    alignItems: "center"
  },
  priceCtaQr: { marginRight: 10 },
  priceCtaText: { fontFamily: "Inter", fontSize: 8.5, fontWeight: 600, color: color.primary, flex: 1, paddingRight: 8, lineHeight: 1.3 },
  priceCtaLink: { fontFamily: "Inter", fontSize: 8.5, fontWeight: 700, color: color.accent, textDecoration: "none" }
});
function ProductDetail({
  id,
  bookmark,
  section,
  category,
  name,
  material,
  heroImage,
  description,
  applications,
  specSummary,
  tables,
  productUrl,
  productQr,
  notes
}) {
  return /* @__PURE__ */ jsx9(Page6, { size: "A4", style: s9.page, wrap: true, children: /* @__PURE__ */ jsxs9(PageChrome, { id, bookmark, section, children: [
    /* @__PURE__ */ jsxs9(View9, { style: s9.header, children: [
      /* @__PURE__ */ jsx9(Text9, { style: s9.eyebrow, children: category }),
      /* @__PURE__ */ jsx9(View9, { style: s9.nameRow, children: /* @__PURE__ */ jsx9(Text9, { style: s9.name, children: name }) }),
      /* @__PURE__ */ jsx9(Text9, { style: s9.refNote, children: "REF. A CONFIRMAR COM A ANDRADINOX" })
    ] }),
    /* @__PURE__ */ jsxs9(View9, { style: s9.layout, wrap: false, children: [
      /* @__PURE__ */ jsxs9(View9, { style: s9.colLeft, children: [
        /* @__PURE__ */ jsx9(View9, { style: s9.photoFrame, children: heroImage ? /* @__PURE__ */ jsx9(Image5, { src: heroImage, style: s9.photo }) : null }),
        specSummary?.length ? /* @__PURE__ */ jsx9(SpecRail, { children: specSummary.map((row) => /* @__PURE__ */ jsx9(SpecRow, { label: row.label, value: row.value }, row.label)) }) : null
      ] }),
      /* @__PURE__ */ jsxs9(View9, { style: s9.colRight, children: [
        description ? /* @__PURE__ */ jsx9(Text9, { style: s9.desc, children: description }) : null,
        /* @__PURE__ */ jsx9(ApplicationsList, { items: applications }),
        /* @__PURE__ */ jsxs9(View9, { style: s9.priceCta, children: [
          productQr ? /* @__PURE__ */ jsx9(View9, { style: s9.priceCtaQr, children: /* @__PURE__ */ jsx9(QRSvg, { qr: productQr, size: 40 }) }) : null,
          /* @__PURE__ */ jsx9(Text9, { style: s9.priceCtaText, children: "Pre\xE7os e disponibilidade: contactar a Andradinox" }),
          productUrl ? /* @__PURE__ */ jsxs9(Link5, { src: productUrl, style: s9.priceCtaLink, children: [
            "Ver produto",
            "\n",
            "online \u2192"
          ] }) : null
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx9(View9, { style: s9.tablesBlock, children: tables.map((t) => /* @__PURE__ */ jsxs9(View9, { wrap: false, children: [
      /* @__PURE__ */ jsxs9(Text9, { style: s9.formatLabel, children: [
        "ESPECIFICA\xC7\xD5ES T\xC9CNICAS",
        tables.length > 1 ? ` \u2014 ${t.label.toUpperCase()}` : ""
      ] }),
      /* @__PURE__ */ jsx9(TechTable, { columns: t.columns, rows: t.rows, caption: t.caption })
    ] }, t.label)) }),
    notes?.length ? /* @__PURE__ */ jsx9(View9, { style: { marginTop: 12 }, children: notes.map((n, i) => /* @__PURE__ */ jsxs9(Text9, { style: [type.caption, { marginBottom: 2 }], children: [
      "\xB7 ",
      n
    ] }, i)) }) : null
  ] }) });
}

// source/design/src/components/TableContinuationPage.jsx
import React10 from "react";
import { Page as Page7, View as View10, Text as Text10, StyleSheet as StyleSheet10 } from "@react-pdf/renderer";
import { jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
var s10 = StyleSheet10.create({
  page: { padding: 0, ...CHROME_PAD },
  eyebrow: { ...type.eyebrow, textTransform: "uppercase" },
  title: { ...type.h2, marginTop: 3, marginBottom: 16 }
});
function TableContinuationPage({ id, section, productName, formatLabel, columns, rows, caption }) {
  return /* @__PURE__ */ jsx10(Page7, { size: "A4", style: s10.page, children: /* @__PURE__ */ jsxs10(PageChrome, { id, section, children: [
    /* @__PURE__ */ jsx10(Text10, { style: s10.eyebrow, children: section }),
    /* @__PURE__ */ jsxs10(Text10, { style: s10.title, children: [
      productName,
      " \u2014 continua\xE7\xE3o",
      formatLabel ? ` \xB7 ${formatLabel}` : ""
    ] }),
    /* @__PURE__ */ jsx10(TechTable, { columns, rows, caption })
  ] }) });
}

// source/design/src/components/ComparisonPage.jsx
import React11 from "react";
import { Page as Page8, View as View11, Text as Text11, StyleSheet as StyleSheet11 } from "@react-pdf/renderer";
import { jsx as jsx11, jsxs as jsxs11 } from "react/jsx-runtime";
var s11 = StyleSheet11.create({
  page: { padding: 0, ...CHROME_PAD },
  intro: { ...type.body, marginTop: 6, marginBottom: 18, maxWidth: "78%" },
  helpBox: { marginTop: 18, padding: 12, backgroundColor: color.surfaceAlt, borderRadius: 2 },
  helpTitle: { fontFamily: "Inter", fontSize: 8, fontWeight: 700, color: color.muted, letterSpacing: 0.5, marginBottom: 5, textTransform: "uppercase" },
  helpText: { ...type.bodySmall }
});
function ComparisonPage({ id, bookmark, section, title, intro, columns, rows, helpNote }) {
  return /* @__PURE__ */ jsx11(Page8, { size: "A4", style: s11.page, children: /* @__PURE__ */ jsxs11(PageChrome, { id, bookmark, section, children: [
    /* @__PURE__ */ jsx11(SectionHeading, { eyebrow: "Compara\xE7\xE3o de produtos", title }),
    intro ? /* @__PURE__ */ jsx11(Text11, { style: s11.intro, children: intro }) : null,
    /* @__PURE__ */ jsx11(TechTable, { columns, rows }),
    helpNote ? /* @__PURE__ */ jsxs11(View11, { style: s11.helpBox, children: [
      /* @__PURE__ */ jsx11(Text11, { style: s11.helpTitle, children: "Como escolher" }),
      /* @__PURE__ */ jsx11(Text11, { style: s11.helpText, children: helpNote })
    ] }) : null
  ] }) });
}

// source/design/src/components/ContactPage.jsx
import React12 from "react";
import { Page as Page9, View as View12, Text as Text12, Link as Link6, StyleSheet as StyleSheet12 } from "@react-pdf/renderer";
import { jsx as jsx12, jsxs as jsxs12 } from "react/jsx-runtime";
var s12 = StyleSheet12.create({
  page: { padding: 0, backgroundColor: color.primaryDark },
  content: { flexGrow: 1, padding: page.margin, paddingVertical: page.margin * 1.3, justifyContent: "space-between" },
  kicker: { fontFamily: "Inter", fontSize: 9, fontWeight: 600, color: "#8FB3D9", letterSpacing: 3, marginBottom: 10, textTransform: "uppercase" },
  title: { fontFamily: "Inter", fontSize: 30, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.1, marginBottom: 26 },
  row: { flexDirection: "row", marginTop: 24 },
  colInfo: { width: "54%" },
  colQr: { width: "46%", flexDirection: "row", justifyContent: "space-around" },
  infoBlock: { marginBottom: 18 },
  infoLabel: { fontFamily: "Inter", fontSize: 7.5, fontWeight: 700, color: "#8FB3D9", letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" },
  infoValue: { fontFamily: "Inter", fontSize: 11, fontWeight: 500, color: "#FFFFFF", lineHeight: 1.4 },
  infoLink: { fontFamily: "Inter", fontSize: 11, fontWeight: 600, color: "#FFFFFF", textDecoration: "none" },
  qrCard: { alignItems: "center" },
  qrCaption: { fontFamily: "Inter", fontSize: 8, fontWeight: 600, color: "#FFFFFF", marginTop: 6, textAlign: "center" },
  footerRule: { height: 0.75, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 14 },
  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontFamily: "Inter", fontSize: 7.5, color: "#8FB3D9" }
});
function ContactPage({ websiteQr, contactQr }) {
  return /* @__PURE__ */ jsx12(Page9, { size: "A4", style: s12.page, id: "contact", bookmark: { title: "Contactos", ref: "contact" }, children: /* @__PURE__ */ jsxs12(View12, { style: s12.content, children: [
    /* @__PURE__ */ jsxs12(View12, { children: [
      /* @__PURE__ */ jsx12(Text12, { style: s12.kicker, children: "Fale connosco" }),
      /* @__PURE__ */ jsxs12(Text12, { style: s12.title, children: [
        "CONTACTAR A",
        "\n",
        "ANDRADINOX"
      ] }),
      /* @__PURE__ */ jsxs12(View12, { style: s12.row, children: [
        /* @__PURE__ */ jsxs12(View12, { style: s12.colInfo, children: [
          /* @__PURE__ */ jsxs12(View12, { style: s12.infoBlock, children: [
            /* @__PURE__ */ jsx12(Text12, { style: s12.infoLabel, children: "Morada" }),
            /* @__PURE__ */ jsx12(Text12, { style: s12.infoValue, children: COMPANY.address })
          ] }),
          /* @__PURE__ */ jsxs12(View12, { style: s12.infoBlock, children: [
            /* @__PURE__ */ jsx12(Text12, { style: s12.infoLabel, children: "Telefone" }),
            /* @__PURE__ */ jsx12(Link6, { src: `tel:${COMPANY.phone.replace(/[^+\d]/g, "")}`, style: s12.infoLink, children: COMPANY.phone })
          ] }),
          /* @__PURE__ */ jsxs12(View12, { style: s12.infoBlock, children: [
            /* @__PURE__ */ jsx12(Text12, { style: s12.infoLabel, children: "Telem\xF3vel" }),
            /* @__PURE__ */ jsx12(Link6, { src: `tel:${COMPANY.mobile.replace(/[^+\d]/g, "")}`, style: s12.infoLink, children: COMPANY.mobile })
          ] }),
          /* @__PURE__ */ jsxs12(View12, { style: s12.infoBlock, children: [
            /* @__PURE__ */ jsx12(Text12, { style: s12.infoLabel, children: "Email" }),
            /* @__PURE__ */ jsx12(Link6, { src: `mailto:${COMPANY.email}`, style: s12.infoLink, children: COMPANY.email })
          ] }),
          /* @__PURE__ */ jsxs12(View12, { style: s12.infoBlock, children: [
            /* @__PURE__ */ jsx12(Text12, { style: s12.infoLabel, children: "Website" }),
            /* @__PURE__ */ jsx12(Link6, { src: COMPANY.websiteUrl, style: s12.infoLink, children: COMPANY.website })
          ] })
        ] }),
        /* @__PURE__ */ jsxs12(View12, { style: s12.colQr, children: [
          /* @__PURE__ */ jsxs12(View12, { style: s12.qrCard, children: [
            /* @__PURE__ */ jsx12(QRSvg, { qr: websiteQr, size: 70 }),
            /* @__PURE__ */ jsx12(Text12, { style: s12.qrCaption, children: "Visitar o website" })
          ] }),
          /* @__PURE__ */ jsxs12(View12, { style: s12.qrCard, children: [
            /* @__PURE__ */ jsx12(QRSvg, { qr: contactQr, size: 70 }),
            /* @__PURE__ */ jsx12(Text12, { style: s12.qrCaption, children: "P\xE1gina de contactos" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs12(View12, { children: [
      /* @__PURE__ */ jsx12(View12, { style: s12.footerRule }),
      /* @__PURE__ */ jsxs12(View12, { style: s12.footerRow, children: [
        /* @__PURE__ */ jsx12(Text12, { style: s12.footerText, children: COMPANY.legalName }),
        /* @__PURE__ */ jsxs12(Text12, { style: s12.footerText, children: [
          "Cat\xE1logo de Produtos \u2014 ",
          CATALOGUE_EDITION
        ] })
      ] })
    ] })
  ] }) });
}

// source/design/scripts/build-prototype.jsx
import { jsx as jsx13, jsxs as jsxs13 } from "react/jsx-runtime";
var ROOT2 = process.cwd();
var OUT = path3.join(ROOT2, "output/previews/Andradinox-Prototype-v0.1.pdf");
registerFonts();
var { bySlug, familiesByCategory } = loadCatalogue();
var mosqFamily = familiesByCategory["rede-mosquiteira"];
var mosqDescription = mosqFamily[0]?.description || null;
var mosqApplications = mosqFamily[0]?.applications || [];
var mosqMaterials = mosqFamily.map((p) => p.specifications?.material).filter(Boolean);
var MOSQ_COLUMNS = [
  { key: "malha", label: "MALHA", flex: 1 },
  { key: "abertura", label: "ABERTURA ENTRE FIOS", flex: 1.3 },
  { key: "arame", label: "DI\xC2METRO DO FIO", flex: 1 },
  { key: "largura", label: "LARGURA DO ROLO", flex: 1.4 }
];
var inox304 = bySlug["rede-mosquiteira-inox-aisi-304"];
var inox304Brico = bySlug["rede-mosquiteira-inox-brico"];
var inox304Rows = (inox304.specifications.tabela_precos || []).map((r) => ({
  malha: r.malha,
  abertura: r.abertura_mm + " mm",
  arame: r.arame_mm + " mm",
  largura: r.largura_rolo
}));
var inox304BricoRows = (inox304Brico.specifications.tabela_precos || []).map((r) => ({
  malha: r.malha,
  abertura: r.abertura_mm + " mm",
  arame: r.arame_mm + " mm",
  largura: r.rolo
}));
var teia304 = bySlug["teia-inox-aisi-304"];
var TEIA_COLUMNS = [
  { key: "malha", label: "MALHA", flex: 0.8 },
  { key: "abertura", label: "ABERTURA (MM)", flex: 1 },
  { key: "arame", label: "DI\xC2METRO DO ARAME (MM)", flex: 1.3 },
  { key: "largura", label: "LARGURA DO ROLO", flex: 1 }
];
var teia304AllRows = teia304.specifications.tabela_precos.map((r) => ({
  malha: r.malha,
  abertura: r.abertura_mm + " mm",
  arame: r.arame_mm + " mm",
  largura: r.largura_rolo
}));
var TEIA_SPLIT = 11;
var teia304RowsPage1 = teia304AllRows.slice(0, TEIA_SPLIT);
var teia304RowsPage2 = teia304AllRows.slice(TEIA_SPLIT);
var comparisonRows = [
  { material: "Inox AISI 304", malha: "18 x 14", abertura: "1.1 x 1.35 mm", arame: "0.28 mm", largura: "1.00 / 1.20 / 1.50 / 2.00 m", cor: "\u2014" },
  { material: "Inox AISI 316", malha: "18 x 14", abertura: "1.1 x 1.35 mm", arame: "0.28 mm", largura: "1.00 / 1.20 / 1.50 / 2.00 m", cor: "\u2014" },
  { material: "Alum\xEDnio", malha: "18 x 14", abertura: "1.1 x 1.35 mm", arame: "0.28 mm", largura: "1.00 / 1.20 / 1.50 m (rolo 30 m)", cor: "\u2014" },
  { material: "Fibra Anti-Fogo", malha: "18 x 14", abertura: "1.1 x 1.35 mm", arame: "0.28 mm", largura: "1.00 a 2.00 m (rolo 15 ou 30 m)", cor: "Branco / Cinza" },
  { material: "Galvanizado", malha: "16 x 16", abertura: "1.32 mm", arame: "0.28 mm", largura: "1.00 m (rolo 30 m)", cor: "\u2014" },
  { material: "Nylon (PVC)", malha: "18 x 14", abertura: "1.1 x 1.35 mm", arame: "0.28 mm", largura: "1.00 m (rolo 30 m)", cor: "Branco / Verde" },
  { material: "Lat\xE3o", malha: "18 x 14", abertura: "1.1 x 1.35 mm", arame: "0.28 mm", largura: "1.00 m (rolo 15 m)", cor: "\u2014" }
];
var COMPARISON_COLUMNS = [
  { key: "material", label: "MATERIAL", flex: 1.1 },
  { key: "malha", label: "MALHA", flex: 0.8 },
  { key: "abertura", label: "ABERTURA", flex: 1 },
  { key: "arame", label: "DI\xC2M. FIO", flex: 0.9 },
  { key: "largura", label: "LARGURA / ROLO", flex: 1.6 },
  { key: "cor", label: "COR", flex: 1 }
];
var overviewCards = mosqFamily.map((p) => {
  const row = p.specifications?.tabela_precos?.[0] || {};
  return {
    slug: p.slug,
    name: p.name.replace(/^Rede Mosquiteira\s*/, "") || p.name,
    material: p.specifications?.material || "\u2014",
    mainSpec: row.malha || "18 x 14",
    wireDiameter: (row.arame_mm ?? row.fio_mm ?? 0.28) + " mm",
    photo: resolveImage(p),
    href: p.slug === "rede-mosquiteira-inox-aisi-304" ? "#detail-mosq-inox-304" : p.url
  };
});
var tocEntries = [
  { id: "intro-andradinox", label: "A Andradinox", page: 3 },
  {
    id: "cat-mosquiteira",
    label: "Rede Mosquiteira",
    page: 4,
    sub: [
      { id: "overview-mosquiteira", label: "Gama de produtos", page: 5 },
      { id: "detail-mosq-inox-304", label: "Inox AISI 304 \u2014 ficha t\xE9cnica", page: 6 },
      { id: "comparison-mosquiteira", label: "Compara\xE7\xE3o de materiais", page: 7 }
    ]
  },
  {
    // No standalone Teia Inox category-intro page in this prototype (only the
    // product detail below) — the top-level row links straight to it. The full
    // build gives every category its own intro page with its own id/bookmark.
    id: "detail-teia-304",
    label: "Teia Inox",
    page: 8,
    sub: [{ id: "detail-teia-304", label: "AISI 304 \u2014 ficha t\xE9cnica (tabela completa)", page: 8 }]
  },
  { id: "contact", label: "Contactar a Andradinox", page: 10 }
];
var qrInox304 = await qrVector(inox304.url);
var qrTeia304 = await qrVector(teia304.url);
var qrWebsite = await qrVector(COMPANY.websiteUrl);
var qrContact = await qrVector("https://www.andradinox.pt/contactos/");
var doc = /* @__PURE__ */ jsxs13(
  Document,
  {
    title: `Andradinox \u2014 Cat\xE1logo de Produtos ${CATALOGUE_EDITION.replace("Edi\xE7\xE3o ", "")} (Prot\xF3tipo)`,
    author: COMPANY.legalName,
    subject: "Cat\xE1logo de produtos industriais \u2014 redes e teias em a\xE7o inoxid\xE1vel",
    keywords: "Andradinox, rede inox, teia inox, AISI 304, AISI 316, rede mosquiteira, rede electrosoldada, arame, malha met\xE1lica",
    creator: "Andradinox Catalogue Design System",
    producer: "react-pdf",
    language: "pt-PT",
    pageLayout: "singlePage",
    children: [
      /* @__PURE__ */ jsx13(Cover, { coverPhoto: resolveImage(bySlug["rede-electrosoldada-inox-aisi-316"]) }),
      /* @__PURE__ */ jsx13(TOCPage, { entries: tocEntries }),
      /* @__PURE__ */ jsx13(IntroPage, {}),
      /* @__PURE__ */ jsx13(
        CategoryIntro,
        {
          id: "cat-mosquiteira",
          bookmark: { title: "Rede Mosquiteira", ref: "cat-mosquiteira", expanded: true },
          index: 1,
          name: "Rede Mosquiteira",
          description: mosqDescription,
          materials: mosqMaterials,
          applications: mosqApplications,
          families: mosqFamily.map((p) => p.name),
          photo: resolveImage(inox304),
          photoCaption: "Rede Mosquiteira Inox AISI 304 \u2014 acondicionamento em rolo."
        }
      ),
      /* @__PURE__ */ jsx13(
        ProductOverview,
        {
          id: "overview-mosquiteira",
          bookmark: { title: "Gama de produtos", ref: "overview-mosquiteira", parent: "cat-mosquiteira" },
          section: "Rede Mosquiteira",
          title: "GAMA REDE MOSQUITEIRA",
          products: overviewCards
        }
      ),
      /* @__PURE__ */ jsx13(
        ProductDetail,
        {
          id: "detail-mosq-inox-304",
          bookmark: { title: "Inox AISI 304", ref: "detail-mosq-inox-304", parent: "cat-mosquiteira" },
          section: "Rede Mosquiteira",
          category: "Rede Mosquiteira",
          name: "Rede Mosquiteira Inox AISI 304",
          material: "AISI 304",
          heroImage: resolveImage(inox304),
          description: inox304.description,
          applications: inox304.applications,
          specSummary: [
            { label: "Material", value: "A\xE7o Inoxid\xE1vel AISI 304" },
            { label: "Malha", value: "18 x 14" },
            { label: "Abertura entre fios", value: "1.1 x 1.35 mm" },
            { label: "Di\xE2metro do fio", value: "0.28 mm" },
            { label: "Larguras de rolo (venda ao metro)", value: "1.00 / 1.20 / 1.50 / 2.00 m" },
            { label: "Peso", value: "Informa\xE7\xE3o a confirmar" }
          ],
          tables: [
            { label: "Rolo / Metro\xB2", columns: MOSQ_COLUMNS, rows: inox304Rows },
            {
              label: "Rolo retalho (linha Brico)",
              columns: MOSQ_COLUMNS,
              rows: inox304BricoRows,
              caption: "Formato de venda ao p\xFAblico em pequena quantidade (linha Brico), distinto do rolo por metro linear acima."
            }
          ],
          productUrl: inox304.url,
          productQr: qrInox304,
          notes: [
            "REF/SKU n\xE3o dispon\xEDvel no site de origem \u2014 a confirmar com a Andradinox antes da impress\xE3o.",
            "Peso do produto n\xE3o dispon\xEDvel no site de origem."
          ]
        }
      ),
      /* @__PURE__ */ jsx13(
        ComparisonPage,
        {
          id: "comparison-mosquiteira",
          bookmark: { title: "Compara\xE7\xE3o de materiais", ref: "comparison-mosquiteira", parent: "cat-mosquiteira" },
          section: "Rede Mosquiteira",
          title: "COMPARA\xC7\xC3O DE MATERIAIS",
          intro: "As redes mosquiteiras Andradinox est\xE3o dispon\xEDveis em sete materiais distintos. Utilize esta tabela para comparar rapidamente a malha, abertura, di\xE2metro do fio e formatos de rolo dispon\xEDveis antes de consultar a ficha t\xE9cnica de cada produto.",
          columns: COMPARISON_COLUMNS,
          rows: comparisonRows,
          helpNote: "Para ambientes com maior exposi\xE7\xE3o salina ou qu\xEDmica recomenda-se AISI 316. Para aplica\xE7\xF5es decorativas ou de baixo custo, Nylon (PVC), Alum\xEDnio ou Fibra Anti-Fogo s\xE3o alternativas n\xE3o met\xE1licas ou de menor custo. Confirmar adequa\xE7\xE3o t\xE9cnica com a Andradinox para cada aplica\xE7\xE3o espec\xEDfica."
        }
      ),
      /* @__PURE__ */ jsx13(
        ProductDetail,
        {
          id: "detail-teia-304",
          bookmark: { title: "Teia Inox", ref: "cat-teia-inox", expanded: true },
          section: "Teia Inox",
          category: "Teia Inox",
          name: "Teia Inox AISI 304",
          material: "AISI 304",
          heroImage: resolveImage(teia304),
          description: teia304.description,
          applications: teia304.applications,
          specSummary: [
            { label: "Material", value: "A\xE7o Inoxid\xE1vel AISI 304" },
            { label: "Gama de malha dispon\xEDvel", value: "Malha 3 a Malha 320 (19 op\xE7\xF5es)" },
            { label: "Larguras de rolo", value: "1.00 / 1.25 m" },
            { label: "Peso", value: "Informa\xE7\xE3o a confirmar" }
          ],
          tables: [{
            label: "",
            columns: TEIA_COLUMNS,
            rows: teia304RowsPage1,
            caption: `A tabela continua na p\xE1gina seguinte (${teia304AllRows.length} op\xE7\xF5es de malha no total).`
          }],
          productUrl: teia304.url,
          productQr: qrTeia304,
          notes: ["REF/SKU n\xE3o dispon\xEDvel no site de origem \u2014 a confirmar com a Andradinox antes da impress\xE3o."]
        }
      ),
      /* @__PURE__ */ jsx13(
        TableContinuationPage,
        {
          id: "detail-teia-304-cont",
          section: "Teia Inox",
          productName: "Teia Inox AISI 304",
          columns: TEIA_COLUMNS,
          rows: teia304RowsPage2,
          caption: "Tabela t\xE9cnica completa \u2014 Teia Inox AISI 304 (continua\xE7\xE3o)."
        }
      ),
      /* @__PURE__ */ jsx13(ContactPage, { websiteQr: qrWebsite, contactQr: qrContact })
    ]
  }
);
await renderToFile(doc, OUT);
console.log("Prototype written to", OUT);
