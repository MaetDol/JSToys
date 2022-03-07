import { getTargetClassInParent } from "./utils.mjs";

export default class DragManager {
    draggingElement = null;
    distanceOfCursorAndElement = {};

    constructor(dragAreaElement, draggableClass='draggable') {
        this.draggableClass = draggableClass;

        this.onDragStartHandlers = [];
        this.onDragHandlers = [];
        this.onDragEndHandlers = [];

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

    onDragStart(fn) {
        this.onDragStartHandlers.push(fn);
    }

    onDrag(fn) {
        this.onDragHandlers.push(fn);
    }

    onDragEnd(fn) {
        this.onDragEndHandlers.push(fn);
    }

    startDragHandler(event) {
        this.draggingElement = getTargetClassInParent(event.target, this.draggableClass);
        if(!this.draggingElement) return;

        const clientRect = this.draggingElement.getBoundingClientRect();
        this.distanceOfCursorAndElement = {
            x: event.clientX - clientRect.x,
            y: event.clientY - clientRect.y
        };

        const startEvent = this.createEvent({
            target: this.draggingElement, 
            webEvent: event
        });
        this.runHandlers(this.onDragStartHandlers, startEvent);
    }

    dragHandler(event) {
        if(!this.draggingElement) return;

        this.draggingElement.style.left = 
            event.clientX - this.distanceOfCursorAndElement.x + 'px';
        this.draggingElement.style.top = 
            event.clientY - this.distanceOfCursorAndElement.y + 'px';

        const dragEvent = this.createEvent({
            target: this.draggingElement, 
            webEvent: event
        });
        this.runHandlers(this.onDragHandlers, dragEvent);
    }

    endDragHandler() {
        const draggedElement = this.draggingElement;
        this.draggingElement = null;
        this.distanceOfCursorAndElement = {};

        const endEvent = this.createEvent({target: draggedElement});
        this.runHandlers(this.onDragEndHandlers, endEvent);
    }

    createEvent(properties) {
        const event = properties;

        event.isPrevented = false;
        event.preventDefault = () => event.isPrevented = true;

        return event;
    }

    runHandlers(handlers, event) {
        for(const handler of handlers) {
            if(event.isPrevented) break;
            handler(event);
        }
    }
}