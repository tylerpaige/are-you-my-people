/**
 * Generate minimal valid WAV files (short silence) for public/sounds/.
 * Run from project root: node scripts/generate-placeholder-wav.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const soundsDir = path.join(__dirname, '..', 'public', 'sounds');

const sampleRate = 8000;
const durationSec = 0.1;
const numChannels = 1;
const bitsPerSample = 16;
const numSamples = Math.floor(sampleRate * durationSec * numChannels);
const dataSize = numSamples * (bitsPerSample / 8);
const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
const blockAlign = numChannels * (bitsPerSample / 8);
const riffSize = 36 + dataSize;

const header = Buffer.alloc(44);
let offset = 0;
header.write('RIFF', offset); offset += 4;
header.writeUInt32LE(riffSize, offset); offset += 4;
header.write('WAVE', offset); offset += 4;
header.write('fmt ', offset); offset += 4;
header.writeUInt32LE(16, offset); offset += 4;
header.writeUInt16LE(1, offset); offset += 2;  // PCM
header.writeUInt16LE(numChannels, offset); offset += 2;
header.writeUInt32LE(sampleRate, offset); offset += 4;
header.writeUInt32LE(byteRate, offset); offset += 4;
header.writeUInt16LE(blockAlign, offset); offset += 2;
header.writeUInt16LE(bitsPerSample, offset); offset += 2;
header.write('data', offset); offset += 4;
header.writeUInt32LE(dataSize, offset);

const data = Buffer.alloc(dataSize, 0);
const wav = Buffer.concat([header, data]);

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
const files = [
  ...letters.map((c) => `${c}.wav`),
  'space.wav',
  'circus.wav', // used by Key C in KEY_CONFIG
];

files.forEach((name) => {
  fs.writeFileSync(path.join(soundsDir, name), wav);
});
console.log(`Wrote ${files.length} placeholder WAVs to public/sounds/`);
