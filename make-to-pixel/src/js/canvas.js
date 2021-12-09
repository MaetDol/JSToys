import { fitImageToFrame } from './image.js';

export default class Canvas {

	constructor({ canvas, drawDotMethods=defaultMethods }) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.width = canvas.width;
		this.height = canvas.height;
		this.drawDotMethods = drawDotMethods;

		this.resize();
	}

	resize() {
		const { width, height } = this.canvas.getBoundingClientRect();
		this.width = this.canvas.width = width;
		this.height = this.canvas.height = height;
	}

	clear() {
		this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
	}

	getPixels( image ) {
		const { width, height } = 
			fitImageToFrame( image, this.canvas.width, this.canvas.height );

		this.clear();
		this.context.drawImage(
			image,
			0, 0, width, height
		);
		return this.context
			.getImageData( 0, 0, width, height )
			.data;
	}

	drawCell({ x, y, dotSize, gap, rows, columns, dots, shape }) {
		const startX = x;
		const cellSize = dotSize + gap;

		this.clear()
		for( let row_i=0, dot_i=0; row_i < rows; row_i++ ) {
			for( let column_i=0; column_i < columns; column_i++, dot_i++ ) {
				const { r, g, b, a } = dots[dot_i];
				this.context.beginPath()
				this.context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;

				this.drawDotMethods[shape]( this.context, x, y, dotSize );

				x += cellSize;
			}
			x = startX;
			y += cellSize;
		}
	}
}

const defaultMethods = {
	'SQUARE': ( context, x, y, w ) => context.fillRect( x, y, w, w ),
	'CIRCLE':	( context, x, y, w ) => {
		context.arc( x + w/2, y + w/2, w/2, 0, Math.PI*2 );
		context.fill();
	},
}