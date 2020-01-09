window.addEventListener( 'load', init );

var imgPixels,
    img   = new Image(),
    shape = 'circle',
    gap   = 1,
    grid  = {},
    context,
    canvas;

function init() {
  var fileInput = document.getElementById( 'file' );
  canvas  = document.getElementById( 'canvas' );
  context = canvas.getContext( '2d' );
  canvas.width  = 700;
  canvas.height = 700;
  resetGrid();

  fileInput.addEventListener( 'change', getSource );
}

function start() {
  getImagePixels();
  generateGrid();
  drawPixelImage();
}

function resetGrid( list=['width', 'height', 'size', 'pixels'] ) {
  setGridArea();
  for( var i in list ) {
    switch( list[i] ) {
      case 'width' : grid.width  = 50; break;
      case 'height': grid.height = 50; break;
      case 'size'  : grid.size   = 8;  break;
      case 'pixels': grid.pixels = [];
    }
  }
  context.clearRect(0, 0, canvas.width, canvas.height );
}

function getSource(e) {
  img = new Image();
  resetGrid( ['pixels'] );
  // input  태그에 파일이 들어있는지 확인
  if ( this.files && this.files[0] ) {
      var reader = new FileReader();
      // URL형식의 파일을 이미지 객체로 전환시킨다

      reader.onload = function (e) {
        img.src = e.target.result;
      }
      reader.readAsDataURL( this.files[0] );
  }

  var count = 0;
  var retry = setInterval( function() {
    if( count++ > 10 ) {
      clearInterval( retry );
      alert( '이미지를 다시 선택해 주세요' );
      return;
    }
    if( img.width == 0 || img.height == 0 ) {
      return;
    }

    clearInterval( retry );
    start();
  }, 10 );
}

// 가로 또는 세로중 길이가 긴것을 기준으로 그리드를 생성한다
function setGridArea() {
  if( img.width && img.height )
    if( img.width > img.height )
      grid.height = Math.floor( ( img.height * grid.height ) / img.width );
    else
      grid.width  = Math.floor( ( img.width * grid.width ) / img.height );
  else {
    grid.width  = (grid.width > grid.height)? grid.width : grid.height;
    grid.height = grid.width;
  }
}



function generateGrid() {
  var Dot = function() {
    this.r = 0; // Red
    this.g = 0; // Green
    this.b = 0; // Blue
    this.a = 1; // Alpha
  }

  setGridArea();

  // 이미지의 픽셀값을 얻었는지 확인
  if( imgPixels.length && imgPixels.length > 0 ) {

    // 한 셀에 들어가는 이미지의 픽셀 수
    var colSize     = Math.floor( img.width / grid.width ),
        rowSize     = Math.floor( img.height / grid.height ),
        halfColSize = Math.floor( colSize / 2 ),
        halfRowSize = Math.floor( rowSize / 2 );

    for( var r=0,i=0; r<grid.height; r++ ) {  // row
      for( var c=0; c<grid.width; c++ ) { // col
        var p = new Dot(),
            // 곱하기 4는 r, g, b, a 값이 일렬로 배열을 이루고 있기 때문에,
            // 각 픽셀의 'red'값을 기준으로 계산하기 위해 4칸씩 뛴다.
            // 각 셀의 맨 첫번째( 왼쪽 위 )픽셀 위치
            rgbPos = ( c*colSize + r*rowSize*img.width ) * 4;
            // 가운데 위치를 선택하게끔 보정한다
            // rgbPos += ( halfColSize + halfRowSize*img.width ) * 4;

        p.r = imgPixels[rgbPos];
        p.g = imgPixels[rgbPos+1];
        p.b = imgPixels[rgbPos+2];
        grid.pixels[i++] = p;
      }
    }
  }
}

// 캔버스에 도트를 찍는다
function drawPixelImage() {
  context.clearRect(0, 0, canvas.width, canvas.height );
  // 이미지의 너비 / 높이가 없을경우 취소
  if( !( img.width && img.height ) )
    return;

  // 픽셀 그림을 그리기 시작하는 위치( 왼쪽 - 위 좌표 )
  var drawPos = {
      x: Math.floor( ( canvas.width - grid.width*grid.size - gap*grid.width ) / 2 )+0.5,
      y: Math.floor( ( canvas.height - grid.height*grid.size - gap*grid.height ) / 2 )+0.5
  },
      x = drawPos.x,
      y = drawPos.y,
      w = grid.size,
      i = 0,
      rad = w/2;

  for( var r=0; r<grid.height; r++ ) {
    for( var c=0; c<grid.width; c++ ) {
      var color = grid.pixels[i++];
      color = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
      context.beginPath();
      context.fillStyle = color;

      if( shape == 'square' )
        context.fillRect( x, y, w, w );
      else {
        context.arc( x, y, rad, 0, Math.PI*2 );
        context.fill();
      }

      x += grid.size + gap;
    }
    x = drawPos.x;
    y += grid.size + gap;
  }
}

function getImagePixels() {
  context.drawImage( img, 0, 0 );
  imgPixels = context.getImageData( 0, 0, img.width, img.height ).data;
  context.clearRect( 0, 0, img.width, img.height );
}

function updateSize( val ) {
  resetGrid();
  grid.width  = Math.floor( 400 / val );
  grid.height = Math.floor( 400 / val );
  grid.size   = Number( val );

  if( img.width && img.height ) {
    generateGrid();
    drawPixelImage();
  }
}

function updateGap( val ) {
  gap = Number( val );
  drawPixelImage();
}
