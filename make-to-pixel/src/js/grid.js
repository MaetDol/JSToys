import Kmeans from './k-means-js/index.js';

// rgba 를 표시하기 위해선 4개의 공간이 필요하다
const RGBA = 4;

export default class Grid {

	constructor({ width, height, gap }) {
		this.width = width;
		this.height = height;
		this.gap = gap;
	}

	calculateGridInfo( imageWidth, imageHeight, canvasWidth, canvasHeight ) {
		const CALCULATED_CELL_WIDTH = this.width + this.gap;
		const CALCULATED_CELL_HEIGHT = this.height + this.gap;

		this.columnCount = Math.floor( imageWidth / CALCULATED_CELL_WIDTH );
		this.rowCount = Math.floor( imageHeight / CALCULATED_CELL_HEIGHT );

    this.startX = Math.floor( 
			(canvasWidth - this.columnCount * CALCULATED_CELL_WIDTH + this.gap) / 2
		);
    this.startY = Math.floor( 
			(canvasHeight - this.rowCount * CALCULATED_CELL_HEIGHT + this.gap) / 2
		);
	}

	getGridColors( imageWidth, imageHeight, pixels ) {

		const kmeans = new Kmeans({ k:3, dimension:3 });
		const IMAGE_PIXEL_PER_ROW = imageWidth * RGBA;
		const CALCULATED_CELL_WIDTH = Math.floor( imageWidth / this.columnCount );
		const CALCULATED_CELL_HEIGHT = Math.floor( imageHeight / this.rowCount );
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
				const rightBottom = calculatedRightBottom > imageHeight * IMAGE_PIXEL_PER_ROW
					? imageHeight * IMAGE_PIXEL_PER_ROW - RGBA
					: calculatedRightBottom;

				const cellWidth = rightTop - leftTop;
				const leftBottom = rightBottom - cellWidth;

				const cellPixels = [];
				for( let top=leftTop; top < leftBottom; top+=IMAGE_PIXEL_PER_ROW ) {
					for( let left=0; left < cellWidth; left+=RGBA ) {
						const start = top + left;
						cellPixels.push([
							pixels[start],
							pixels[start+1],
							pixels[start+2],
						]);
					}
				}

				const [r, g, b] = kmeans
					.fit({ datas: cellPixels })
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

		return cells;
	}

}