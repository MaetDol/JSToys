import Box from './Ascii/Box.mjs';
import CharacterMatrix from '';

const characterMatrix = new CharacterMatrix('Consolas');

const asciiBox = new Box({w:35, h:5});
const editor = document.getElementById('editor').children[0];
editor.innerText = asciiBox.render();
