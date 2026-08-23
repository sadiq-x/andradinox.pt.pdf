import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { color, type } from '../theme.js';

const s = StyleSheet.create({
  table: { borderTop: `1pt solid ${color.tableHeaderBg}`, borderBottom: `0.75pt solid ${color.border}` },
  headerRow: { flexDirection: 'row', backgroundColor: color.tableHeaderBg },
  headerCell: { paddingVertical: 6, paddingHorizontal: 7, justifyContent: 'center' },
  row: { flexDirection: 'row', borderBottom: `0.5pt solid ${color.border}` },
  rowAlt: { backgroundColor: color.tableRowAlt },
  cell: { paddingVertical: 5.5, paddingHorizontal: 7, justifyContent: 'center' },
  caption: { marginTop: 6, fontFamily: 'Inter', fontSize: 7.5, color: color.faint },
});

/**
 * columns: [{ key, label, flex=1, align='left'|'right'|'center' }]
 * rows: array of plain objects keyed by column.key
 */
export function TechTable({ columns, rows, caption, continued }) {
  return (
    <View>
      <View style={s.table}>
        <View style={s.headerRow} fixed={false}>
          {columns.map((c) => (
            <View key={c.key} style={[s.headerCell, { flex: c.flex ?? 1 }]}>
              <Text style={[type.tableHeader, { textAlign: c.align || 'left' }]}>{c.label}</Text>
            </View>
          ))}
        </View>
        {rows.map((row, i) => (
          <View key={i} style={[s.row, i % 2 === 1 ? s.rowAlt : null]} wrap={false}>
            {columns.map((c) => (
              <View key={c.key} style={[s.cell, { flex: c.flex ?? 1 }]}>
                <Text style={[type.tableBody, { textAlign: c.align || 'left' }]}>
                  {row[c.key] ?? '—'}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      {caption ? <Text style={s.caption}>{caption}</Text> : null}
    </View>
  );
}

// Splits rows into page-sized chunks so large tables never shrink type —
// they gain pages instead (brief section 9).
export function chunkRows(rows, perPage) {
  const chunks = [];
  for (let i = 0; i < rows.length; i += perPage) chunks.push(rows.slice(i, i + perPage));
  return chunks;
}
