import React from 'react';
import { View, Text, Image, Link, Svg, Path, StyleSheet } from '@react-pdf/renderer';
import { color, type, space } from '../theme.js';

const s = StyleSheet.create({
  eyebrow: { ...type.eyebrow, textTransform: 'uppercase', marginBottom: 4 },
  h1: { ...type.h1 },
  h2: { ...type.h2 },
  h3: { ...type.h3 },
  ruleThin: { height: 0.75, backgroundColor: color.border, marginVertical: space.md },
  ruleAccent: { height: 2, width: 32, backgroundColor: color.accent, marginTop: 6, marginBottom: 12 },

  tag: {
    borderRadius: 2,
    paddingVertical: 3,
    paddingHorizontal: 7,
    backgroundColor: color.primaryTint,
    alignSelf: 'flex-start',
  },
  tagText: { fontFamily: 'Inter', fontSize: 7.5, fontWeight: 600, color: color.primary, letterSpacing: 0.4 },

  appGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  appItem: { width: '50%', flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5, paddingRight: 8 },
  appDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: color.accent, marginTop: 4.5, marginRight: 6 },
  appText: { ...type.body, fontSize: 9 },

  specRail: { borderLeft: `2pt solid ${color.border}`, paddingLeft: 10 },
  specRow: { marginBottom: 7 },
  specLabel: { ...type.techLabel, textTransform: 'uppercase' },
  specValue: { ...type.techValue, marginTop: 1.5 },

  qrWrap: { alignItems: 'center' },
  qrCaption: { ...type.caption, marginTop: 5, textAlign: 'center' },

  ctaBox: {
    borderRadius: 2,
    border: `1pt solid ${color.accent}`,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  ctaText: { ...type.cta },
});

export function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <View>
      {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
      <Text style={s.h1}>{title}</Text>
      <View style={s.ruleAccent} />
      {subtitle ? <Text style={type.body}>{subtitle}</Text> : null}
    </View>
  );
}

export function Rule() {
  return <View style={s.ruleThin} />;
}

export function Tag({ children }) {
  return (
    <View style={s.tag}>
      <Text style={s.tagText}>{children}</Text>
    </View>
  );
}

export function ApplicationsList({ items }) {
  if (!items?.length) return null;
  return (
    <View>
      <Text style={type.h3}>APLICAÇÕES</Text>
      <View style={s.appGrid}>
        {items.map((it, i) => (
          <View key={i} style={s.appItem}>
            <View style={s.appDot} />
            <Text style={s.appText}>{it}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function SpecRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={s.specRow}>
      <Text style={s.specLabel}>{label}</Text>
      <Text style={s.specValue}>{value}</Text>
    </View>
  );
}

export function SpecRail({ children }) {
  return <View style={s.specRail}>{children}</View>;
}

// `qr` is a pre-resolved vector object from lib/qr.js's qrVector() — resolved
// ahead of render time (top-level await in the build script) since react-pdf's
// reconciler does not support async function components.
export function QRSvg({ qr, caption, size = 62 }) {
  if (!qr) return null;
  return (
    <View style={s.qrWrap}>
      <Svg width={size} height={size} viewBox={qr.viewBox}>
        {qr.bg ? <Path d={qr.bg.d} fill={qr.bg.fill} /> : null}
        <Path d={qr.fg.d} stroke={qr.fg.stroke} strokeWidth={1} />
      </Svg>
      {caption ? <Text style={s.qrCaption}>{caption}</Text> : null}
    </View>
  );
}

export function CTALink({ href, children }) {
  return (
    <Link src={href} style={s.ctaBox}>
      <Text style={s.ctaText}>{children} →</Text>
    </Link>
  );
}
