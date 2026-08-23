import React from 'react';
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { color, page as pageTheme, COMPANY, CATALOGUE_EDITION, CATALOGUE_TITLE } from '../theme.js';

const s = StyleSheet.create({
  page: { padding: 0 },
  photo: { position: 'absolute', top: 0, left: 0, width: pageTheme.width, height: pageTheme.height, objectFit: 'cover' },
  scrim: { position: 'absolute', top: 0, left: 0, width: pageTheme.width, height: pageTheme.height, backgroundColor: color.primaryDark, opacity: 0.8 },
  content: {
    flexGrow: 1,
    padding: pageTheme.margin,
    paddingVertical: pageTheme.margin * 1.4,
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  wordmark: { fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#FFFFFF', letterSpacing: 2 },
  tagline: { fontFamily: 'Inter', fontSize: 8.5, fontWeight: 500, color: '#C6D3E0', letterSpacing: 0.6, marginTop: 5 },
  meshMark: { width: 20, height: 20, marginRight: 9 },

  titleBlock: {},
  kicker: { fontFamily: 'Inter', fontSize: 9, fontWeight: 600, color: '#8FB3D9', letterSpacing: 3, marginBottom: 10, textTransform: 'uppercase' },
  title: { fontFamily: 'Inter', fontSize: 40, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.05 },
  edition: { fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: '#C6D3E0', marginTop: 10 },
  accentLine: { width: 46, height: 3, backgroundColor: color.accent, marginTop: 18, marginBottom: 18 },

  categories: { flexDirection: 'row', flexWrap: 'wrap', maxWidth: 380 },
  catChip: {
    fontFamily: 'Inter', fontSize: 8, fontWeight: 500, color: '#E4EAF0',
    borderColor: 'rgba(255,255,255,0.35)', borderWidth: 0.75, borderRadius: 2,
    paddingVertical: 3.5, paddingHorizontal: 8, marginRight: 6, marginBottom: 6,
  },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  footerLabel: { fontFamily: 'Inter', fontSize: 7.5, fontWeight: 600, color: '#8FB3D9', letterSpacing: 1, marginBottom: 3, textTransform: 'uppercase' },
  footerValue: { fontFamily: 'Inter', fontSize: 9, fontWeight: 500, color: '#FFFFFF' },
});

const CATEGORY_CHIPS = [
  'Teia Inox', 'Teia Zincada', 'Rede Electrosoldada Inox', 'Rede Mosquiteira', 'Arame',
];

export function Cover({ coverPhoto }) {
  return (
    <Page size="A4" style={s.page}>
      {coverPhoto ? <Image src={coverPhoto} style={s.photo} /> : <View style={[s.photo, { backgroundColor: color.primaryDark }]} />}
      <View style={s.scrim} />
      <View style={s.content}>
        <View style={s.brandRow}>
          <Text style={s.wordmark}>ANDRADINOX</Text>
        </View>

        <View style={s.titleBlock}>
          <Text style={s.kicker}>Importação · Distribuição · Exportação de Redes Metálicas</Text>
          <Text style={s.title}>{CATALOGUE_TITLE}</Text>
          <View style={s.accentLine} />
          <Text style={s.edition}>{CATALOGUE_EDITION}</Text>
          <View style={{ height: 22 }} />
          <View style={s.categories}>
            {CATEGORY_CHIPS.map((c) => (
              <Text key={c} style={s.catChip}>{c}</Text>
            ))}
          </View>
        </View>

        <View style={s.footerRow}>
          <View>
            <Text style={s.footerLabel}>Website</Text>
            <Text style={s.footerValue}>{COMPANY.website}</Text>
          </View>
          <View>
            <Text style={s.footerLabel}>Contacto</Text>
            <Text style={s.footerValue}>{COMPANY.phone}</Text>
          </View>
          <View>
            <Text style={s.footerLabel}>Email</Text>
            <Text style={s.footerValue}>{COMPANY.email}</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}
