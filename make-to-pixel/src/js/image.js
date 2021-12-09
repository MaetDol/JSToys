export function loadImageFromFile( file, callback ) {
	if( !file ) return;
	if( !/^image/.test(file.type) ) {
		throw new Error(
			'Please input image file', 
			{ cause: 'NOT_IMAGE_FILE' }
		);
	}

	const image = new Image();
	image.onload = function( ...args ) {
		if( callback ) callback( image, ...args );
		URL.revokeObjectURL( image.src );
	};
	image.src = URL.createObjectURL( file );

	return image;
}

export function fitImageToFrame(image, frameWidth, frameHeight) {
	// 이미지가 가로로 넓을 경우
	// 이미지 가로의 너비를 프레임 너비에 맞추고
	// 높이를 비율에 맞게 늘린다
	const w = image.width > image.height
		? frameWidth
		: image.width / image.height * frameWidth;

	const h = image.width > image.height
		? image.height / image.width * frameHeight
		: frameHeight;

	return {
		width: Math.floor( w ), 
		height: Math.floor( h )
	};
}