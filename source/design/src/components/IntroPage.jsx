import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageChrome, CHROME_PAD } from './Chrome.jsx';
import { SectionHeading, Tag } from './Bits.jsx';
import { color, type, COMPANY } from '../theme.js';

const s = StyleSheet.create({
  page: { padding: 0, ...CHROME_PAD },
  desc: { ...type.body, fontSize: 11, lineHeight: 1.6, marginTop: 8, marginBottom: 20, maxWidth: '82%' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 22 },
  tagSpacing: { marginRight: 6, marginBottom: 6 },

  grid: { flexDirection: 'row', marginTop: 6 },
  col: { width: '50%', paddingRight: 20 },
  blockTitle: { ...type.h3, marginBottom: 8 },
  row: { marginBottom: 12 },
  rowLabel: { ...type.techLabel, textTransform: 'uppercase' },
  rowValue: { ...type.techValue, marginTop: 2 },

  tbc: {
    marginTop: 22, padding: 12, backgroundColor: color.surfaceAlt, borderRadius: 2,
    border: `0.5pt solid ${color.border}`,
  },
  tbcTitle: { fontFamily: 'Inter', fontSize: 7.5, fontWeight: 700, color: color.muted, letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' },
  tbcText: { ...type.bodySmall },
});

export function IntroPage() {
  return (
    <Page size="A4" style={s.page}>
      <PageChrome id="intro-andradinox" bookmark={{ title: 'A Andradinox', ref: 'intro-andradinox' }} section="Introdução">
        <SectionHeading eyebrow="Introdução" title="A ANDRADINOX" />
        <Text style={s.desc}>
          Importação, distribuição e exportação de redes metálicas — rede hexagonal, rede e teia inox,
          rede mosquiteira, rede ovelheira, entre outras. A Andradinox fornece redes e teias em aço
          inoxidável, aço galvanizado, alumínio e outros materiais para aplicações industriais, de
          construção e de proteção.
        </Text>

        <View style={s.tagRow}>
          {['Teia Inox', 'Teia Zincada', 'Rede Electrosoldada Inox', 'Rede Mosquiteira', 'Arame'].map((c) => (
            <View key={c} style={s.tagSpacing}><Tag>{c}</Tag></View>
          ))}
        </View>

        <View style={s.grid}>
          <View style={s.col}>
            <Text style={s.blockTitle}>DADOS DA EMPRESA</Text>
            <View style={s.row}>
              <Text style={s.rowLabel}>Denominação social</Text>
              <Text style={s.rowValue}>{COMPANY.legalName}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.rowLabel}>Morada</Text>
              <Text style={s.rowValue}>{COMPANY.address}</Text>
            </View>
          </View>
          <View style={s.col}>
            <Text style={s.blockTitle}>CONTACTOS</Text>
            <View style={s.row}>
              <Text style={s.rowLabel}>Telefone / Telemóvel</Text>
              <Text style={s.rowValue}>{COMPANY.phone} · {COMPANY.mobile}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.rowLabel}>Email / Website</Text>
              <Text style={s.rowValue}>{COMPANY.email} · {COMPANY.website}</Text>
            </View>
          </View>
        </View>

        <View style={s.tbc}>
          <Text style={s.tbcTitle}>Informação a confirmar</Text>
          <Text style={s.tbcText}>
            História da empresa, certificações, capacidades de produção e mercados servidos não estão
            disponíveis nas fontes verificadas utilizadas para este catálogo. Estes conteúdos devem ser
            fornecidos e aprovados pela Andradinox antes da edição final.
          </Text>
        </View>
      </PageChrome>
    </Page>
  );
}
