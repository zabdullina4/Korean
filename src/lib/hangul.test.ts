import { describe, expect, it } from 'vitest';
import { batchimSound, compose, decompose, isSyllable, toJamo, vowelShape } from './hangul';

describe('hangul', () => {
  it('собирает слоги', () => {
    expect(compose('ㄱ', 'ㅏ')).toBe('가');
    expect(compose('ㅎ', 'ㅏ', 'ㄴ')).toBe('한');
    expect(compose('ㅇ', 'ㅢ')).toBe('의');
    expect(compose('ㅎ', 'ㅣ', 'ㅎ')).toBe('힣');
  });

  it('отказывает на неверных буквах', () => {
    expect(compose('ㅏ', 'ㄱ')).toBeNull();
    expect(compose('ㄱ', 'ㅏ', 'ㄸ')).toBeNull(); // ㄸ не бывает патчимом
  });

  it('разбирает слоги', () => {
    expect(decompose('닭')).toEqual({ cho: 'ㄷ', jung: 'ㅏ', jong: 'ㄺ' });
    expect(decompose('a')).toBeNull();
    expect(isSyllable('가')).toBe(true);
    expect(isSyllable('ㄱ')).toBe(false);
  });

  it('раскладывает строку на чамо', () => {
    expect(toJamo('한국')).toEqual(['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅜ', 'ㄱ']);
    expect(toJamo('a 가')).toEqual(['a', ' ', 'ㄱ', 'ㅏ']);
  });

  it('определяет положение гласной', () => {
    expect(vowelShape('ㅏ')).toBe('right');
    expect(vowelShape('ㅗ')).toBe('below');
    expect(vowelShape('ㅘ')).toBe('mixed');
  });

  it('сводит патчим к 7 звукам', () => {
    expect(batchimSound('ㅅ')).toBe('ㄷ');
    expect(batchimSound('ㅍ')).toBe('ㅂ');
    expect(batchimSound('ㄺ')).toBe('ㄱ');
    expect(batchimSound('ㅇ')).toBe('ㅇ');
  });
});
