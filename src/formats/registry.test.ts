import { describe, it, expect } from 'vitest';
import {
  FORMATS,
  FORMAT_BY_ID,
  ENCODE_TARGETS,
  detectFormat,
} from './registry';

const fakeFile = (name: string, type = ''): File =>
  ({ name, type }) as File;

describe('format registry integrity', () => {
  it('has unique ids', () => {
    const ids = FORMATS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('indexes every format by id', () => {
    for (const f of FORMATS) expect(FORMAT_BY_ID.get(f.id)).toBe(f);
  });

  it('only lists encodable formats as encode targets', () => {
    expect(ENCODE_TARGETS.every((f) => f.canEncode)).toBe(true);
    expect(ENCODE_TARGETS.length).toBe(FORMATS.filter((f) => f.canEncode).length);
  });
});

describe('detectFormat', () => {
  it('detects by file extension (case-insensitive)', () => {
    expect(detectFormat(fakeFile('photo.JPG'))?.id).toBe('jpeg');
    expect(detectFormat(fakeFile('image.png'))?.id).toBe('png');
  });

  it('resolves aliases to the canonical format', () => {
    expect(detectFormat(fakeFile('scan.tiff'))?.id).toBe('tiff');
    expect(detectFormat(fakeFile('pic.heif'))?.id).toBe('heic');
  });

  it('falls back to MIME type when the extension is unknown', () => {
    expect(detectFormat(fakeFile('mystery', 'image/webp'))?.id).toBe('webp');
  });

  it('returns undefined for unrecognized files', () => {
    expect(detectFormat(fakeFile('data.xyz'))).toBeUndefined();
  });
});
