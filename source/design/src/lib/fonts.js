import { Font } from '@react-pdf/renderer';
import path from 'node:path';

// See data.js for why this is process.cwd()-relative rather than import.meta.url-relative.
const FONT_DIR = path.join(process.cwd(), 'assets/fonts');

let registered = false;

export function registerFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: 'Inter',
    fonts: [
      { src: path.join(FONT_DIR, 'Inter-Light.ttf'), fontWeight: 300 },
      { src: path.join(FONT_DIR, 'Inter-Regular.ttf'), fontWeight: 400 },
      { src: path.join(FONT_DIR, 'Inter-Medium.ttf'), fontWeight: 500 },
      { src: path.join(FONT_DIR, 'Inter-SemiBold.ttf'), fontWeight: 600 },
      { src: path.join(FONT_DIR, 'Inter-Bold.ttf'), fontWeight: 700 },
    ],
  });

  // Prevent react-pdf's default naive hyphenation from breaking Portuguese words mid-syllable.
  Font.registerHyphenationCallback((word) => [word]);
}
