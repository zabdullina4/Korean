import { describe, expect, it } from 'vitest';
import { analyze, dict, examples, search } from './dictionary';

const forms = (token: string) => analyze(token).map((a) => `${a.lemma}: ${a.chain.map((m) => m.form).join(' + ')}`);

describe('морфологический разбор', () => {
  it('먹었으니까 = 먹다 + -었- + -으니까', () => {
    expect(forms('먹었으니까')).toContain('먹다: 먹다 + -었- + -으니까');
  });

  it('основные формы глаголов', () => {
    expect(forms('갔어요')).toContain('가다: 가다 + -았- + -어요');
    expect(forms('공부했어요')).toContain('공부하다: 공부하다 + -였- + -어요');
    expect(forms('먹습니다')).toContain('먹다: 먹다 + -습니다');
    expect(forms('읽으세요')).toContain('읽다: 읽다 + -으세요');
    expect(forms('갈까요')).toContain('가다: 가다 + -ㄹ까요');
    expect(forms('좋은')).toContain('좋다: 좋다 + -은');
    expect(forms('가는')).toContain('가다: 가다 + -는');
    expect(forms('마셔서')).toContain('마시다: 마시다 + -어서');
    expect(forms('가셨어요')).toContain('가다: 가다 + -시- + -었- + -어요');
  });

  it('формы 2급', () => {
    expect(forms('만나기로')).toContain('만나다: 만나다 + -기로');
    expect(forms('먹으러')).toContain('먹다: 먹다 + -으러');
    expect(forms('적이')).toContain('적: 적 + 이');
    expect(forms('먹어야')).toContain('먹다: 먹다 + -어야');
    expect(forms('있으면')).toContain('있다: 있다 + -으면');
    expect(forms('맛있는')).toContain('맛있다: 맛있다 + -는');
    expect(forms('맛있은')).not.toContain('맛있다: 맛있다 + -은');
    expect(forms('추운')).toContain('춥다: 춥다 + -은');
    expect(forms('사는')).toContain('살다: 살다 + -는');
    expect(forms('읽을')).toContain('읽다: 읽다 + -을');
    expect(forms('어렸을')).toContain('어리다: 어리다 + -었- + -을');
    expect(forms('걸으면서')).toContain('걷다: 걷다 + -으면서');
    expect(forms('전에')).toContain('전: 전 + 에');
    expect(forms('동안')[0]).toBe('동안: 동안');
    expect(forms('잤기')).toContain('자다: 자다 + -았- + -기');
    expect(forms('돼요')).toContain('되다: 되다 + -어요');
    expect(forms('아파서')).toContain('아프다: 아프다 + -아서');
    expect(forms('걸렸어요')).toContain('걸리다: 걸리다 + -었- + -어요');
    expect(forms('할게요')).toContain('하다: 하다 + -ㄹ게요');
    expect(forms('먹을래요')).toContain('먹다: 먹다 + -을래요');
    expect(forms('드실래요')).toContain('드시다: 드시다 + -ㄹ래요');
    expect(forms('알겠습니다')).toContain('알다: 알다 + -겠- + -습니다');
    expect(forms('모르는데요')).toContain('모르다: 모르다 + -는데요');
    expect(forms('바쁜데요')).toContain('바쁘다: 바쁘다 + -ㄴ데요');
    expect(forms('맛있는데')).toContain('맛있다: 맛있다 + -는데');
    expect(forms('잘하네요')).toContain('잘하다: 잘하다 + -네요');
    expect(forms('읽으셨어요')).toContain('읽다: 읽다 + -으시- + -었- + -어요');
  });

  it('нерегулярные и неоднозначные формы', () => {
    const a = analyze('도와요');
    expect(a[0].lemma).toBe('돕다');
    expect(a[0].note).toMatch(/ㅂ-нерегулярный/);
    // 들어요 — и «слушать» (듣다), и «держать» (들다)
    expect(analyze('들어요').map((x) => x.lemma)).toEqual(expect.arrayContaining(['듣다', '들다']));
    // 사세요 — «покупайте» (사다) и «живите» (살다)
    expect(analyze('사세요').map((x) => x.lemma)).toEqual(expect.arrayContaining(['사다', '살다']));
    expect(analyze('삽니다').find((x) => x.lemma === '살다')?.note).toMatch(/ㄹ/);
  });

  it('существительное + частицы и связка', () => {
    expect(forms('학교에서')).toContain('학교: 학교 + 에서');
    expect(forms('도서관에서는')).toContain('도서관: 도서관 + 에서 + 는');
    expect(forms('학생이에요')).toContain('학생: 학생 + 이에요');
    expect(forms('친구를')).toContain('친구: 친구 + 를');
    expect(forms('제가')).toContain('저: 저 + 가');
    expect(analyze('안나예요')[0].chain.map((m) => m.form)).toEqual(['안나', '예요']);
    expect(analyze('소피아예요')[0].chain.map((m) => m.form)).toEqual(['소피아', '예요']);
  });

  it('ошибка согласования частицы', () => {
    const a = analyze('학생는').find((x) => x.lemma === '학생');
    expect(a?.warning).toMatch(/학생은/);
    expect(analyze('학생은').find((x) => x.lemma === '학생')?.warning).toBeUndefined();
  });
});

describe('поиск', () => {
  it('по-русски', () => {
    expect(search('школа').entries[0].lemma).toBe('학교');
    expect(search('пить').entries.map((e) => e.lemma)).toContain('마시다');
  });

  it('фраза разбирается по словам', () => {
    const r = search('어제 도서관에서 책을 읽었어요.');
    expect(r.tokens.map((t) => t.analyses[0]?.lemma)).toEqual(['어제', '도서관', '책', '읽다']);
  });

  it('слова уроков в словаре и примеры из уроков', () => {
    expect(dict().byLemma.get('학생')?.wordId).toBe('w-haksaeng');
    expect(examples('마시다').length).toBeGreaterThan(0);
  });
});
