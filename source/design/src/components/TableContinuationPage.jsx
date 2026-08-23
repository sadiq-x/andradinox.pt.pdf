import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageChrome, CHROME_PAD } from './Chrome.jsx';
import { TechTable } from './TechTable.jsx';
import { color, type } from '../theme.js';

const s = StyleSheet.create({
  page: { padding: 0, ...CHROME_PAD },
  eyebrow: { ...type.eyebrow, textTransform: 'uppercase' },
  title: { ...type.h2, marginTop: 3, marginBottom: 16 },
});

// Used when a technical table is too large for one page. Rather than shrinking
// type to force-fit it (forbidden by the brief), the table continues here with
// its header row repeated, on a fresh page carrying the same chrome.
export function TableContinuationPage({ id, section, productName, formatLabel, columns, rows, caption }) {
  return (
    <Page size="A4" style={s.page}>
      <PageChrome id={id} section={section}>
        <Text style={s.eyebrow}>{section}</Text>
        <Text style={s.title}>{productName} — continuação{formatLabel ? ` · ${formatLabel}` : ''}</Text>
        <TechTable columns={columns} rows={rows} caption={caption} />
      </PageChrome>
    </Page>
  );
}
