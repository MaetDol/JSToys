import { fitImageToFrame } from './image.js';

export default class Canvas {

	constructor({ canvas }) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.width = canvas.width;
		this.height = canvas.height;
	}

	resize(w, h) {
		this.canvas.width = w;
		this.cavnas.height = h;
	}

	clear() {
		this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
	}

	getPixels( image ) {
		this.clear();
		const img = fitImageToFrame( image, this.canvas.width, this.canvas.height );
		this.context.drawImage(
			img,
			0, 0, img.width, img.height
		);
		return this.context
			.getImageData( 0, 0, img.width, img.height )
			.data;
	}
}