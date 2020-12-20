import Box from './Ascii/Box.mjs';
import CharacterMetrics from './utils/CharacterMetrics.mjs';

const asciiBox = new Box({w:35, h:5});
const editor = document.getElementById('editor').children[0];
editor.innerText = asciiBox.render();

const characterMetrics = new CharacterMetrics('Consolas');
const height = characterMetrics.getHeight() + 'px';
editor.style.setProperty('--height', height );

/*
  Renderer 따로 만들기?
  배열로 통쨰로 가지고 있고 바뀌는 부분 수정. 매번 join을 해야하나? 성능 문제
  마우스 호버? 오브젝트 클릭?
  영어가 아닌 문자?(너비가 1ch가 아님)
  Ascii resizing
*/