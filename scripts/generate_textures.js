import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Helper to compute CRC32 for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(typeAndData), 8 + len);
  return buf;
}

function encodePNG16x16(rgbaPixels) {
  const width = 16;
  const height = 16;

  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const scanlineSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineSize;
    rawData[rowOffset] = 0; // Filter 0 (None)
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = rowOffset + 1 + x * 4;
      rawData[dstIdx] = rgbaPixels[srcIdx];
      rawData[dstIdx + 1] = rgbaPixels[srcIdx + 1];
      rawData[dstIdx + 2] = rgbaPixels[srcIdx + 2];
      rawData[dstIdx + 3] = rgbaPixels[srcIdx + 3];
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressedData);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Pseudo-random deterministic generator based on seed string
function createPRNG(seedStr) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let s = Math.abs(hash) || 123456789;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function parseHex(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 6) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
      255
    ];
  }
  if (hex.length === 8) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
      parseInt(hex.slice(6, 8), 16)
    ];
  }
  return [0, 0, 0, 255];
}

// Generator functions for pixel art textures
const generators = {
  dirt: () => {
    const rng = createPRNG('dirt');
    const pixels = new Uint8Array(16 * 16 * 4);
    const palette = ['#866043', '#775237', '#6b482f', '#966d4f', '#5e3f28'];
    for (let i = 0; i < 256; i++) {
      const col = parseHex(palette[Math.floor(rng() * palette.length)]);
      pixels.set(col, i * 4);
    }
    return pixels;
  },

  grass_top: () => {
    const rng = createPRNG('grass_top');
    const pixels = new Uint8Array(16 * 16 * 4);
    const palette = ['#59c738', '#4cb32d', '#3ea122', '#68d446', '#348e1b'];
    for (let i = 0; i < 256; i++) {
      const col = parseHex(palette[Math.floor(rng() * palette.length)]);
      pixels.set(col, i * 4);
    }
    return pixels;
  },

  grass_side: () => {
    const rng = createPRNG('grass_side');
    const pixels = new Uint8Array(16 * 16 * 4);
    const dirtPalette = ['#866043', '#775237', '#6b482f', '#966d4f'];
    const grassPalette = ['#59c738', '#4cb32d', '#3ea122', '#68d446'];

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        // Grass overhang logic
        const grassDepth = 3 + Math.floor(Math.sin(x * 0.8 + rng() * 0.5) * 1.5);
        let colHex;
        if (y < grassDepth) {
          colHex = grassPalette[Math.floor(rng() * grassPalette.length)];
        } else {
          colHex = dirtPalette[Math.floor(rng() * dirtPalette.length)];
        }
        pixels.set(parseHex(colHex), i * 4);
      }
    }
    return pixels;
  },

  stone: () => {
    const rng = createPRNG('stone');
    const pixels = new Uint8Array(16 * 16 * 4);
    const palette = ['#83888c', '#757a7e', '#676b6f', '#93989c', '#595d61', '#4d5154'];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        // Add subtle diagonal fractures
        const isFracture = (x + y * 2) % 7 === 0 || (x * 3 + y) % 11 === 0;
        const colHex = isFracture
          ? palette[4 + Math.floor(rng() * 2)]
          : palette[Math.floor(rng() * 4)];
        pixels.set(parseHex(colHex), i * 4);
      }
    }
    return pixels;
  },

  sand: () => {
    const rng = createPRNG('sand');
    const pixels = new Uint8Array(16 * 16 * 4);
    const palette = ['#dbc68c', '#cfb97e', '#e5d197', '#c2ad72', '#edd99f'];
    for (let i = 0; i < 256; i++) {
      const col = parseHex(palette[Math.floor(rng() * palette.length)]);
      pixels.set(col, i * 4);
    }
    return pixels;
  },

  wood_log: () => {
    const rng = createPRNG('wood_log');
    const pixels = new Uint8Array(16 * 16 * 4);
    const barkDark = '#48331e';
    const barkMed = '#614529';
    const barkLight = '#7b5936';

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        const stripe = (x + Math.floor(rng() * 0.4)) % 4;
        let hex = barkMed;
        if (stripe === 0) hex = barkDark;
        else if (stripe === 2) hex = barkLight;
        pixels.set(parseHex(hex), i * 4);
      }
    }
    return pixels;
  },

  wood_log_top: () => {
    const pixels = new Uint8Array(16 * 16 * 4);
    const bark = parseHex('#48331e');
    const woodLight = parseHex('#c2a072');
    const woodMed = parseHex('#a8875a');
    const woodDark = parseHex('#8a6b42');

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        const dist = Math.sqrt((x - 7.5) ** 2 + (y - 7.5) ** 2);
        let col = woodLight;
        if (dist >= 7.0) col = bark;
        else if (dist >= 5.0 && dist < 6.0) col = woodDark;
        else if (dist >= 2.5 && dist < 3.5) col = woodMed;
        pixels.set(col, i * 4);
      }
    }
    return pixels;
  },

  leaves: () => {
    const rng = createPRNG('leaves');
    const pixels = new Uint8Array(16 * 16 * 4);
    const colors = ['#295e19', '#387a22', '#4b9930', '#1c4510', '#5db03c'];

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        // 15% transparent holes for leafy texture
        if (rng() < 0.15) {
          pixels.set([0, 0, 0, 0], i * 4);
        } else {
          const col = parseHex(colors[Math.floor(rng() * colors.length)]);
          pixels.set(col, i * 4);
        }
      }
    }
    return pixels;
  },

  water: () => {
    const rng = createPRNG('water');
    const pixels = new Uint8Array(16 * 16 * 4);
    const colors = ['#3385ffcc', '#2673eccc', '#4d94ffcc', '#1f66d6cc'];

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        const isWave = (x + y) % 4 === 0;
        const colHex = isWave ? '#5ca0ffcc' : colors[Math.floor(rng() * colors.length)];
        pixels.set(parseHex(colHex), i * 4);
      }
    }
    return pixels;
  },

  plank: () => {
    const rng = createPRNG('plank');
    const pixels = new Uint8Array(16 * 16 * 4);
    const woodBase = ['#b88a53', '#ab7e48', '#c4965e', '#a1743f'];
    const lineCol = parseHex('#664825');
    const nailCol = parseHex('#3d2b16');

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        if (y % 4 === 3) {
          pixels.set(lineCol, i * 4);
        } else if ((x === 1 || x === 14) && (y % 4 === 1)) {
          pixels.set(nailCol, i * 4);
        } else {
          const col = parseHex(woodBase[Math.floor(rng() * woodBase.length)]);
          pixels.set(col, i * 4);
        }
      }
    }
    return pixels;
  },

  crafting_table_top: () => {
    const pixels = new Uint8Array(16 * 16 * 4);
    const border = parseHex('#664121');
    const gridLine = parseHex('#472b14');
    const innerWood = parseHex('#c2945d');

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        if (x === 0 || x === 15 || y === 0 || y === 15) {
          pixels.set(border, i * 4);
        } else if (x === 5 || x === 10 || y === 5 || y === 10) {
          pixels.set(gridLine, i * 4);
        } else {
          pixels.set(innerWood, i * 4);
        }
      }
    }
    return pixels;
  },

  crafting_table_side: () => {
    const pixels = new Uint8Array(16 * 16 * 4);
    const plankBg = parseHex('#ab7e48');
    const border = parseHex('#664121');
    const toolSteel = parseHex('#b5c4d0');
    const toolHandle = parseHex('#6e4522');

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        let col = plankBg;
        if (x === 0 || x === 15 || y === 0 || y === 15) col = border;
        // Draw Saw silhouette on left
        else if (x >= 3 && x <= 5 && y >= 4 && y <= 11) col = toolSteel;
        else if (x === 4 && y >= 12 && y <= 13) col = toolHandle;
        // Draw Hammer on right
        else if (x >= 10 && x <= 13 && y >= 5 && y <= 6) col = toolSteel;
        else if (x === 11 && y >= 7 && y <= 12) col = toolHandle;

        pixels.set(col, i * 4);
      }
    }
    return pixels;
  },

  sandstone: () => {
    const rng = createPRNG('sandstone');
    const pixels = new Uint8Array(16 * 16 * 4);
    const layerColors = ['#e5d3a1', '#d6be85', '#c4aa6c', '#b59a5c'];

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        const layerIdx = Math.floor((y + rng() * 0.5) / 4) % layerColors.length;
        pixels.set(parseHex(layerColors[layerIdx]), i * 4);
      }
    }
    return pixels;
  },

  torch: () => {
    const pixels = new Uint8Array(16 * 16 * 4);
    const wood = parseHex('#6b4d2f');
    const flameCore = parseHex('#ffffff');
    const flameYellow = parseHex('#ffea00');
    const flameOrange = parseHex('#ff7700');

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        let col = [0, 0, 0, 0]; // Transparent background
        if (x >= 7 && x <= 8 && y >= 6 && y <= 15) {
          col = wood;
        } else if (x >= 7 && x <= 8 && y >= 3 && y <= 4) {
          col = flameCore;
        } else if (x >= 6 && x <= 9 && y >= 2 && y <= 5) {
          col = flameYellow;
        } else if (x >= 5 && x <= 10 && y >= 1 && y <= 5) {
          col = flameOrange;
        }
        pixels.set(col, i * 4);
      }
    }
    return pixels;
  },

  chest: () => {
    const pixels = new Uint8Array(16 * 16 * 4);
    const wood = parseHex('#8c572b');
    const ironBorder = parseHex('#4d3826');
    const silverLatch = parseHex('#e6e6e6');
    const darkLatch = parseHex('#333333');

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        let col = wood;
        if (x === 0 || x === 15 || y === 0 || y === 15 || y === 7) {
          col = ironBorder;
        } else if (x >= 7 && x <= 8 && y >= 6 && y <= 8) {
          col = silverLatch;
        } else if (x >= 7 && x <= 8 && y === 9) {
          col = darkLatch;
        }
        pixels.set(col, i * 4);
      }
    }
    return pixels;
  },

  farmland: () => {
    const rng = createPRNG('farmland');
    const pixels = new Uint8Array(16 * 16 * 4);
    const dampSoil = ['#422b17', '#332010', '#4f351e', '#29180a'];

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        const isFurrow = y % 2 === 0;
        const colHex = isFurrow ? '#26170a' : dampSoil[Math.floor(rng() * dampSoil.length)];
        pixels.set(parseHex(colHex), i * 4);
      }
    }
    return pixels;
  },

  wheat_crop: () => {
    const pixels = new Uint8Array(16 * 16 * 4);
    const stemGreen = parseHex('#7ca832');
    const wheatGold = parseHex('#e0b838');

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        let col = [0, 0, 0, 0];
        if ((x === 4 || x === 8 || x === 12) && y >= 6 && y <= 15) {
          col = stemGreen;
        } else if ((x >= 3 && x <= 5) || (x >= 7 && x <= 9) || (x >= 11 && x <= 13)) {
          if (y >= 2 && y <= 6) col = wheatGold;
        }
        pixels.set(col, i * 4);
      }
    }
    return pixels;
  },

  air: () => {
    return new Uint8Array(16 * 16 * 4);
  },

  coal_ore: () => {
    const rng = createPRNG('coal_ore');
    const pixels = new Uint8Array(16 * 16 * 4);
    const stonePalette = ['#83888c', '#757a7e', '#676b6f', '#93989c', '#595d61', '#4d5154'];
    const coalPalette = ['#1c1c1c', '#2d2d2d', '#111111', '#383838'];

    const isCoalSpot = (x, y) => {
      const spotMap = [
        [3, 3], [4, 3], [3, 4], [4, 4],
        [9, 2], [10, 2], [10, 3],
        [12, 7], [13, 7], [12, 8], [13, 8],
        [5, 11], [6, 11], [6, 12],
        [2, 12], [2, 13]
      ];
      return spotMap.some(([sx, sy]) => sx === x && sy === y);
    };

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        let colHex;
        if (isCoalSpot(x, y)) {
          colHex = coalPalette[Math.floor(rng() * coalPalette.length)];
        } else {
          const isFracture = (x + y * 2) % 7 === 0 || (x * 3 + y) % 11 === 0;
          colHex = isFracture
            ? stonePalette[4 + Math.floor(rng() * 2)]
            : stonePalette[Math.floor(rng() * 4)];
        }
        pixels.set(parseHex(colHex), i * 4);
      }
    }
    return pixels;
  },

  iron_ore: () => {
    const rng = createPRNG('iron_ore');
    const pixels = new Uint8Array(16 * 16 * 4);
    const stonePalette = ['#83888c', '#757a7e', '#676b6f', '#93989c', '#595d61', '#4d5154'];
    const ironPalette = ['#d8af97', '#b88267', '#8c593f', '#e5c2b0', '#a06a50'];

    const isIronSpot = (x, y) => {
      const spotMap = [
        [2, 3], [3, 3], [3, 4],
        [8, 4], [9, 4], [8, 5], [9, 5],
        [13, 2], [13, 3], [14, 3],
        [5, 10], [6, 10], [6, 11],
        [11, 11], [11, 12], [12, 12]
      ];
      return spotMap.some(([sx, sy]) => sx === x && sy === y);
    };

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        let colHex;
        if (isIronSpot(x, y)) {
          colHex = ironPalette[Math.floor(rng() * ironPalette.length)];
        } else {
          const isFracture = (x + y * 2) % 7 === 0 || (x * 3 + y) % 11 === 0;
          colHex = isFracture
            ? stonePalette[4 + Math.floor(rng() * 2)]
            : stonePalette[Math.floor(rng() * 4)];
        }
        pixels.set(parseHex(colHex), i * 4);
      }
    }
    return pixels;
  },

  spike_trap: () => {
    const pixels = new Uint8Array(16 * 16 * 4);
    const baseDark = parseHex('#263238');
    const baseMid = parseHex('#37474f');
    const baseLight = parseHex('#546e7a');
    const rivet = parseHex('#90a4ae');

    const spikeTip = parseHex('#ffffff');
    const spikeHighlight = parseHex('#eceff1');
    const spikeMid = parseHex('#b0bec5');
    const spikeDark = parseHex('#607d8b');
    const spikeShadow = parseHex('#455a64');

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        let col = [0, 0, 0, 0];

        // Base plate at bottom (y: 13 to 15)
        if (y >= 13 && y <= 15) {
          if (y === 13) {
            col = (x === 0 || x === 15) ? rivet : baseLight;
          } else if (y === 14) {
            col = (x === 1 || x === 14) ? rivet : baseMid;
          } else {
            col = baseDark;
          }
        }
        // Spike 1 (Left): base x: 1..3, tip at x=2, y=4
        else if (x >= 1 && x <= 3) {
          if (y === 4 && x === 2) col = spikeTip;
          else if (y === 5 && x === 2) col = spikeHighlight;
          else if (y >= 6 && y <= 8 && x === 2) col = spikeHighlight;
          else if (y >= 8 && y <= 12) {
            col = (x === 1) ? spikeShadow : (x === 2 ? spikeMid : spikeDark);
          }
        }
        // Spike 2 (Center-Left tall): base x: 5..7, tip at x=6, y=1
        else if (x >= 5 && x <= 7) {
          if (y === 1 && x === 6) col = spikeTip;
          else if (y >= 2 && y <= 4 && x === 6) col = spikeHighlight;
          else if (y >= 5 && y <= 12) {
            col = (x === 5) ? spikeShadow : (x === 6 ? spikeHighlight : spikeMid);
          }
        }
        // Spike 3 (Center-Right tall): base x: 8..10, tip at x=9, y=1
        else if (x >= 8 && x <= 10) {
          if (y === 1 && x === 9) col = spikeTip;
          else if (y >= 2 && y <= 4 && x === 9) col = spikeHighlight;
          else if (y >= 5 && y <= 12) {
            col = (x === 8) ? spikeHighlight : (x === 9 ? spikeMid : spikeDark);
          }
        }
        // Spike 4 (Right): base x: 12..14, tip at x=13, y=4
        else if (x >= 12 && x <= 14) {
          if (y === 4 && x === 13) col = spikeTip;
          else if (y === 5 && x === 13) col = spikeHighlight;
          else if (y >= 6 && y <= 8 && x === 13) col = spikeHighlight;
          else if (y >= 8 && y <= 12) {
            col = (x === 12) ? spikeMid : (x === 13 ? spikeDark : spikeShadow);
          }
        }

        pixels.set(col, i * 4);
      }
    }
    return pixels;
  }
};

const outputDir = path.resolve(process.cwd(), 'public/textures/blocks');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let generatedCount = 0;
for (const [name, gen] of Object.entries(generators)) {
  const pixels = gen();
  const pngBuf = encodePNG16x16(pixels);
  const filePath = path.join(outputDir, `${name}.png`);
  fs.writeFileSync(filePath, pngBuf);
  console.log(`Generated texture: ${name}.png (${pngBuf.length} bytes)`);
  generatedCount++;
}

console.log(`Successfully generated ${generatedCount} block textures in pixel-art style!`);
