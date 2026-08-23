import React from 'react';
import { Page, View, Text, Image, Link, StyleSheet } from '@react-pdf/renderer';
import { PageChrome, CHROME_PAD } from './Chrome.jsx';
import { Tag, ApplicationsList, SpecRail, SpecRow, QRSvg, Rule } from './Bits.jsx';
import { TechTable } from './TechTable.jsx';
import { color, type } from '../theme.js';

const s = StyleSheet.create({
  page: { padding: 0, ...CHROME_PAD },
  header: { marginTop: 4, marginBottom: 16 },
  eyebrow: { ...type.eyebrow, textTransform: 'uppercase' },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  name: { ...type.h1, fontSize: 22 },
  refNote: { ...type.sku, marginTop: 4 },

  layout: { flexDirection: 'row' },
  colLeft: { width: '34%', paddingRight: 18 },
  photoFrame: { border: `0.75pt solid ${color.border}`, borderRadius: 2, overflow: 'hidden', height: 142, marginBottom: 12 },
  photo: { width: '100%', height: '100%', objectFit: 'cover' },

  colRight: { width: '66%' },
  desc: { ...type.body, marginBottom: 12 },

  tablesBlock: { marginTop: 18 },
  formatLabel: { ...type.h3, marginBottom: 6, marginTop: 14 },

  priceCta: {
    marginTop: 14, padding: 10, backgroundColor: color.primaryTint, borderRadius: 2,
    flexDirection: 'row', alignItems: 'center',
  },
  priceCtaQr: { marginRight: 10 },
  priceCtaText: { fontFamily: 'Inter', fontSize: 8.5, fontWeight: 600, color: color.primary, flex: 1, paddingRight: 8, lineHeight: 1.3 },
  priceCtaLink: { fontFamily: 'Inter', fontSize: 8.5, fontWeight: 700, color: color.accent, textDecoration: 'none' },
});

export function ProductDetail({
  id, bookmark, section, category, name, material,
  heroImage, description, applications, specSummary,
  tables, productUrl, productQr, notes,
}) {
  return (
    <Page size="A4" style={s.page} wrap>
      <PageChrome id={id} bookmark={bookmark} section={section}>
        <View style={s.header}>
          <Text style={s.eyebrow}>{category}</Text>
          <View style={s.nameRow}>
            <Text style={s.name}>{name}</Text>
          </View>
          <Text style={s.refNote}>REF. A CONFIRMAR COM A ANDRADINOX</Text>
        </View>

        <View style={s.layout} wrap={false}>
          <View style={s.colLeft}>
            <View style={s.photoFrame}>
              {heroImage ? <Image src={heroImage} style={s.photo} /> : null}
            </View>
            {specSummary?.length ? (
              <SpecRail>
                {specSummary.map((row) => (
                  <SpecRow key={row.label} label={row.label} value={row.value} />
                ))}
              </SpecRail>
            ) : null}
          </View>

          <View style={s.colRight}>
            {description ? <Text style={s.desc}>{description}</Text> : null}
            <ApplicationsList items={applications} />

            <View style={s.priceCta}>
              {productQr ? (
                <View style={s.priceCtaQr}><QRSvg qr={productQr} size={40} /></View>
              ) : null}
              <Text style={s.priceCtaText}>Preços e disponibilidade: contactar a Andradinox</Text>
              {productUrl ? <Link src={productUrl} style={s.priceCtaLink}>Ver produto{'\n'}online →</Link> : null}
            </View>
          </View>
        </View>

        <View style={s.tablesBlock}>
          {tables.map((t) => (
            <View key={t.label} wrap={false}>
              <Text style={s.formatLabel}>ESPECIFICAÇÕES TÉCNICAS{tables.length > 1 ? ` — ${t.label.toUpperCase()}` : ''}</Text>
              <TechTable columns={t.columns} rows={t.rows} caption={t.caption} />
            </View>
          ))}
        </View>

        {notes?.length ? (
          <View style={{ marginTop: 12 }}>
            {notes.map((n, i) => (
              <Text key={i} style={[type.caption, { marginBottom: 2 }]}>· {n}</Text>
            ))}
          </View>
        ) : null}
      </PageChrome>
    </Page>
  );
}
