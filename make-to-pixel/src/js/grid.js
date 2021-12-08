import Kmeans from './k-means-js/index.js';

// rgba 를 표시하기 위해선 4개의 공간이 필요하다
const RGBA = 4;

export default class Grid {

	constructor({ width, height, gap }) {
		this.width = width;
		this.height = height;
		this.gap = gap;
	}

	calculateCellInfo( image ) {
		const CALCULATED_CELL_WIDTH = this.width + this.gap;
		const CALCULATED_CELL_HEIGHT = this.height + this.gap;

		this.columnCount = Math.floor( image.width / CALCULATED_CELL_WIDTH );
		this.rowCount = Math.floor( image.height / CALCULATED_CELL_HEIGHT );
	}

	calculateStartPosition( canvas ) {
		const CALCULATED_CELL_WIDTH = this.width + this.gap;
		const CALCULATED_CELL_HEIGHT = this.height + this.gap;

    this.startX = Math.floor( 
			(canvas.width - this.columnCount * CALCULATED_CELL_WIDTH + this.gap) / 2
		);
    this.startY = Math.floor( 
			(canvas.height - this.rowCount * CALCULATED_CELL_HEIGHT + this.gap) / 2
		);
	}

	calculateGridInfo({ canvas, image }) {
		this.calculateCellInfo( image );
		this.calculateStartPosition( canvas );
	}

	getGridColors( image ) {

		this.calculateCellInfo( image );

		const kmeans = new Kmeans({ k:3, dimension:3 });
		const IMAGE_PIXEL_PER_ROW = image.width * RGBA;
		const CALCULATED_CELL_WIDTH = this.width + this.gap;
		const CALCULATED_CELL_HEIGHT = this.height + this.gap;
		const cells = [];

		for( let row_i=0; row_i < this.rowCount; row_i++) {
			for( let column_i=0; column_i < this.columnCount; column_i++ ) {

				const leftTop = 
					column_i * CALCULATED_CELL_WIDTH * RGBA 
					+ row_i * CALCULATED_CELL_HEIGHT * IMAGE_PIXEL_PER_ROW;
					
				const calculatedRightTop = leftTop + (this.width-1) * RGBA;
				const rightTop = calculatedRightTop % IMAGE_PIXEL_PER_ROW < leftTop % IMAGE_PIXEL_PER_ROW
					? calculatedRightTop - (calculatedRightTop % IMAGE_PIXEL_PER_ROW)
					: calculatedRightTop;

				const calculatedRightBottom = rightTop + (this.height-1) * IMAGE_PIXEL_PER_ROW;
				const rightBottom = calculatedRightBottom > image.height * IMAGE_PIXEL_PER_ROW
					? image.height * IMAGE_PIXEL_PER_ROW - RGBA
					: calculatedRightBottom;

				const cellWidth = rightTop - leftTop;
				const leftBottom = rightBottom - cellWidth;

				const pixels = [];
				for( let top=leftTop; top < leftBottom; top+=IMAGE_PIXEL_PER_ROW ) {
					for( let left=0; left < cellWidth; left+=RGBA ) {
						const start = top + left;
						pixels.push([
							image.pixels[start],
							image.pixels[start+1],
							image.pixels[start+2],
						]);
					}
				}

				const [r, g, b] = kmeans
					.fit({ datas: pixels })
					.reduce((largestCluster, cluster, i) => {
						const scale = kmeans.classifications[i].length;
						return largestCluster.scale > scale
							? largestCluster
							: { rgb: cluster, scale };
					}, {scale: -1})
					.rgb
					.map( v => parseInt(v) );
				
				cells.push({r, g, b, a:255});
			}
		}

		this.pixels = cells;
		return cells;
	}

}