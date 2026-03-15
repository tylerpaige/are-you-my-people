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
  '-y', // overwrite
  '-i',
  null, // input (set per file)
  '-acodec',
  'pcm_s16le',
  '-ar',
  '44100',
  '-ac',
  '2', // stereo
  null, // output (set per file)
];

const TARGET_CODEC = 'pcm_s16le';
const TARGET_SAMPLE_RATE = 44100;
const TARGET_CHANNELS = 2;

function checkFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'pipe' });
  } catch (e) {
    console.error(
      'This script requires ffmpeg. Install it (e.g. apt-get install ffmpeg in the devcontainer) and try again.'
    );
    process.exit(1);
  }
}

/**
 * Returns true if the file is already in web-safe format: 16-bit PCM, 44.1kHz, stereo.
 * Uses ffprobe to inspect the first audio stream without decoding.
 */
function needsReencode(inputPath) {
  try {
    const out = execFileSync(
      'ffprobe',
      [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_streams',
        '-select_streams',
        'a:0',
        inputPath,
      ],
      { encoding: 'utf-8', maxBuffer: 1024 * 1024 }
    );
    const data = JSON.parse(out);
    const stream = data?.streams?.[0];
    if (!stream) return true;

    const codec = (stream.codec_name || '').toLowerCase();
    const sampleRate = parseInt(stream.sample_rate, 10) || 0;
    const channels = parseInt(stream.channels, 10) || 0;

    const alreadyWebSafe =
      codec === TARGET_CODEC &&
      sampleRate === TARGET_SAMPLE_RATE &&
      channels === TARGET_CHANNELS;

    return !alreadyWebSafe;
  } catch (e) {
    return true;
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
    .filter(
      (e) =>
        e.isFile() &&
        !e.name.startsWith('.reencode') &&
        /\.(wav|mp3|ogg|m4a|flac)$/i.test(e.name)
    )
    .map((e) => path.join(soundsDir, e.name));

  if (audioFiles.length === 0) {
    console.log('No audio files found in', soundsDir);
    return;
  }

  for (const inputPath of audioFiles) {
    if (!needsReencode(inputPath)) {
      console.log('Skip (already web-safe):', path.basename(inputPath));
      continue;
    }
    reencodeFile(inputPath);
  }

  console.log(
    'Done. Only files that needed it were re-encoded to 16-bit PCM WAV at 44.1kHz stereo.'
  );
}

main();
