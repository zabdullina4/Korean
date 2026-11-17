import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';

// 6급: редкие книжные и литературные окончания, 하오체 и 하게체, академический стиль.
const table: [string, Form, string][] = [
  ['보다', 'namana', '보나 마나'], ['먹다', 'namana', '먹으나 마나'], ['묻다', 'namana', '물으나 마나'],
  ['가져오다', 'giemangjeong', '가져왔기에 망정이지'], ['출발하다', 'giemangjeong', '출발했기에 망정이지'],
  ['비싸다', 'geoniwa', '비싸거니와'], ['좋다', 'geoniwa', '좋거니와'], ['말하다', 'pastGeoniwa', '말했거니와'],
  ['그러하다', 'ljindae', '그러할진대'], ['있다', 'ljindae', '있을진대'],
  ['가다', 'nora', '가노라'], ['살다', 'nora', '사노라'], ['오다', 'pastNora', '왔노라'], ['이기다', 'pastNora', '이겼노라'],
  ['가다', 'lira', '가리라'], ['먹다', 'lira', '먹으리라'], ['살다', 'lira', '살리라'], ['돌아오다', 'lira', '돌아오리라'],
  ['아름답다', 'doda', '아름답도다'], ['좋다', 'doda', '좋도다'], ['이다', 'doda', '이로다'],
  ['하다', 'ljieoda', '할지어다'], ['듣다', 'ljieoda', '들을지어다'],
  ['가다', 'hao', '가오'], ['먹다', 'hao', '먹소'], ['살다', 'hao', '사오'], ['좋다', 'hao', '좋소'], ['이다', 'hao', '이오'], ['먹다', 'pastHao', '먹었소'], ['오다', 'pastHao', '왔소'],
  ['가다', 'hasio', '가시오'], ['앉다', 'hasio', '앉으시오'], ['기다리다', 'hasio', '기다리시오'],
  ['가다', 'hageSt', '가네'], ['먹다', 'hageSt', '먹네'], ['살다', 'hageSt', '사네'],
  ['가다', 'hageQ', '가나'], ['먹다', 'hageQ', '먹나'], ['살다', 'hageQ', '사나'],
  ['가다', 'hageCmd', '가게'], ['앉다', 'hageCmd', '앉게'], ['가다', 'hageSug', '가세'], ['놀다', 'hageSug', '노세'], ['떠나다', 'hageSug', '떠나세'],
  ['좋다', 'deoniman', '좋더니만'], ['오다', 'deoniman', '오더니만'],
  ['노력하다', 'eumedo', '노력함에도 불구하고'], ['많다', 'eumedo', '많음에도 불구하고'], ['반대하다', 'pastEumedo', '반대했음에도 불구하고'],
  ['변하다', 'dagoV', '변한다고 볼 수 있다'], ['먹다', 'dagoV', '먹는다고 볼 수 있다'], ['크다', 'dagoA', '크다고 볼 수 있다'],
  ['증가하다', 'lgeoseuro', '증가할 것으로 보인다'], ['늘다', 'lgeoseuro', '늘 것으로 보인다'],
];

describe('формы 6급', () => {
  it.each(table)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(2);
    expect(d).not.toContain(want);
  });
});
