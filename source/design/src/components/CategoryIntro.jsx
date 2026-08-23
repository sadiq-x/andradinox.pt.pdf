import React from 'react';
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { PageChrome, CHROME_PAD } from './Chrome.jsx';
import { SectionHeading, Tag, ApplicationsList } from './Bits.jsx';
import { color, type, space } from '../theme.js';

const s = StyleSheet.create({
  page: { padding: 0, ...CHROME_PAD },
  layout: { flexDirection: 'row', marginTop: 20, flexGrow: 1 },
  colText: { width: '46%', paddingRight: 22 },
  colPhoto: { width: '54%' },
  photoFrame: { border: `0.75pt solid ${color.border}`, borderRadius: 2, overflow: 'hidden', height: 320 },
  photo: { width: '100%', height: '100%', objectFit: 'cover' },
  photoCaption: { ...type.caption, marginTop: 6 },

  desc: { ...type.body, marginTop: 4, marginBottom: 18 },
  blockTitle: { ...type.h3, marginBottom: 8, marginTop: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  tagSpacing: { marginRight: 6, marginBottom: 6 },

  familyList: { marginTop: 4 },
  familyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderBottom: `0.5pt solid ${color.border}` },
  familyIndex: { width: 16, fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: color.accent },
  familyName: { flex: 1, fontFamily: 'Inter', fontSize: 9, fontWeight: 500, color: color.ink },
});

export function CategoryIntro({ id, bookmark, index, name, description, materials, applications, families, photo, photoCaption }) {
  return (
    <Page size="A4" style={s.page}>
      <PageChrome id={id} bookmark={bookmark} section={name}>
        <SectionHeading eyebrow={`Categoria ${String(index).padStart(2, '0')}`} title={name.toUpperCase()} />
        <View style={s.layout}>
          <View style={s.colText}>
            {description ? (
              <Text style={s.desc}>{description}</Text>
            ) : (
              <Text style={[s.desc, { color: color.faint }]}>
                Descrição da categoria a confirmar com a Andradinox.
              </Text>
            )}

            {materials?.length ? (
              <View>
                <Text style={s.blockTitle}>MATERIAIS DISPONÍVEIS</Text>
                <View style={s.tagRow}>
                  {materials.map((m) => (
                    <View key={m} style={s.tagSpacing}>
                      <Tag>{m}</Tag>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {applications?.length ? <ApplicationsList items={applications} /> : null}
          </View>

          <View style={s.colPhoto}>
            <View style={s.photoFrame}>
              {photo ? <Image src={photo} style={s.photo} /> : null}
            </View>
            {photoCaption ? <Text style={s.photoCaption}>{photoCaption}</Text> : null}

            <View style={s.familyList}>
              <Text style={[s.blockTitle, { marginTop: 18 }]}>PRODUTOS NESTA CATEGORIA</Text>
              {families.map((f, i) => (
                <View key={f} style={s.familyRow}>
                  <Text style={s.familyIndex}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={s.familyName}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </PageChrome>
    </Page>
  );
}
