/**
 * Re-encode WAV (and other audio) files in public/sounds/ to web-safe format.
 * Browsers typically only support 8-bit and 16-bit PCM WAV; 24-bit and other
 * codecs may load but fail to play. This script converts to 16-bit PCM, 44.1kHz,
 * stereo so playback works in all browsers.
 *
 * Requires: ffmpeg on PATH (install via devcontainer or system).
 * Run from project root: node scripts/reencode-sounds-for-web.js
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const soundsDir = path.join(__dirname, '..', 'public', 'sounds');

const WEB_WAV_ARGS = [
  '-y',           // overwrite
  '-i', null,     // input (set per file)
  '-acodec', 'pcm_s16le',
  '-ar', '44100',
  '-ac', '2',     // stereo
  null,           // output (set per file)
];

function checkFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'pipe' });
  } catch (e) {
    console.error('This script requires ffmpeg. Install it (e.g. apt-get install ffmpeg in the devcontainer) and try again.');
    process.exit(1);
  }
}

function reencodeFile(inputPath) {
  const base = path.basename(inputPath);
  const ext = path.extname(base);
  const outName = base.slice(0, -ext.length) + '.wav';
  const outPath = path.join(soundsDir, '.reencode-' + outName);

  const args = [...WEB_WAV_ARGS];
  args[2] = inputPath;
  args[args.length - 1] = outPath;

  execFileSync('ffmpeg', args, { stdio: 'pipe' });
  fs.renameSync(outPath, path.join(soundsDir, outName));
  console.log('Re-encoded:', base, '->', outName);
}

function main() {
  if (!fs.existsSync(soundsDir)) {
    console.error('Sounds directory not found:', soundsDir);
    process.exit(1);
  }

  checkFfmpeg();

  const entries = fs.readdirSync(soundsDir, { withFileTypes: true });
  const audioFiles = entries
    .filter((e) => e.isFile() && !e.name.startsWith('.reencode') && /\.(wav|mp3|ogg|m4a|flac)$/i.test(e.name))
    .map((e) => path.join(soundsDir, e.name));

  if (audioFiles.length === 0) {
    console.log('No audio files found in', soundsDir);
    return;
  }

  for (const inputPath of audioFiles) {
    reencodeFile(inputPath);
  }

  console.log('Done. All files are now 16-bit PCM WAV at 44.1kHz stereo.');
}

main();
