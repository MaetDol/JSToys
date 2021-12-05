export function loadImageFromFile( file, callback ) {
	if( !file ) return;
	if( !/^image/.test(file.type) ) {
		throw new Error(
			'Please input image file', 
			{ cause: 'NOT_IMAGE_FILE' }
		);
	}

	const image = new Image();
	image.onload = function(...args) {
		if( callback ) callback(...args);
		URL.revokeObjectURL( image.src );
	};
	image.src = URL.createObjectURL( file );

	return image;
}