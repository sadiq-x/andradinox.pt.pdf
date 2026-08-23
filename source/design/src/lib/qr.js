import QRCode from 'qrcode';

// Generates the raw path data + viewBox for a QR code so it can be embedded
// as true vector paths (Svg/Path) in the PDF rather than a rasterised image.
export async function qrVector(text, { margin = 1 } = {}) {
  const svg = await QRCode.toString(text, { type: 'svg', margin, errorCorrectionLevel: 'M' });
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  const bgPathMatch = svg.match(/<path fill="([^"]+)" d="([^"]+)"\/>/);
  const fgPathMatch = svg.match(/<path stroke="([^"]+)" d="([^"]+)"\/>/);
  if (!viewBoxMatch || !fgPathMatch) {
    throw new Error(`Could not parse QR SVG output for "${text}"`);
  }
  const [, , , vw, vh] = [0, 0, 0, ...viewBoxMatch[1].split(' ').slice(2)];
  return {
    viewBox: viewBoxMatch[1],
    size: Number(vw),
    bg: bgPathMatch ? { fill: bgPathMatch[1], d: bgPathMatch[2] } : null,
    fg: { stroke: fgPathMatch[1], d: fgPathMatch[2] },
  };
}
