export function loadImage( event, callback ) {
	const file = event?.target?.files?.[0];
	if( !file ) return;
	if( !/^image/.test(file.type) ) {
		throw new Error(
			'Please input image file', 
			{ cause: 'NOT_IMAGE_FILE' }
		);
	}

	const image = new Image();
	image.onload = function(...args) {
		callback(...args);
		URL.revokeObjectURL( image.src );
	};
	image.src = URL.createObjectURL( file );

	return image;
}