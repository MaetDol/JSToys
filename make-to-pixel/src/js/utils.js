
export function $(s) {
  return document.querySelector(s);
}

export function debounce( callback, pendingTime ) {
	let timerId = null;
	return function( ...args ) {
		clearTimeout(timerId);
		timerId = setTimeout( function () {
			callback(...args);
		}, pendingTime );
	};
}