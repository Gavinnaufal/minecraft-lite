// Generate 16x16 placeholder PNG textures (with per-face support)
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const W = 16;
const H = 16;
const outDir = path.join(__dirname, '..', 'public', 'textures', 'blocks');
fs.mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c;
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  c = -1;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeB, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([len, typeB, data, crcBuf]);
}

function createSolidTexture(r, g, b) {
  const rawRows = [];
  for (let y = 0; y < H; y++) {
    const row = Buffer.alloc(1 + W * 3);
    row[0] = 0;
    for (let x = 0; x < W; x++) {
      const off = 1 + x * 3;
      row[off] = r;
      row[off + 1] = g;
      row[off + 2] = b;
    }
    rawRows.push(row);
  }
  return Buffer.concat(rawRows);
}

function createBandTexture(r1, g1, b1, r2, g2, b2, bandHeight) {
  const rawRows = [];
  for (let y = 0; y < H; y++) {
    const row = Buffer.alloc(1 + W * 3);
    row[0] = 0;
    const [r, g, b] = y < bandHeight ? [r1, g1, b1] : [r2, g2, b2];
    for (let x = 0; x < W; x++) {
      const off = 1 + x * 3;
      row[off] = r;
      row[off + 1] = g;
      row[off + 2] = b;
    }
    rawRows.push(row);
  }
  return Buffer.concat(rawRows);
}

function writePNG(name, raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = zlib.deflateSync(raw);

  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  const outPath = path.join(outDir, `${name}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Created ${name}.png (${png.length} bytes)`);
}

// Solid block textures
writePNG('air', createSolidTexture(0, 0, 0));
writePNG('grass', createSolidTexture(76, 175, 80));
writePNG('dirt', createSolidTexture(139, 94, 60));
writePNG('stone', createSolidTexture(128, 128, 128));
writePNG('sand', createSolidTexture(244, 228, 160));
writePNG('wood_log', createSolidTexture(120, 90, 55));
writePNG('wood_log_top', createSolidTexture(140, 110, 70));
writePNG('leaves', createSolidTexture(34, 139, 34));
writePNG('water', createSolidTexture(51, 153, 255));

// Per-face grass textures
writePNG('grass_top', createSolidTexture(96, 195, 60));     // brighter green
writePNG('grass_side', createBandTexture(96, 195, 60, 139, 94, 60, 4));  // green top, dirt bottom
