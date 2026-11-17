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
    expect(forms('먹는다')).toContain('먹다: 먹다 + -는다');
    expect(forms('간다')).toContain('가다: 가다 + -ㄴ다');
    expect(forms('갔다')).toContain('가다: 가다 + -았- + -다');
    expect(forms('온대요')).toContain('오다: 오다 + -ㄴ대요');
    expect(forms('좋대요')).toContain('좋다: 좋다 + -대요');
    expect(forms('먹냐고')).toContain('먹다: 먹다 + -냐고');
    expect(forms('읽으라고')).toContain('읽다: 읽다 + -으라고');
    expect(forms('보자고')).toContain('보다: 보다 + -자고');
    expect(forms('맛있나')).toContain('맛있다: 맛있다 + -나');
    expect(forms('추운가')).toContain('춥다: 춥다 + -은가');
    expect(forms('학생이라고')).toContain('학생: 학생 + 이라고');
    expect(forms('것이다')).toContain('것: 것 + 이다');
    expect(forms('추워졌어요')).toContain('춥다: 춥다 + -어지- + -었- + -어요');
    expect(forms('좋아하게')).toContain('좋아하다: 좋아하다 + -게');
    expect(forms('도착하자마자')).toContain('도착하다: 도착하다 + -자마자');
    expect(forms('입었다가')).toContain('입다: 입다 + -었- + -다가');
    expect(forms('삶')).toContain('살다: 살다 + -ㅁ');
    expect(forms('도움')).toContain('돕다: 돕다 + -음');
    expect(forms('맛있더라고요')).toContain('맛있다: 맛있다 + -더라고요');
    expect(forms('살던')).toContain('살다: 살다 + -던');
    expect(forms('갔던')).toContain('가다: 가다 + -았- + -던');
    expect(forms('열렸어요')).toContain('열리다: 열리다 + -었- + -어요');
    expect(forms('보여요')).toContain('보이다: 보이다 + -어요');
    // 4급: уступка
    expect(forms('늦더라도')).toContain('늦다: 늦다 + -더라도');
    expect(forms('실패할지라도')).toContain('실패하다: 실패하다 + -ㄹ지라도');
    expect(forms('먹을지라도')).toContain('먹다: 먹다 + -을지라도');
    expect(forms('먹는데도')).toContain('먹다: 먹다 + -는데도');
    expect(forms('추운데도')).toContain('춥다: 춥다 + -은데도');
    expect(forms('맛있는데도')).toContain('맛있다: 맛있다 + -는데도');
    expect(forms('공부했는데도')).toContain('공부하다: 공부하다 + -였- + -는데도');
    expect(forms('힘들어도')).toContain('힘들다: 힘들다 + -어도');
    // 4급: противопоставление
    expect(forms('어렵기는')).toContain('어렵다: 어렵다 + -기는');
    expect(forms('맛있긴')).toContain('맛있다: 맛있다 + -긴');
    expect(forms('편리한')).toContain('편리하다: 편리하다 + -ㄴ');
    expect(forms('조용한데')).toContain('조용하다: 조용하다 + -ㄴ데');
    // 4급: тонкие причины
    expect(forms('만드느라고')).toContain('만들다: 만들다 + -느라고');
    expect(forms('먹느라')).toContain('먹다: 먹다 + -느라');
    expect(forms('바람에')).toContain('바람: 바람 + 에');
    expect(forms('탓에')).toContain('탓: 탓 + 에');
    // 4급: гипотеза и сожаление
    expect(forms('알았더라면')).toContain('알다: 알다 + -았- + -더라면');
    expect(forms('뻔했어요')).toContain('뻔하다: 뻔하다 + -였- + -어요');
    expect(forms('넘어질')).toContain('넘어지다: 넘어지다 + -ㄹ');
    expect(forms('당첨된다면')).toContain('당첨되다: 당첨되다 + -ㄴ다면');
    expect(forms('먹는다면')).toContain('먹다: 먹다 + -는다면');
    expect(forms('비싸다면')).toContain('비싸다: 비싸다 + -다면');
    expect(forms('있었다면')).toContain('있다: 있다 + -었- + -다면');
    expect(forms('미끄러워서')).toContain('미끄럽다: 미끄럽다 + -어서');
    // 4급: юниты 5–7
    expect(forms('바쁘거든요')).toContain('바쁘다: 바쁘다 + -거든요');
    expect(forms('말했잖아요')).toContain('말하다: 말하다 + -였- + -잖아요');
    expect(forms('춥더니')).toContain('춥다: 춥다 + -더니');
    expect(forms('열었더니')).toContain('열다: 열다 + -었- + -더니');
    expect(forms('늦지')).toContain('늦다: 늦다 + -지');
    expect(forms('알리고자')).toContain('알리다: 알리다 + -고자');
    expect(forms('들을수록')).toContain('듣다: 듣다 + -을수록');
    expect(forms('갈수록')).toContain('가다: 가다 + -ㄹ수록');
    expect(forms('오기만')).toContain('오다: 오다 + -기만');
    expect(forms('텐데')).toContain('텐데: 텐데');
    expect(forms('겸')).toContain('겸: 겸');
    // дополнение по Korean Grammar in Use
    expect(forms('보거나')).toContain('보다: 보다 + -거나');
    expect(forms('먹으려면')).toContain('먹다: 먹다 + -으려면');
    expect(forms('배울까')).toContain('배우다: 배우다 + -ㄹ까');
    expect(forms('먹는군요')).toContain('먹다: 먹다 + -는군요');
    expect(forms('춥군요')).toContain('춥다: 춥다 + -군요');
    expect(forms('늦을지도')).toContain('늦다: 늦다 + -을지도');
    expect(forms('가곤')).toContain('가다: 가다 + -곤');
    expect(forms('사냬요')).toContain('살다: 살다 + -냬요');
    expect(forms('가든지')).toContain('가다: 가다 + -든지');
    expect(forms('비쌀걸요')).toContain('비싸다: 비싸다 + -ㄹ걸요');
    expect(forms('맛있던데요')).toContain('맛있다: 맛있다 + -던데요');
    expect(forms('먹어야지요')).toContain('먹다: 먹다 + -어야지요');
    expect(forms('마세요')).toContain('말다: 말다 + -세요');
    expect(forms('버렸어요')).toContain('버리다: 버리다 + -었- + -어요');
    // 5급
    expect(forms('중요하므로')).toContain('중요하다: 중요하다 + -므로');
    expect(forms('많으므로')).toContain('많다: 많다 + -으므로');
    expect(forms('바쁘기에')).toContain('바쁘다: 바쁘다 + -기에');
    expect(forms('노력함으로써')).toContain('노력하다: 노력하다 + -(으)ㅁ으로써');
    expect(forms('변함에')).toContain('변하다: 변하다 + -(으)ㅁ에');
    expect(forms('사느니')).toContain('살다: 살다 + -느니');
    expect(forms('먹는다기보다는')).toContain('먹다: 먹다 + -는다기보다는');
    expect(forms('쉬기는커녕')).toContain('쉬다: 쉬다 + -기는커녕');
    expect(forms('굶을망정')).toContain('굶다: 굶다 + -을망정');
    expect(forms('보다시피')).toContain('보다: 보다 + -다시피');
    expect(forms('아시다시피')).toContain('알다: 알다 + -시- + -다시피');
    expect(forms('쓰듯이')).toContain('쓰다: 쓰다 + -듯이');
    // 6급
    expect(forms('보나')).toContain('보다: 보다 + -나');
    expect(forms('먹으나')).toContain('먹다: 먹다 + -으나');
    expect(forms('마나')).toContain('말다: 말다 + -나');
    expect(forms('왔기에')).toContain('오다: 오다 + -았- + -기에');
    expect(forms('좋거니와')).toContain('좋다: 좋다 + -거니와');
    expect(forms('있을진대')).toContain('있다: 있다 + -을진대');
    expect(forms('사노라')).toContain('살다: 살다 + -노라');
    expect(forms('왔노라')).toContain('오다: 오다 + -았- + -노라');
    expect(forms('먹으리라')).toContain('먹다: 먹다 + -으리라');
    expect(forms('살리라')).toContain('살다: 살다 + -리라');
    expect(forms('좋도다')).toContain('좋다: 좋다 + -도다');
    expect(forms('들을지어다')).toContain('듣다: 듣다 + -을지어다');
    expect(forms('먹소')).toContain('먹다: 먹다 + -소');
    expect(forms('가오')).toContain('가다: 가다 + -오');
    expect(forms('앉으시오')).toContain('앉다: 앉다 + -으시오');
    expect(forms('노세')).toContain('놀다: 놀다 + -세');
    expect(forms('앉게')).toContain('앉다: 앉다 + -게');
    expect(forms('좋더니만')).toContain('좋다: 좋다 + -더니만');
    expect(forms('많음에도')).toContain('많다: 많다 + -(으)ㅁ에도');
    expect(forms('사나')).toContain('살다: 살다 + -나');
    expect(forms('커피에다가')).toContain('커피: 커피 + 에다가');
    expect(forms('조금이나마')).toContain('조금: 조금 + 이나마');
    expect(forms('밥은커녕')).toContain('밥: 밥 + 은커녕');
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
