import React from 'react';
import { Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import { QRSvg } from './Bits.jsx';
import { color, page as pageTheme, COMPANY, CATALOGUE_EDITION } from '../theme.js';

const s = StyleSheet.create({
  page: { padding: 0, backgroundColor: color.primaryDark },
  content: { flexGrow: 1, padding: pageTheme.margin, paddingVertical: pageTheme.margin * 1.3, justifyContent: 'space-between' },
  kicker: { fontFamily: 'Inter', fontSize: 9, fontWeight: 600, color: '#8FB3D9', letterSpacing: 3, marginBottom: 10, textTransform: 'uppercase' },
  title: { fontFamily: 'Inter', fontSize: 30, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, marginBottom: 26 },

  row: { flexDirection: 'row', marginTop: 24 },
  colInfo: { width: '54%' },
  colQr: { width: '46%', flexDirection: 'row', justifyContent: 'space-around' },

  infoBlock: { marginBottom: 18 },
  infoLabel: { fontFamily: 'Inter', fontSize: 7.5, fontWeight: 700, color: '#8FB3D9', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' },
  infoValue: { fontFamily: 'Inter', fontSize: 11, fontWeight: 500, color: '#FFFFFF', lineHeight: 1.4 },
  infoLink: { fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#FFFFFF', textDecoration: 'none' },

  qrCard: { alignItems: 'center' },
  qrCaption: { fontFamily: 'Inter', fontSize: 8, fontWeight: 600, color: '#FFFFFF', marginTop: 6, textAlign: 'center' },

  footerRule: { height: 0.75, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 14 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontFamily: 'Inter', fontSize: 7.5, color: '#8FB3D9' },
});

export function ContactPage({ websiteQr, contactQr }) {
  return (
    <Page size="A4" style={s.page} id="contact" bookmark={{ title: 'Contactos', ref: 'contact' }}>
      <View style={s.content}>
        <View>
          <Text style={s.kicker}>Fale connosco</Text>
          <Text style={s.title}>CONTACTAR A{'\n'}ANDRADINOX</Text>

          <View style={s.row}>
            <View style={s.colInfo}>
              <View style={s.infoBlock}>
                <Text style={s.infoLabel}>Morada</Text>
                <Text style={s.infoValue}>{COMPANY.address}</Text>
              </View>
              <View style={s.infoBlock}>
                <Text style={s.infoLabel}>Telefone</Text>
                <Link src={`tel:${COMPANY.phone.replace(/[^+\d]/g, '')}`} style={s.infoLink}>{COMPANY.phone}</Link>
              </View>
              <View style={s.infoBlock}>
                <Text style={s.infoLabel}>Telemóvel</Text>
                <Link src={`tel:${COMPANY.mobile.replace(/[^+\d]/g, '')}`} style={s.infoLink}>{COMPANY.mobile}</Link>
              </View>
              <View style={s.infoBlock}>
                <Text style={s.infoLabel}>Email</Text>
                <Link src={`mailto:${COMPANY.email}`} style={s.infoLink}>{COMPANY.email}</Link>
              </View>
              <View style={s.infoBlock}>
                <Text style={s.infoLabel}>Website</Text>
                <Link src={COMPANY.websiteUrl} style={s.infoLink}>{COMPANY.website}</Link>
              </View>
            </View>

            <View style={s.colQr}>
              <View style={s.qrCard}>
                <QRSvg qr={websiteQr} size={70} />
                <Text style={s.qrCaption}>Visitar o website</Text>
              </View>
              <View style={s.qrCard}>
                <QRSvg qr={contactQr} size={70} />
                <Text style={s.qrCaption}>Página de contactos</Text>
              </View>
            </View>
          </View>
        </View>

        <View>
          <View style={s.footerRule} />
          <View style={s.footerRow}>
            <Text style={s.footerText}>{COMPANY.legalName}</Text>
            <Text style={s.footerText}>Catálogo de Produtos — {CATALOGUE_EDITION}</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}
