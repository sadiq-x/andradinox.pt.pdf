import React from 'react';
import { View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import { color, type, page, COMPANY, CATALOGUE_EDITION } from '../theme.js';

// react-pdf resolves absolute-position offsets against the PADDED content box
// of the nearest ancestor (i.e. top:0 lands at the inner edge of the Page's own
// padding, not the physical page edge). Since CHROME_PAD reserves that padding
// specifically to fit these bars, they must pull themselves back up/down by
// exactly that amount to land in the gutter instead of overlapping the content.
const HEADER_H = 34;
const FOOTER_H = 28;

const s = StyleSheet.create({
  header: {
    position: 'absolute',
    top: -(HEADER_H + 14),
    left: 0,
    right: 0,
    height: HEADER_H,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `0.75pt solid ${color.border}`,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'baseline' },
  headerBrand: { fontFamily: 'Inter', fontSize: 9, fontWeight: 700, color: color.primary, letterSpacing: 0.5 },
  headerDivider: { fontSize: 9, color: color.border, marginHorizontal: 6 },
  headerEdition: { fontFamily: 'Inter', fontSize: 8, fontWeight: 500, color: color.muted, letterSpacing: 0.4 },
  headerSection: { fontFamily: 'Inter', fontSize: 8, fontWeight: 500, color: color.muted },

  footer: {
    position: 'absolute',
    bottom: -(FOOTER_H + 14),
    left: 0,
    right: 0,
    height: FOOTER_H,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: `0.75pt solid ${color.border}`,
  },
  footerLink: { fontFamily: 'Inter', fontSize: 8, fontWeight: 600, color: color.accent, textDecoration: 'none' },
  footerCenter: { fontFamily: 'Inter', fontSize: 8, fontWeight: 500, color: color.muted },
  footerPage: { fontFamily: 'Inter', fontSize: 8, fontWeight: 600, color: color.ink },
});

export function Header({ section }) {
  return (
    <View style={s.header} fixed>
      <View style={s.headerLeft}>
        <Text style={s.headerBrand}>ANDRADINOX</Text>
        <Text style={s.headerDivider}>|</Text>
        <Text style={s.headerEdition}>CATÁLOGO {CATALOGUE_EDITION.replace('Edição ', '')}</Text>
      </View>
      {section ? <Text style={s.headerSection}>{section}</Text> : null}
    </View>
  );
}

export function Footer({ section }) {
  return (
    <View style={s.footer} fixed>
      <Link src="#toc" style={s.footerLink}>← Índice</Link>
      <Text style={s.footerCenter}>{section || COMPANY.name}</Text>
      <Text
        style={s.footerPage}
        render={({ pageNumber }) => `Página ${pageNumber}`}
      />
    </View>
  );
}

// The content inset that makes room for the fixed header/footer. This MUST live
// on the <Page> element itself (spread into its style), not on a child View —
// react-pdf only re-applies a Page's own padding on every auto-generated
// continuation page when content wraps; a child View's padding is only honoured
// once, which left continuation pages colliding with the fixed header.
export const CHROME_PAD = {
  paddingTop: HEADER_H + 14,
  paddingBottom: FOOTER_H + 14,
  paddingLeft: page.margin,
  paddingRight: page.margin,
};

// Wraps page content with the fixed header/footer chrome. Assumes the parent
// <Page> already carries CHROME_PAD in its style.
export function PageChrome({ id, section, bookmark, style, children }) {
  return (
    <View id={id} bookmark={bookmark} style={style}>
      <Header section={section} />
      {children}
      <Footer section={section} />
    </View>
  );
}
