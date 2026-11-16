import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';

// 4급, юнит 1 — уступка.
const table: [string, Form, string][] = [
  ['비싸다', 'ado', '비싸도'], ['바쁘다', 'ado', '바빠도'], ['듣다', 'ado', '들어도'], ['먹다', 'ado', '먹어도'], ['힘들다', 'ado', '힘들어도'], ['하다', 'ado', '해도'],
  ['오다', 'deorado', '오더라도'], ['늦다', 'deorado', '늦더라도'], ['힘들다', 'deorado', '힘들더라도'], ['춥다', 'deorado', '춥더라도'],
  ['가다', 'ljirado', '갈지라도'], ['먹다', 'ljirado', '먹을지라도'], ['어렵다', 'ljirado', '어려울지라도'], ['힘들다', 'ljirado', '힘들지라도'], ['실패하다', 'ljirado', '실패할지라도'],
  ['먹다', 'neundedoV', '먹는데도'], ['자다', 'neundedoV', '자는데도'], ['살다', 'neundedoV', '사는데도'], ['듣다', 'neundedoV', '듣는데도'],
  ['춥다', 'neundedoA', '추운데도'], ['바쁘다', 'neundedoA', '바쁜데도'], ['맛있다', 'neundedoA', '맛있는데도'], ['멀다', 'neundedoA', '먼데도'], ['작다', 'neundedoA', '작은데도'],
  ['공부하다', 'pastNeundedo', '공부했는데도'], ['먹다', 'pastNeundedo', '먹었는데도'], ['자다', 'pastNeundedo', '잤는데도'],
];

describe('формы 4급: уступка', () => {
  it.each(table)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(2);
    expect(d).not.toContain(want);
  });

  it('ловушки не совпадают с другими верными формами уступки', () => {
    const valid = (v: string, f: Form) => (['ado', 'deorado', 'ljirado', f === 'neundedoA' ? 'neundedoA' : 'neundedoV', 'pastNeundedo'] as Form[]).map((x) => conj(v, x));
    for (const [v, f] of table) {
      const ok = new Set([...valid(v, f), conj(v, 'past').slice(0, -2) + '어도', conj(v, 'past').slice(0, -2) + '더라도']);
      for (const d of conjDistractors(v, f)) expect(ok.has(d), `${v} ${f}: ${d}`).toBe(false);
    }
  });
});

// 4급, юнит 2 — противопоставление.
const table2: [string, Form, string][] = [
  ['가다', 'banmyeonV', '가는 반면에'], ['먹다', 'banmyeonV', '먹는 반면에'], ['살다', 'banmyeonV', '사는 반면에'], ['좋아하다', 'banmyeonV', '좋아하는 반면에'],
  ['비싸다', 'banmyeonA', '비싼 반면에'], ['좁다', 'banmyeonA', '좁은 반면에'], ['춥다', 'banmyeonA', '추운 반면에'], ['맛있다', 'banmyeonA', '맛있는 반면에'], ['멀다', 'banmyeonA', '먼 반면에'],
  ['오르다', 'pastBanmyeon', '오른 반면에'], ['늘다', 'pastBanmyeon', '는 반면에'], ['줄다', 'pastBanmyeon', '준 반면에'], ['먹다', 'pastBanmyeon', '먹은 반면에'],
  ['살다', 'debanhaeV', '사는데 반해'], ['먹다', 'debanhaeV', '먹는데 반해'], ['자다', 'debanhaeV', '자는데 반해'],
  ['조용하다', 'debanhaeA', '조용한데 반해'], ['넓다', 'debanhaeA', '넓은데 반해'], ['재미있다', 'debanhaeA', '재미있는데 반해'],
  ['맛있다', 'gineun', '맛있기는 하지만'], ['비싸다', 'gineun', '비싸기는 하지만'], ['가다', 'gineun', '가기는 하지만'], ['듣다', 'gineun', '듣기는 하지만'],
  ['읽다', 'pastGineun', '읽기는 했지만'], ['가다', 'pastGineun', '가기는 했지만'],
];

describe('формы 4급: противопоставление', () => {
  it.each(table2)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(2);
    expect(d).not.toContain(want);
  });

  it('ловушки не совпадают с другими верными формами', () => {
    for (const [v, f] of table2) {
      const verbish = f !== 'banmyeonA' && f !== 'debanhaeA';
      const ok = new Set(
        (verbish ? ['banmyeonV', 'pastBanmyeon', 'debanhaeV', 'gineun', 'pastGineun'] : ['banmyeonA', 'debanhaeA', 'gineun', 'pastGineun']).map((x) => conj(v, x as Form)),
      );
      for (const d of conjDistractors(v, f)) expect(ok.has(d), `${v} ${f}: ${d}`).toBe(false);
    }
  });
});

// 4급, юнит 3 — тонкие причины.
const table3: [string, Form, string][] = [
  ['오다', 'barame', '오는 바람에'], ['막히다', 'barame', '막히는 바람에'], ['울다', 'barame', '우는 바람에'], ['고장 나다', 'barame', '고장 나는 바람에'],
  ['자다', 'neurago', '자느라고'], ['먹다', 'neurago', '먹느라고'], ['만들다', 'neurago', '만드느라고'], ['준비하다', 'neurago', '준비하느라고'], ['듣다', 'neurago', '듣느라고'],
  ['도와주다', 'deokbun', '도와준 덕분에'], ['가르치다', 'deokbun', '가르친 덕분에'], ['듣다', 'deokbun', '들은 덕분에'], ['연습하다', 'deokbun', '연습한 덕분에'],
  ['좋다', 'deokbunA', '좋은 덕분에'], ['친절하다', 'deokbunA', '친절한 덕분에'], ['가깝다', 'deokbunA', '가까운 덕분에'],
  ['먹다', 'tatPast', '먹은 탓에'], ['놀다', 'tatPast', '논 탓에'], ['마시다', 'tatPast', '마신 탓에'],
  ['춥다', 'tatA', '추운 탓에'], ['바쁘다', 'tatA', '바쁜 탓에'], ['재미없다', 'tatA', '재미없는 탓에'],
];

describe('формы 4급: тонкие причины', () => {
  it.each(table3)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(2);
    expect(d).not.toContain(want);
  });

  it('ловушки не совпадают с верными формами причины (в т.ч. -는 덕분에/탓에)', () => {
    for (const [v, f] of table3) {
      const adj = f === 'deokbunA' || f === 'tatA';
      const ok = new Set(
        adj
          ? [conj(v, 'deokbunA'), conj(v, 'tatA')]
          : [conj(v, 'barame'), conj(v, 'neurago'), conj(v, 'deokbun'), conj(v, 'tatPast'), `${conj(v, 'attrV')} 덕분에`, `${conj(v, 'attrV')} 탓에`],
      );
      for (const d of conjDistractors(v, f)) expect(ok.has(d), `${v} ${f}: ${d}`).toBe(false);
    }
  });
});

// 4급, юнит 4 — гипотеза и сожаление.
const table4: [string, Form, string][] = [
  ['가다', 'deoramyeon', '갔더라면'], ['먹다', 'deoramyeon', '먹었더라면'], ['조심하다', 'deoramyeon', '조심했더라면'], ['듣다', 'deoramyeon', '들었더라면'], ['알다', 'deoramyeon', '알았더라면'],
  ['넘어지다', 'lppeon', '넘어질 뻔했어요'], ['늦다', 'lppeon', '늦을 뻔했어요'], ['울다', 'lppeon', '울 뻔했어요'], ['잊어버리다', 'lppeon', '잊어버릴 뻔했어요'], ['죽다', 'lppeon', '죽을 뻔했어요'],
  ['가다', 'ndamyeonV', '간다면'], ['먹다', 'ndamyeonV', '먹는다면'], ['살다', 'ndamyeonV', '산다면'], ['당첨되다', 'ndamyeonV', '당첨된다면'], ['듣다', 'ndamyeonV', '듣는다면'],
  ['비싸다', 'damyeonA', '비싸다면'], ['춥다', 'damyeonA', '춥다면'], ['있다', 'damyeonA', '있다면'], ['없다', 'damyeonA', '없다면'],
  ['알다', 'pastDamyeon', '알았다면'], ['오다', 'pastDamyeon', '왔다면'], ['하다', 'pastDamyeon', '했다면'],
];

describe('формы 4급: гипотеза и сожаление', () => {
  it.each(table4)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(2);
    expect(d).not.toContain(want);
  });

  it('ловушки не совпадают с верными условными формами', () => {
    for (const [v, f] of table4) {
      const p = conj(v, 'past').slice(0, -2);
      const ok = new Set([conj(v, 'deoramyeon'), conj(v, 'lppeon'), conj(v, f === 'damyeonA' ? 'damyeonA' : 'ndamyeonV'), conj(v, 'pastDamyeon'), `${p}으면`, conj(v, 'myeon')]);
      for (const d of conjDistractors(v, f)) expect(ok.has(d), `${v} ${f}: ${d}`).toBe(false);
    }
  });
});

// 4급, юниты 5–7 — синонимичные пары, цель 2, степень.
const table57: [string, Form, string][] = [
  ['가다', 'geodeunyo', '가거든요'], ['바쁘다', 'geodeunyo', '바쁘거든요'], ['살다', 'geodeunyo', '살거든요'], ['먹다', 'pastGeodeunyo', '먹었거든요'], ['오다', 'pastGeodeunyo', '왔거든요'],
  ['알다', 'janayo', '알잖아요'], ['비싸다', 'janayo', '비싸잖아요'], ['가다', 'janayo', '가잖아요'], ['말하다', 'pastJanayo', '말했잖아요'],
  ['춥다', 'ltende', '추울 텐데'], ['바쁘다', 'ltende', '바쁠 텐데'], ['힘들다', 'ltende', '힘들 텐데'], ['오다', 'ltende', '올 텐데'],
  ['가다', 'lgeonde', '갈 건데'], ['먹다', 'lgeonde', '먹을 건데'], ['만들다', 'lgeonde', '만들 건데'],
  ['춥다', 'deoni', '춥더니'], ['오다', 'deoni', '오더니'], ['열다', 'pastDeoni', '열었더니'], ['먹다', 'pastDeoni', '먹었더니'], ['물어보다', 'pastDeoni', '물어봤더니'],
  ['늦다', 'dorok', '늦도록'], ['알다', 'dorok', '알도록'], ['듣다', 'dorok', '듣도록'],
  ['알리다', 'goja', '알리고자'], ['돕다', 'goja', '돕고자'],
  ['운동하다', 'lgyeom', '운동할 겸'], ['먹다', 'lgyeom', '먹을 겸'], ['쉬다', 'lgyeom', '쉴 겸'],
  ['죽다', 'ljeongdoro', '죽을 정도로'], ['놀라다', 'ljeongdoro', '놀랄 정도로'], ['울다', 'ljeongdoro', '울 정도로'],
  ['가다', 'lsurok', '갈수록'], ['먹다', 'lsurok', '먹을수록'], ['듣다', 'lsurok', '들을수록'], ['살다', 'lsurok', '살수록'], ['많다', 'lsurok', '많을수록'],
  ['오다', 'giman', '오기만 하면'], ['먹다', 'giman', '먹기만 하면'], ['울다', 'gimanhaeyo', '울기만 해요'], ['자다', 'gimanhaeyo', '자기만 해요'],
];

describe('формы 4급: юниты 5–7', () => {
  it.each(table57)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(2);
    expect(d).not.toContain(want);
  });
});

// Дополнение по Korean Grammar in Use: формы 1–4급.
const tableKgiu: [string, Form, string][] = [
  ['먹다', 'go', '먹고'], ['가다', 'go', '가고'], ['먹다', 'juseyo', '먹어 주세요'], ['사다', 'juseyo', '사 주세요'], ['돕다', 'juseyo', '도와 주세요'],
  ['가다', 'jimaseyo', '가지 마세요'], ['먹다', 'gonaseo', '먹고 나서'], ['보다', 'geona', '보거나'], ['타다', 'ljulalda', '탈 줄 알아요'], ['만들다', 'ljulalda', '만들 줄 알아요'],
  ['오다', 'jianhado', '오지 않아도 돼요'], ['오다', 'eosseumyeon', '왔으면 좋겠어요'], ['가다', 'ryeomyeon', '가려면'], ['먹다', 'ryeomyeon', '먹으려면'], ['살다', 'ryeomyeon', '살려면'],
  ['배우다', 'lkkahada', '배울까 해요'], ['살다', 'nji', '산 지'], ['먹다', 'jungida', '먹는 중이에요'], ['쉬다', 'geoeottaeyo', '쉬는 게 어때요'], ['먹다', 'gunyoV', '먹는군요'], ['춥다', 'gunyoA', '춥군요'],
  ['피곤하다', 'boyeoyo', '피곤해 보여요'], ['깨끗하다', 'geAdv', '깨끗하게'], ['무섭다', 'ahada', '무서워해요'], ['슬프다', 'ahada', '슬퍼해요'],
  ['열리다', 'aitda', '열려 있어요'], ['사다', 'anota', '사 놓았어요'], ['먹다', 'abeorida', '먹어 버렸어요'], ['울다', 'gomalda', '울고 말았어요'], ['늦다', 'ljido', '늦을지도 몰라요'], ['늦다', 'lkkabwa', '늦을까 봐'],
  ['도착하다', 'neundaero', '도착하는 대로'], ['가다', 'gonhada', '가곤 했어요'], ['먹다', 'pyeonV', '먹는 편이에요'], ['조용하다', 'pyeonA', '조용한 편이에요'], ['보다', 'lmanhada', '볼 만해요'], ['자다', 'cheok', '자는 척했어요'],
  ['기다리다', 'raeyo', '기다리래요'], ['먹다', 'raeyo', '먹으래요'], ['가다', 'jaeyo', '가재요'], ['살다', 'nyaeyo', '사냬요'],
  ['가다', 'deunji', '가든지'], ['말하다', 'abwatja', '말해 봤자'], ['싸다', 'lppunman', '쌀 뿐만 아니라'], ['비싸다', 'dedagaA', '비싼 데다가'], ['오다', 'dedagaV', '오는 데다가'], ['예쁘다', 'gillae', '예쁘길래'],
  ['피곤하다', 'aseogeureonji', '피곤해서 그런지'], ['돕다', 'ltenikka', '도울 테니까'], ['오다', 'lgeolgeuraetda', '올 걸 그랬어요'], ['알다', 'lliga', '알 리가 없어요'], ['먹다', 'ayajiyo', '먹어야지요'],
  ['비싸다', 'lgeolyo', '비쌀걸요'], ['잘하다', 'gineunyo', '잘하기는요'], ['맛있다', 'deondeyo', '맛있던데요'], ['살다', 'dabomyeon', '살다 보면'], ['입다', 'nchaero', '입은 채로'], ['전화하다', 'ryeodeon', '전화하려던 참이에요'],
];

describe('формы: дополнение по Korean Grammar in Use', () => {
  it.each(tableKgiu)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(2);
    expect(d).not.toContain(want);
  });
});
