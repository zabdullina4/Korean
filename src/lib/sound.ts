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

/** Произнести корейский текст. Строки через \n — реплики диалога: голоса чередуются.
 *  Возвращает false, если в браузере нет синтеза речи. */
export function speak(text: string, rate = 0.8): boolean {
  if (!canSpeak()) return false;
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('ko'));
  window.speechSynthesis.cancel();
  text.split('\n').forEach((line, i) => {
    const u = new SpeechSynthesisUtterance(line.replace(/^[^:]{1,6}:\s*/, ''));
    u.lang = 'ko-KR';
    u.rate = rate;
    const v = voices.length > 1 ? voices[i % 2] : voices[0];
    if (v) u.voice = v;
    // Второй собеседник — выше голосом, если голос в системе один.
    if (voices.length < 2 && i % 2) u.pitch = 1.35;
    window.speechSynthesis.speak(u);
  });
  return true;
}

export function hasKoreanVoice(): boolean {
  return canSpeak() && !!koreanVoice();
}
