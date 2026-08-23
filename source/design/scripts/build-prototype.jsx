import React from 'react';
import { Document, renderToFile } from '@react-pdf/renderer';
import path from 'node:path';

import { registerFonts } from '../src/lib/fonts.js';
import { qrVector } from '../src/lib/qr.js';
import { loadCatalogue, resolveImage } from '../src/lib/data.js';
import { Cover } from '../src/components/Cover.jsx';
import { TOCPage } from '../src/components/TOCPage.jsx';
import { IntroPage } from '../src/components/IntroPage.jsx';
import { CategoryIntro } from '../src/components/CategoryIntro.jsx';
import { ProductOverview } from '../src/components/ProductOverview.jsx';
import { ProductDetail } from '../src/components/ProductDetail.jsx';
import { TableContinuationPage } from '../src/components/TableContinuationPage.jsx';
import { ComparisonPage } from '../src/components/ComparisonPage.jsx';
import { ContactPage } from '../src/components/ContactPage.jsx';
import { CATALOGUE_EDITION, COMPANY } from '../src/theme.js';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'output/previews/Andradinox-Prototype-v0.1.pdf');

registerFonts();

const { bySlug, familiesByCategory } = loadCatalogue();

// ---- Rede Mosquiteira: category-level content (verbatim/aggregated from real data) ----
const mosqFamily = familiesByCategory['rede-mosquiteira'];
const mosqDescription = mosqFamily[0]?.description || null;
const mosqApplications = mosqFamily[0]?.applications || [];
const mosqMaterials = mosqFamily.map((p) => p.specifications?.material).filter(Boolean);

const MOSQ_COLUMNS = [
  { key: 'malha', label: 'MALHA', flex: 1 },
  { key: 'abertura', label: 'ABERTURA ENTRE FIOS', flex: 1.3 },
  { key: 'arame', label: 'DIÂMETRO DO FIO', flex: 1 },
  { key: 'largura', label: 'LARGURA DO ROLO', flex: 1.4 },
];

const inox304 = bySlug['rede-mosquiteira-inox-aisi-304'];
const inox304Brico = bySlug['rede-mosquiteira-inox-brico'];

const inox304Rows = (inox304.specifications.tabela_precos || []).map((r) => ({
  malha: r.malha, abertura: r.abertura_mm + ' mm', arame: r.arame_mm + ' mm', largura: r.largura_rolo,
}));
const inox304BricoRows = (inox304Brico.specifications.tabela_precos || []).map((r) => ({
  malha: r.malha, abertura: r.abertura_mm + ' mm', arame: r.arame_mm + ' mm', largura: r.rolo,
}));

// ---- Teia Inox AISI 304: large technical table (19 mesh options) ----
const teia304 = bySlug['teia-inox-aisi-304'];
const TEIA_COLUMNS = [
  { key: 'malha', label: 'MALHA', flex: 0.8 },
  { key: 'abertura', label: 'ABERTURA (MM)', flex: 1 },
  { key: 'arame', label: 'DIÂMETRO DO ARAME (MM)', flex: 1.3 },
  { key: 'largura', label: 'LARGURA DO ROLO', flex: 1 },
];
const teia304AllRows = teia304.specifications.tabela_precos.map((r) => ({
  malha: r.malha, abertura: r.abertura_mm + ' mm', arame: r.arame_mm + ' mm', largura: r.largura_rolo,
}));
const TEIA_SPLIT = 11;
const teia304RowsPage1 = teia304AllRows.slice(0, TEIA_SPLIT);
const teia304RowsPage2 = teia304AllRows.slice(TEIA_SPLIT);

// ---- Comparison table: 7 mosquiteira materials, hand-mapped from verified data ----
const comparisonRows = [
  { material: 'Inox AISI 304', malha: '18 x 14', abertura: '1.1 x 1.35 mm', arame: '0.28 mm', largura: '1.00 / 1.20 / 1.50 / 2.00 m', cor: '—' },
  { material: 'Inox AISI 316', malha: '18 x 14', abertura: '1.1 x 1.35 mm', arame: '0.28 mm', largura: '1.00 / 1.20 / 1.50 / 2.00 m', cor: '—' },
  { material: 'Alumínio', malha: '18 x 14', abertura: '1.1 x 1.35 mm', arame: '0.28 mm', largura: '1.00 / 1.20 / 1.50 m (rolo 30 m)', cor: '—' },
  { material: 'Fibra Anti-Fogo', malha: '18 x 14', abertura: '1.1 x 1.35 mm', arame: '0.28 mm', largura: '1.00 a 2.00 m (rolo 15 ou 30 m)', cor: 'Branco / Cinza' },
  { material: 'Galvanizado', malha: '16 x 16', abertura: '1.32 mm', arame: '0.28 mm', largura: '1.00 m (rolo 30 m)', cor: '—' },
  { material: 'Nylon (PVC)', malha: '18 x 14', abertura: '1.1 x 1.35 mm', arame: '0.28 mm', largura: '1.00 m (rolo 30 m)', cor: 'Branco / Verde' },
  { material: 'Latão', malha: '18 x 14', abertura: '1.1 x 1.35 mm', arame: '0.28 mm', largura: '1.00 m (rolo 15 m)', cor: '—' },
];
const COMPARISON_COLUMNS = [
  { key: 'material', label: 'MATERIAL', flex: 1.1 },
  { key: 'malha', label: 'MALHA', flex: 0.8 },
  { key: 'abertura', label: 'ABERTURA', flex: 1 },
  { key: 'arame', label: 'DIÂM. FIO', flex: 0.9 },
  { key: 'largura', label: 'LARGURA / ROLO', flex: 1.6 },
  { key: 'cor', label: 'COR', flex: 1 },
];

// ---- Overview cards ----
const overviewCards = mosqFamily.map((p) => {
  const row = p.specifications?.tabela_precos?.[0] || {};
  return {
    slug: p.slug,
    name: p.name.replace(/^Rede Mosquiteira\s*/, '') || p.name,
    material: p.specifications?.material || '—',
    mainSpec: row.malha || '18 x 14',
    wireDiameter: (row.arame_mm ?? row.fio_mm ?? 0.28) + ' mm',
    photo: resolveImage(p),
    href: p.slug === 'rede-mosquiteira-inox-aisi-304' ? '#detail-mosq-inox-304' : p.url,
  };
});

// ---- Table of contents (page numbers hand-tracked for this fixed prototype sequence) ----
const tocEntries = [
  { id: 'intro-andradinox', label: 'A Andradinox', page: 3 },
  {
    id: 'cat-mosquiteira', label: 'Rede Mosquiteira', page: 4,
    sub: [
      { id: 'overview-mosquiteira', label: 'Gama de produtos', page: 5 },
      { id: 'detail-mosq-inox-304', label: 'Inox AISI 304 — ficha técnica', page: 6 },
      { id: 'comparison-mosquiteira', label: 'Comparação de materiais', page: 7 },
    ],
  },
  {
    // No standalone Teia Inox category-intro page in this prototype (only the
    // product detail below) — the top-level row links straight to it. The full
    // build gives every category its own intro page with its own id/bookmark.
    id: 'detail-teia-304', label: 'Teia Inox', page: 8,
    sub: [{ id: 'detail-teia-304', label: 'AISI 304 — ficha técnica (tabela completa)', page: 8 }],
  },
  { id: 'contact', label: 'Contactar a Andradinox', page: 10 },
];

// react-pdf's reconciler does not support async function components, so every
// QR code's vector path data is resolved up front here and passed down as plain props.
const qrInox304 = await qrVector(inox304.url);
const qrTeia304 = await qrVector(teia304.url);
const qrWebsite = await qrVector(COMPANY.websiteUrl);
const qrContact = await qrVector('https://www.andradinox.pt/contactos/');

const doc = (
  <Document
    title={`Andradinox — Catálogo de Produtos ${CATALOGUE_EDITION.replace('Edição ', '')} (Protótipo)`}
    author={COMPANY.legalName}
    subject="Catálogo de produtos industriais — redes e teias em aço inoxidável"
    keywords="Andradinox, rede inox, teia inox, AISI 304, AISI 316, rede mosquiteira, rede electrosoldada, arame, malha metálica"
    creator="Andradinox Catalogue Design System"
    producer="react-pdf"
    language="pt-PT"
    pageLayout="singlePage"
  >
    <Cover coverPhoto={resolveImage(bySlug['rede-electrosoldada-inox-aisi-316'])} />

    <TOCPage entries={tocEntries} />

    <IntroPage />

    <CategoryIntro
      id="cat-mosquiteira"
      bookmark={{ title: 'Rede Mosquiteira', ref: 'cat-mosquiteira', expanded: true }}
      index={1}
      name="Rede Mosquiteira"
      description={mosqDescription}
      materials={mosqMaterials}
      applications={mosqApplications}
      families={mosqFamily.map((p) => p.name)}
      photo={resolveImage(inox304)}
      photoCaption="Rede Mosquiteira Inox AISI 304 — acondicionamento em rolo."
    />

    <ProductOverview
      id="overview-mosquiteira"
      bookmark={{ title: 'Gama de produtos', ref: 'overview-mosquiteira', parent: 'cat-mosquiteira' }}
      section="Rede Mosquiteira"
      title="GAMA REDE MOSQUITEIRA"
      products={overviewCards}
    />

    <ProductDetail
      id="detail-mosq-inox-304"
      bookmark={{ title: 'Inox AISI 304', ref: 'detail-mosq-inox-304', parent: 'cat-mosquiteira' }}
      section="Rede Mosquiteira"
      category="Rede Mosquiteira"
      name="Rede Mosquiteira Inox AISI 304"
      material="AISI 304"
      heroImage={resolveImage(inox304)}
      description={inox304.description}
      applications={inox304.applications}
      specSummary={[
        { label: 'Material', value: 'Aço Inoxidável AISI 304' },
        { label: 'Malha', value: '18 x 14' },
        { label: 'Abertura entre fios', value: '1.1 x 1.35 mm' },
        { label: 'Diâmetro do fio', value: '0.28 mm' },
        { label: 'Larguras de rolo (venda ao metro)', value: '1.00 / 1.20 / 1.50 / 2.00 m' },
        { label: 'Peso', value: 'Informação a confirmar' },
      ]}
      tables={[
        { label: 'Rolo / Metro²', columns: MOSQ_COLUMNS, rows: inox304Rows },
        {
          label: 'Rolo retalho (linha Brico)', columns: MOSQ_COLUMNS, rows: inox304BricoRows,
          caption: 'Formato de venda ao público em pequena quantidade (linha Brico), distinto do rolo por metro linear acima.',
        },
      ]}
      productUrl={inox304.url}
      productQr={qrInox304}
      notes={[
        'REF/SKU não disponível no site de origem — a confirmar com a Andradinox antes da impressão.',
        'Peso do produto não disponível no site de origem.',
      ]}
    />

    <ComparisonPage
      id="comparison-mosquiteira"
      bookmark={{ title: 'Comparação de materiais', ref: 'comparison-mosquiteira', parent: 'cat-mosquiteira' }}
      section="Rede Mosquiteira"
      title="COMPARAÇÃO DE MATERIAIS"
      intro="As redes mosquiteiras Andradinox estão disponíveis em sete materiais distintos. Utilize esta tabela para comparar rapidamente a malha, abertura, diâmetro do fio e formatos de rolo disponíveis antes de consultar a ficha técnica de cada produto."
      columns={COMPARISON_COLUMNS}
      rows={comparisonRows}
      helpNote="Para ambientes com maior exposição salina ou química recomenda-se AISI 316. Para aplicações decorativas ou de baixo custo, Nylon (PVC), Alumínio ou Fibra Anti-Fogo são alternativas não metálicas ou de menor custo. Confirmar adequação técnica com a Andradinox para cada aplicação específica."
    />

    <ProductDetail
      id="detail-teia-304"
      bookmark={{ title: 'Teia Inox', ref: 'cat-teia-inox', expanded: true }}
      section="Teia Inox"
      category="Teia Inox"
      name="Teia Inox AISI 304"
      material="AISI 304"
      heroImage={resolveImage(teia304)}
      description={teia304.description}
      applications={teia304.applications}
      specSummary={[
        { label: 'Material', value: 'Aço Inoxidável AISI 304' },
        { label: 'Gama de malha disponível', value: 'Malha 3 a Malha 320 (19 opções)' },
        { label: 'Larguras de rolo', value: '1.00 / 1.25 m' },
        { label: 'Peso', value: 'Informação a confirmar' },
      ]}
      tables={[{
        label: '', columns: TEIA_COLUMNS, rows: teia304RowsPage1,
        caption: `A tabela continua na página seguinte (${teia304AllRows.length} opções de malha no total).`,
      }]}
      productUrl={teia304.url}
      productQr={qrTeia304}
      notes={['REF/SKU não disponível no site de origem — a confirmar com a Andradinox antes da impressão.']}
    />

    <TableContinuationPage
      id="detail-teia-304-cont"
      section="Teia Inox"
      productName="Teia Inox AISI 304"
      columns={TEIA_COLUMNS}
      rows={teia304RowsPage2}
      caption="Tabela técnica completa — Teia Inox AISI 304 (continuação)."
    />

    <ContactPage websiteQr={qrWebsite} contactQr={qrContact} />
  </Document>
);

await renderToFile(doc, OUT);
console.log('Prototype written to', OUT);
