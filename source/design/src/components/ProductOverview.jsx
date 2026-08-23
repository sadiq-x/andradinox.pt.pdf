import React from 'react';
import { Page, View, Text, Image, Link, StyleSheet } from '@react-pdf/renderer';
import { PageChrome, CHROME_PAD } from './Chrome.jsx';
import { SectionHeading, Tag } from './Bits.jsx';
import { color, type } from '../theme.js';

const s = StyleSheet.create({
  page: { padding: 0, ...CHROME_PAD },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20 },
  card: {
    width: '48.5%',
    marginRight: '3%',
    marginBottom: 11,
    border: `0.75pt solid ${color.border}`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  cardLast: { marginRight: 0 },
  cardPhoto: { width: '100%', height: 70, objectFit: 'cover', backgroundColor: color.surfaceAlt },
  cardBody: { padding: 9 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  cardName: { fontFamily: 'Inter', fontSize: 10, fontWeight: 700, color: color.ink, flex: 1, paddingRight: 6 },
  specStrip: { flexDirection: 'row', marginBottom: 8 },
  specCell: { flex: 1 },
  cardChar: { fontFamily: 'Inter', fontSize: 8, fontWeight: 500, color: color.body },
  cardCharLabel: { fontFamily: 'Inter', fontSize: 6, color: color.faint, letterSpacing: 0.4, marginBottom: 1 },
  cta: { fontFamily: 'Inter', fontSize: 8, fontWeight: 600, color: color.accent, textDecoration: 'none' },
  refRow: { borderTop: `0.5pt solid ${color.border}`, paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

export function ProductOverview({ id, bookmark, section, title, products }) {
  return (
    <Page size="A4" style={s.page}>
      <PageChrome id={id} bookmark={bookmark} section={section}>
        <SectionHeading eyebrow="Gama de produtos" title={title} />
        <View style={s.grid}>
          {products.map((p, i) => (
            <View key={p.slug} style={[s.card, i % 2 === 1 ? s.cardLast : null]} wrap={false}>
              {p.photo ? <Image src={p.photo} style={s.cardPhoto} /> : <View style={s.cardPhoto} />}
              <View style={s.cardBody}>
                <View style={s.cardTopRow}>
                  <Text style={s.cardName}>{p.name}</Text>
                  <Tag>{p.material}</Tag>
                </View>
                <View style={s.specStrip}>
                  <View style={s.specCell}>
                    <Text style={s.cardCharLabel}>MALHA</Text>
                    <Text style={s.cardChar}>{p.mainSpec}</Text>
                  </View>
                  <View style={s.specCell}>
                    <Text style={s.cardCharLabel}>DIÂMETRO DO FIO</Text>
                    <Text style={s.cardChar}>{p.wireDiameter}</Text>
                  </View>
                </View>
                <View style={s.refRow}>
                  <Text style={[s.cardCharLabel, { fontSize: 7 }]}>REF. a confirmar</Text>
                  <Link src={p.href} style={s.cta}>Ver produto →</Link>
                </View>
              </View>
            </View>
          ))}
        </View>
      </PageChrome>
    </Page>
  );
}
