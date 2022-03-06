import { getTargetClassInParent } from "./utils.mjs";

export default class DragManager {
    draggingElement = null;
    distanceOfCursorAndElement = {};

    constructor(dragAreaElement, draggableClass='draggable') {
        this.draggableClass = draggableClass;

        dragAreaElement.addEventListener(
            'mousedown', 
            this.startDragHandler.bind(this)
        );
        dragAreaElement.addEventListener(
            'mousemove', 
            this.dragHandler.bind(this)
        );
        dragAreaElement.addEventListener(
            'mouseup', 
            this.endDragHandler.bind(this)
        );
}

    startDragHandler(event) {
        this.draggingElement = getTargetClassInParent(event.target, this.draggableClass);
        if(!this.draggingElement) return;

        const clientRect = this.draggingElement.getBoundingClientRect();
        this.distanceOfCursorAndElement = {
            x: event.clientX - clientRect.x,
            y: event.clientY - clientRect.y
        };
    }

    dragHandler(event) {
        if(!this.draggingElement) return;

        this.draggingElement.style.left = 
            event.clientX - this.distanceOfCursorAndElement.x + 'px';
        this.draggingElement.style.top = 
            event.clientY - this.distanceOfCursorAndElement.y + 'px';
    }

    endDragHandler() {
        this.draggingElement = null;
        this.distanceOfCursorAndElement = {};
    }
}