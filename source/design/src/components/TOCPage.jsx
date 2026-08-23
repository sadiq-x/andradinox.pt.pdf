import React from 'react';
import { Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import { PageChrome, CHROME_PAD } from './Chrome.jsx';
import { SectionHeading } from './Bits.jsx';
import { color, type, page as pageTheme } from '../theme.js';

const s = StyleSheet.create({
  page: { padding: 0, ...CHROME_PAD },
  list: { marginTop: 26 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottom: `0.75pt solid ${color.border}`,
  },
  subRow: { paddingVertical: 7, paddingLeft: 18, borderBottom: `0.5pt solid ${color.border}` },
  num: { width: 22, fontFamily: 'Inter', fontSize: 9, fontWeight: 700, color: color.accent },
  label: { flex: 1, fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: color.ink },
  subLabel: { flex: 1, fontFamily: 'Inter', fontSize: 9, fontWeight: 400, color: color.body },
  pageNo: { fontFamily: 'Inter', fontSize: 9, fontWeight: 600, color: color.muted, width: 30, textAlign: 'right' },
  link: { textDecoration: 'none' },
});

export function TOCPage({ entries }) {
  return (
    <Page size="A4" style={s.page}>
      <PageChrome id="toc" section="Índice" bookmark={{ title: 'Índice', ref: 'toc' }}>
        <SectionHeading eyebrow="Navegação" title="Índice" />
        <View style={s.list}>
          {entries.map((e, i) => (
            <View key={e.id}>
              <Link src={`#${e.id}`} style={s.link}>
                <View style={s.row}>
                  <Text style={s.num}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={s.label}>{e.label}</Text>
                  <Text style={s.pageNo}>{e.page}</Text>
                </View>
              </Link>
              {e.sub?.map((se) => (
                <Link key={se.id} src={`#${se.id}`} style={s.link}>
                  <View style={s.subRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={s.subLabel}>{se.label}</Text>
                      <Text style={s.pageNo}>{se.page}</Text>
                    </View>
                  </View>
                </Link>
              ))}
            </View>
          ))}
        </View>
      </PageChrome>
    </Page>
  );
}
