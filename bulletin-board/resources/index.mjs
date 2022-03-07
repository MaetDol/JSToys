import DragManager from "./draggable.mjs";
import NoteManager from "./note.mjs";
import { getElement, pickRandomColor } from "./utils.mjs";

window.onload = () => {
    const DRAGGABLE_CLASS = 'draggable';
    const dragManager = new DragManager(document, DRAGGABLE_CLASS);

    const noteList = getElement('ul');
    const noteManager = new NoteManager(noteList);
    noteManager.addMiddleware(setTextIfContentIsEmpty);
    noteManager.addMiddleware(getClassAppender(DRAGGABLE_CLASS));
    noteManager.addMiddleware(setRandomBackground);

    const addNoteInput = getElement('form textarea');
    const addNoteForm = getElement('form');
    addNoteForm.addEventListener('submit', event => {
        event.preventDefault();
        noteManager.createNote(addNoteInput.value);
        addNoteInput.value = '';
    })
}

function setTextIfContentIsEmpty(elem) {
    const contentNode = NoteManager.getContentNode(elem);
    if(!contentNode.textContent) {
        contentNode.textContent = '메모가... 비어있군요.. 🤔';
    }
    return elem;
}

function getClassAppender(className) {
    return (elem) => {
        elem.classList.add(className);
        return elem;
    };
}

function setRandomBackground(elem) {
    elem.style.backgroundColor = pickRandomColor();
    return elem;
}