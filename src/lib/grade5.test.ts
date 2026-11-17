import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';

// 5급: книжные конструкции.
const table: [string, Form, string][] = [
  ['변하다', 'gimaryeon', '변하기 마련이다'], ['실수하다', 'gimaryeon', '실수하기 마련이다'],
  ['포기하다', 'lsubakke', '포기할 수밖에 없다'], ['먹다', 'lsubakke', '먹을 수밖에 없다'],
  ['오해받다', 'gisipsang', '오해받기 십상이다'], ['있다', 'lbeophada', '있을 법하다'], ['나오다', 'lbeophada', '나올 법하다'],
  ['변하다', 'eumettara', '변함에 따라'], ['늘다', 'eumettara', '늚에 따라'], ['발전하다', 'eumettara', '발전함에 따라'],
  ['노력하다', 'neunhan', '노력하는 한'], ['살다', 'neunhan', '사는 한'], ['결정하다', 'nisang', '결정한 이상'],
  ['중요하다', 'eumeuro', '중요하므로'], ['많다', 'eumeuro', '많으므로'], ['살다', 'eumeuro', '살므로'],
  ['바쁘다', 'gie', '바쁘기에'], ['노력하다', 'eumeurosseo', '노력함으로써'], ['읽다', 'eumeurosseo', '읽음으로써'],
  ['먹다', 'neuni', '먹느니'], ['살다', 'neuni', '사느니'], ['포기하다', 'lbaeya', '포기할 바에야'],
  ['먹다', 'geon', '먹건'], ['먹다', 'dagibodaV', '먹는다기보다는'], ['가다', 'dagibodaV', '간다기보다는'], ['비싸다', 'dagibodaA', '비싸다기보다는'],
  ['쉬다', 'gineunkeonyeong', '쉬기는커녕'], ['굶다', 'lmangjeong', '굶을망정'], ['하다', 'nsem', '한 셈이다'], ['끝나다', 'nsem', '끝난 셈이다'],
  ['하다', 'ginareum', '하기 나름이다'], ['감사하다', 'lttareum', '감사할 따름이다'], ['알다', 'dasipi', '알다시피'], ['보다', 'dasipi', '보다시피'],
  ['말하다', 'nbawa', '말한 바와 같이'], ['쓰다', 'deusi', '쓰듯이'], ['오다', 'deutV', '오는 듯하다'], ['바쁘다', 'deutA', '바쁜 듯하다'], ['있다', 'deutA', '있는 듯하다'],
];

describe('формы 5급', () => {
  it.each(table)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(2);
    expect(d).not.toContain(want);
  });
});
