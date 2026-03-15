/**
 * Re-encode audio files in public/sounds/ into performant web-friendly formats.
 * Outputs OGG Vorbis (small, widely supported) and MP3 (Safari/legacy) for fast
 * loading and streaming. Use alongside or instead of reencode-sounds-for-web.js
 * (which produces 16-bit PCM WAV for maximum compatibility).
 *
 * Requires: ffmpeg on PATH.
 * Run from project root: node scripts/reencode-sounds-performant.js
 *
 * Options (env):
 *   SKIP_EXISTING=1  Skip encoding if .ogg/.mp3 already exist and are newer than source
 *   MONO=1           Downmix to mono (smaller files for single-channel sources)
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOUNDS_DIR = path.join(__dirname, '..', 'public', 'sounds');

const SKIP_EXISTING = process.env.SKIP_EXISTING === '1';
const MONO = process.env.MONO === '1';

// OGG Vorbis: quality 5 = ~160 kbps, good balance of size/quality
const VORBIS_QUALITY = 5;
// MP3: 128 kbps CBR for predictable size and wide support
const MP3_BITRATE = '128k';

// Source extensions (we produce .ogg and .mp3; in-place MP3 is written via temp file)
const SOURCE_EXT = /\.(wav|mp3|m4a|flac|aac)$/i;

function checkFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'pipe' });
  } catch (e) {
    console.error(
      'This script requires ffmpeg. Install it (e.g. apt-get install ffmpeg) and try again.'
    );
    process.exit(1);
  }
}

function getMtime(filePath) {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}

function safeOutputPath(inputPath, desiredPath) {
  if (path.resolve(inputPath) === path.resolve(desiredPath)) {
    return path.join(path.dirname(desiredPath), '.tmp-' + path.basename(desiredPath));
  }
  return desiredPath;
}

function encodeOgg(inputPath, outputPath) {
  const out = safeOutputPath(inputPath, outputPath);
  const args = [
    '-y',
    '-i',
    inputPath,
    '-c:a',
    'libvorbis',
    '-q:a',
    String(VORBIS_QUALITY),
    '-ar',
    '44100',
  ];
  if (MONO) args.push('-ac', '1');
  args.push(out);
  execFileSync('ffmpeg', args, { stdio: 'pipe' });
  if (out !== outputPath) fs.renameSync(out, outputPath);
}

function encodeMp3(inputPath, outputPath) {
  const out = safeOutputPath(inputPath, outputPath);
  const args = [
    '-y',
    '-i',
    inputPath,
    '-c:a',
    'libmp3lame',
    '-b:a',
    MP3_BITRATE,
    '-ar',
    '44100',
  ];
  if (MONO) args.push('-ac', '1');
  args.push(out);
  execFileSync('ffmpeg', args, { stdio: 'pipe' });
  if (out !== outputPath) fs.renameSync(out, outputPath);
}

function main() {
  if (!fs.existsSync(SOUNDS_DIR)) {
    console.error('Sounds directory not found:', SOUNDS_DIR);
    process.exit(1);
  }

  checkFfmpeg();

  const entries = fs.readdirSync(SOUNDS_DIR, { withFileTypes: true });
  const audioFiles = entries
    .filter(
      (e) =>
        e.isFile() &&
        !e.name.startsWith('.') &&
        SOURCE_EXT.test(e.name)
    )
    .map((e) => path.join(SOUNDS_DIR, e.name));

  if (audioFiles.length === 0) {
    console.log('No audio files found in', SOUNDS_DIR);
    return;
  }

  console.log(
    `Re-encoding ${audioFiles.length} file(s) to OGG Vorbis + MP3${MONO ? ' (mono)' : ''}...\n`
  );

  for (const inputPath of audioFiles) {
    const base = path.basename(inputPath);
    const baseName = path.basename(inputPath, path.extname(base));
    const oggPath = path.join(SOUNDS_DIR, `${baseName}.ogg`);
    const mp3Path = path.join(SOUNDS_DIR, `${baseName}.mp3`);
    const inputMtime = getMtime(inputPath);

    if (SKIP_EXISTING) {
      const oggOk = fs.existsSync(oggPath) && getMtime(oggPath) >= inputMtime;
      const mp3Ok = fs.existsSync(mp3Path) && getMtime(mp3Path) >= inputMtime;
      if (oggOk && mp3Ok) {
        console.log('Skip (up to date):', base);
        continue;
      }
    }

    try {
      if (!SKIP_EXISTING || !fs.existsSync(oggPath) || getMtime(oggPath) < inputMtime) {
        encodeOgg(inputPath, oggPath);
        console.log('OGG:', base, '->', path.basename(oggPath));
      }
      if (!SKIP_EXISTING || !fs.existsSync(mp3Path) || getMtime(mp3Path) < inputMtime) {
        encodeMp3(inputPath, mp3Path);
        console.log('MP3:', base, '->', path.basename(mp3Path));
      }
    } catch (e) {
      console.error('Error encoding', base, e.message || e);
    }
  }

  console.log('\nDone. Outputs: .ogg (Vorbis) and .mp3 in', SOUNDS_DIR);
}

main();
