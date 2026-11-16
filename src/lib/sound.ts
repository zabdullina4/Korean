// Озвучка (Web Speech API, голос ko-KR) и школьный звонок 딩동댕 (Web Audio).

let ctx: AudioContext | null = null;

export function bell(): void {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new AC();
    [784, 659, 523].forEach((f, i) => {
      const c = ctx!;
      const o = c.createOscillator();
      const g = c.createGain();
      const t = c.currentTime + i * 0.32;
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 1.2);
    });
  } catch {
    /* звук недоступен — не мешаем уроку */
  }
}

function koreanVoice(): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis?.getVoices().find((v) => v.lang.toLowerCase().startsWith('ko'));
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Произнести корейский текст. Возвращает false, если в браузере нет синтеза речи. */
export function speak(text: string, rate = 0.8): boolean {
  if (!canSpeak()) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = rate;
  const v = koreanVoice();
  if (v) u.voice = v;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  return true;
}

export function hasKoreanVoice(): boolean {
  return canSpeak() && !!koreanVoice();
}
