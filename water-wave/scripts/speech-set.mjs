const WAV = './resources/wav';
const WaveSet = {
  BEEP_BOO: `${WAV}/duck-beep-boo.wav`,
  CONFIDENT: `${WAV}/duck-confident.wav`,
  LIGHT: `${WAV}/duck-light.wav`,
  LISTLESS: `${WAV}/duck-listless.wav`,
  PINCH: `${WAV}/duck-pinch.wav`,
  SIGH: `${WAV}/duck-sigh.wav`,
  TALK: `${WAV}/duck-talk.wav`,
  LOREM_IPSUM: `${WAV}/lorem-ipsum.wav`,
};

// 미리 로딩해놓기 위한 코드
Object.values(WaveSet).forEach((url) => new Audio(url));

const CHICK_EMOJI = [
  {
    text: `🐤`,
    soundUrl: WaveSet.BEEP_BOO,
  },
  {
    text: `🐤`,
    soundUrl: WaveSet.BEEP_BOO,
  },
  {
    text: `🐤`,
    soundUrl: WaveSet.CONFIDENT,
  },
  {
    text: `🐤`,
    soundUrl: WaveSet.LIGHT,
  },
  {
    text: `🐤`,
    soundUrl: WaveSet.LIGHT,
  },
  {
    text: `🐤`,
    soundUrl: WaveSet.LIGHT,
  },
];

const QUAK_TEXT = [
  {
    text: `'QUAK'`,
    soundUrl: WaveSet.BEEP_BOO,
  },
  {
    text: `'QUAK'`,
    soundUrl: WaveSet.LISTLESS,
  },
  {
    text: `'QUAK'`,
    soundUrl: WaveSet.PINCH,
  },
  {
    text: `'QUAK'`,
    soundUrl: WaveSet.TALK,
  },
  {
    text: `'QUAK'`,
    soundUrl: WaveSet.TALK,
  },
  {
    text: `'QUAK'`,
    soundUrl: WaveSet.LIGHT,
  },
  {
    text: `'QUAK'`,
    soundUrl: WaveSet.LIGHT,
  },
  {
    text: `'QUAK'`,
    soundUrl: WaveSet.LIGHT,
  },
  {
    text: `'QUAK'`,
    soundUrl: WaveSet.LIGHT,
  },
  {
    text: `'QUAK'`,
    soundUrl: WaveSet.SIGH,
  },
];

export const LIFE_QUOTE_TYPE = 'LIFE_QUOTE_TYPE';
const LIFE_QUOTES = [
  {
    type: LIFE_QUOTE_TYPE,
    text: `상대방을 판단하는데
가장 큰 기준이 되는 것은 아이러니하게도 상대방이 아니라
그날의 나의 기분, 나의 취향, 나의 상황
바로 '나'이다
그러므로 특별한 이유 없이 누군가 미워졌다면
자신을 의심하라`,
    soundUrl: WaveSet.LOREM_IPSUM,
  },
  {
    type: LIFE_QUOTE_TYPE,
    text: `다들 "힘내요" 하고 말할 때마다
어찌할 바를 모르게 된다
"힘내요" 라고는 하지만
어떻게 힘을 내야 할지 알 수가 없다
힘을 낼 방법이 없어 슬퍼하고 있는데.`,
    soundUrl: WaveSet.LOREM_IPSUM,
  },
];

export const SPEECH_SET = [
  ...CHICK_EMOJI,
  ...QUAK_TEXT,
  ...LIFE_QUOTES,
  {
    text: '...',
  },
];
