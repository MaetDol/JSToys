import Box from './Ascii/Box.mjs';
import CharacterMetrics from './utils/CharacterMetrics.mjs';

const asciiBox = new Box({w:35, h:5});
const editor = document.getElementById('editor').children[0];
editor.innerText = asciiBox.render();

const characterMetrics = new CharacterMetrics('Consolas');
const height = characterMetrics.getHeight() + 'px';
editor.style.setProperty('--height', height );
