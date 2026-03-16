/**
 * Normalize volume for all audio files in public/sounds/.
 * Applies a single gain per file so the peak level matches the target (whole-clip
 * only; no per-segment or dynamic adjustment).
 *
 * Requires: ffmpeg on PATH.
 * Run from project root: node scripts/normalize-sounds.js
 *
 * Options (env):
 *   TARGET_PEAK_DB  Target peak in dB (default: -1)
 *   MAX_GAIN_DB     Maximum gain to apply (default: 20), to avoid boosting noise
 *   DRY_RUN=1       Print gains only, do not write files
 */

import { execFileSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOUNDS_DIR = path.join(__dirname, '..', 'public', 'sounds');

const TARGET_PEAK_DB = parseFloat(process.env.TARGET_PEAK_DB || '-1', 10);
const MAX_GAIN_DB = parseFloat(process.env.MAX_GAIN_DB || '20', 10);
const DRY_RUN = process.env.DRY_RUN === '1';

const AUDIO_EXT = /\.(wav|mp3|ogg|m4a|flac)$/i;

// Re-encode settings per extension (for when we apply the volume filter)
const ENCODE_MAP = {
  '.ogg': { codec: 'libvorbis', opts: ['-q:a', '5'], ext: '.ogg' },
  '.mp3': { codec: 'libmp3lame', opts: ['-b:a', '128k'], ext: '.mp3' },
  '.wav': { codec: 'pcm_s16le', opts: ['-ar', '44100', '-ac', '2'], ext: '.wav' },
  '.m4a': { codec: 'aac', opts: ['-b:a', '128k'], ext: '.m4a' },
  '.flac': { codec: 'flac', opts: [], ext: '.flac' },
};

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

/**
 * Run volumedetect on the file and parse max_volume (dB) from stderr.
 * Returns a number or -Infinity if silence / parse failure.
 */
function getMaxVolumeDb(inputPath) {
  const result = spawnSync(
    'ffmpeg',
    [
      '-i',
      inputPath,
      '-filter:a',
      'volumedetect',
      '-f',
      'null',
      '-',
    ],
    { encoding: 'utf-8', maxBuffer: 2 * 1024 * 1024 }
  );

  const stderr = result.stderr || '';
  // volumedetect prints e.g. "[Parsed_volumedetect_0 @ 0x...] max_volume: -12.3 dB"
  const m = stderr.match(/max_volume:\s*(-?[\d.]+)\s*dB/);
  if (!m) return -Infinity;
  return parseFloat(m[1], 10);
}

/**
 * Apply a single gain to the whole file and write to outputPath.
 * Uses temp file if outputPath === inputPath.
 */
function applyVolume(inputPath, gainDb, outputPath) {
  const encode = ENCODE_MAP[path.extname(inputPath).toLowerCase()];
  const outPath =
    path.resolve(inputPath) === path.resolve(outputPath)
      ? path.join(path.dirname(outputPath), '.tmp-' + path.basename(outputPath))
      : outputPath;

  const args = [
    '-y',
    '-i',
    inputPath,
    '-filter:a',
    `volume=${gainDb}dB`,
    '-c:a',
    encode.codec,
    ...encode.opts,
    outPath,
  ];
  execFileSync('ffmpeg', args, { stdio: 'pipe' });

  if (outPath !== outputPath) {
    fs.renameSync(outPath, outputPath);
  }
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
        AUDIO_EXT.test(e.name)
    )
    .map((e) => path.join(SOUNDS_DIR, e.name));

  if (audioFiles.length === 0) {
    console.log('No audio files found in', SOUNDS_DIR);
    return;
  }

  console.log(
    `Normalizing volume for ${audioFiles.length} file(s) (target peak: ${TARGET_PEAK_DB} dB, max gain: ${MAX_GAIN_DB} dB)${DRY_RUN ? ' [DRY RUN]' : ''}\n`
  );

  for (const inputPath of audioFiles) {
    const base = path.basename(inputPath);
    const ext = path.extname(base).toLowerCase();
    if (!ENCODE_MAP[ext]) {
      console.log('Skip (unsupported format):', base);
      continue;
    }

    let maxDb;
    try {
      maxDb = getMaxVolumeDb(inputPath);
    } catch (e) {
      console.error('Error probing', base, e.message || e);
      continue;
    }

    if (!Number.isFinite(maxDb) || maxDb <= -99) {
      console.log('Skip (silence or unreadable):', base);
      continue;
    }

    let gainDb = TARGET_PEAK_DB - maxDb;
    if (gainDb > MAX_GAIN_DB) gainDb = MAX_GAIN_DB;
    if (gainDb < -60) gainDb = -60; // avoid excessive attenuation

    if (Math.abs(gainDb) < 0.01) {
      console.log('Skip (already at target):', base, 'peak', maxDb.toFixed(1), 'dB');
      continue;
    }

    console.log(base, 'peak', maxDb.toFixed(1), 'dB -> gain', gainDb.toFixed(1), 'dB');

    if (DRY_RUN) continue;

    try {
      applyVolume(inputPath, gainDb, inputPath);
    } catch (e) {
      console.error('Error normalizing', base, e.message || e);
    }
  }

  if (!DRY_RUN) {
    console.log('\nDone. All files normalized to peak', TARGET_PEAK_DB, 'dB.');
  }
}

main();
