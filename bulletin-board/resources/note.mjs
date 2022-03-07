import { createElement } from "./utils.mjs";

export default class NoteManager {
    constructor(listElement) {
        this.list = listElement;
        this.middlewares = [];
    }

    addMiddleware(fn) {
        this.middlewares.push(fn);
    }

    createNote(content) {
        let note = this._createNote(content);
        for(const middelware of this.middlewares) {
            note = middelware(note);
        }

        this.list.append(note);
        return note;
    }

    _createNote(content) {
        const li = createElement('li', {
            className: 'note'
        });
        const text = createElement('div', {
            className: 'content',
            textContent: content
        });
        const closeButton = createElement('button', {
            className: 'close',
            textContent: 'x',
            onclick: () => li.remove()
        });
        li.append(closeButton);
        li.append(text);

        return li;
    }

    static getContentNode(note) {
        return note.querySelector('.content');
    }
}