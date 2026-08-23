import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageChrome, CHROME_PAD } from './Chrome.jsx';
import { SectionHeading } from './Bits.jsx';
import { TechTable } from './TechTable.jsx';
import { color, type } from '../theme.js';

const s = StyleSheet.create({
  page: { padding: 0, ...CHROME_PAD },
  intro: { ...type.body, marginTop: 6, marginBottom: 18, maxWidth: '78%' },
  helpBox: { marginTop: 18, padding: 12, backgroundColor: color.surfaceAlt, borderRadius: 2 },
  helpTitle: { fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: color.muted, letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' },
  helpText: { ...type.bodySmall },
});

export function ComparisonPage({ id, bookmark, section, title, intro, columns, rows, helpNote }) {
  return (
    <Page size="A4" style={s.page}>
      <PageChrome id={id} bookmark={bookmark} section={section}>
        <SectionHeading eyebrow="Comparação de produtos" title={title} />
        {intro ? <Text style={s.intro}>{intro}</Text> : null}
        <TechTable columns={columns} rows={rows} />
        {helpNote ? (
          <View style={s.helpBox}>
            <Text style={s.helpTitle}>Como escolher</Text>
            <Text style={s.helpText}>{helpNote}</Text>
          </View>
        ) : null}
      </PageChrome>
    </Page>
  );
}
