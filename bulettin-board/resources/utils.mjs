export function getTargetClassInParent(element, targetClass) {
    let parent = element;
    while(parent !== null) {
        if(parent.classList.contains(targetClass)) {
            return parent;
        }
        parent = parent.parentElement;
    }
    return null;
}

export function getElement(selector) {
    return document.querySelector(selector);
}

export function createElement(tagName, options={}) {
    const element = document.createElement(tagName);
    for(const [attributeName, value] of Object.entries(options)) {
        element[attributeName] = value;
    }

    return element;
}

export function pickRandomColor() {
    const palette = [
        '#F2B33D',
        '#F2DBAE',
        '#D9A05B',

        '#F2B705',
        '#F2D785',
        '#F29F05',
        '#F2DAAC',
        '#F2F2F2',
    ];

    const randomIndex = randomInRange(0, palette.length);
    return palette[randomIndex];
}

export function randomInRange(start, end) {
    const range = end - start;
    return start + Math.floor(Math.random() * range);
}