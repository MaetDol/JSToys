const WAV = './resources/wav';
const WaveSet = {
  BEEP_BOO: `${WAV}/duck-beep-boo.wav`,
  CONFIDENT: `${WAV}/duck-confident.wav`,
  LIGHT: `${WAV}/duck-light.wav`,
  LISTLESS: `${WAV}/duck-listless.wav`,
  PINCH: `${WAV}/duck-pinch.wav`,
  SIGH: `${WAV}/duck-sigh.wav`,
  TALK: `${WAV}/duck-talk.wav`,
};

const CHICK_EMOJI = [
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

export const SPEECH_SET = [
  ...CHICK_EMOJI,
  ...QUAK_TEXT,
  {
    text: '...',
  },
];
