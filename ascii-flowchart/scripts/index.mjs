import Box from './Ascii/Box.mjs';
import CharacterMetrics from './utils/CharacterMetrics.mjs';

const characterMetrics = new CharacterMetrics('Consolas');
console.log( characterMetrics.getHeight() );

const asciiBox = new Box({w:35, h:5});
const editor = document.getElementById('editor').children[0];
editor.innerText = asciiBox.render();
