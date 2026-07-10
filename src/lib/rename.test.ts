import { describe, it, expect } from 'vitest';
import { splitName, joinName, dedupeNames, applyCase, expandPattern } from './rename';

describe('splitName', () => {
  it('separates base and extension', () => {
    expect(splitName('photo.JPG')).toEqual({ base: 'photo', ext: 'JPG' });
    expect(splitName('archive.tar.gz')).toEqual({ base: 'archive.tar', ext: 'gz' });
  });

  it('treats dotfiles and extension-less names as having no extension', () => {
    expect(splitName('.env')).toEqual({ base: '.env', ext: '' });
    expect(splitName('README')).toEqual({ base: 'README', ext: '' });
  });
});

describe('joinName', () => {
  it('joins base and extension and strips stray dots', () => {
    expect(joinName('photo', 'png')).toBe('photo.png');
    expect(joinName('photo', '.png')).toBe('photo.png');
    expect(joinName('photo', '')).toBe('photo');
  });
});

describe('dedupeNames', () => {
  it('keeps unique names untouched', () => {
    expect(dedupeNames(['a.png', 'b.png'])).toEqual(['a.png', 'b.png']);
  });

  it('appends a suffix before the extension for collisions (case-insensitive)', () => {
    expect(dedupeNames(['a.png', 'a.png', 'A.PNG'])).toEqual(['a.png', 'a-1.png', 'A-2.PNG']);
  });

  it('does not collide with a name that already uses the suffix', () => {
    expect(dedupeNames(['a.png', 'a-1.png', 'a.png'])).toEqual(['a.png', 'a-1.png', 'a-2.png']);
  });
});

describe('applyCase', () => {
  it('applies each case transform', () => {
    expect(applyCase('My Photo', 'lower')).toBe('my photo');
    expect(applyCase('My Photo', 'upper')).toBe('MY PHOTO');
    expect(applyCase('My  Photo_name', 'kebab')).toBe('my-photo-name');
    expect(applyCase('My  Photo-name', 'snake')).toBe('my_photo_name');
    expect(applyCase('My Photo', 'none')).toBe('My Photo');
  });
});

describe('expandPattern', () => {
  it('substitutes all supported tokens', () => {
    const out = expandPattern('{name}-{n}-{date}.{ext}', {
      index: 3,
      pad: 3,
      name: 'holiday',
      ext: 'jpg',
      date: '2026-07-10',
    });
    expect(out).toBe('holiday-003-2026-07-10.jpg');
  });

  it('leaves unknown tokens as literal text', () => {
    expect(expandPattern('img_{n}{unknown}', { index: 1, pad: 2, name: 'x', ext: 'png', date: 'd' }))
      .toBe('img_01{unknown}');
  });
});
