import Kmeans from './k-means-js/index.js';
import { fitImageToFrame, loadImageFromFile } from './image.js';
import Grid from './grid.js';

window.addEventListener( 'DOMContentLoaded', initLoad );

var imgPixels,
    img   = new Image(),
    shape = 'circle',
    gap   = 1,
    grid  = {},
    sizeInput,
    gapInput,
    context,
    canvas,
    preview = {}

function $(s) {
  return document.querySelector(s);
}

function initLoad() {
  const fileInput = $('#file')
  const fileWrap  = $('.input-file label')
  canvas    = $('#canvas')
  context   = canvas.getContext('2d')
  sizeInput = $('#sizeRange')
  gapInput  = $('#gapRange')

  preview.canvas  = $('.image-preview')
  preview.context = preview.canvas.getContext('2d')

  sizeRange.addEventListener( 'change', updateSize );
  gapInput.addEventListener('change', updateGap );
  $('.radio-circle').addEventListener('change', setToCircle );
  $('.radio-square').addEventListener('change', setToSquare );

  resizeCanvas()
  resetGrid()
  setToCircle()

  fileInput.addEventListener('change', e => 
    fileChangeHandler( e.target.files[0] )
  );
  fileWrap.addEventListener('drop', e => 
    fileChangeHandler( e.dataTransfer.files[0] )
  );

  // drag and drop 이벤트를 위한 초기화작업. 다른 drag이벤트들의
  // preventDefault와 stopPropagation을 진행해야 하는데
  // 왜인지 모르겠다 검색 필요
  ;(['dragenter', 'dragover', 'dragleave', 'drop']).forEach( e => {
    fileWrap.addEventListener( e, e => {
      e.preventDefault()
      e.stopPropagation()
    })
  })
}

// moved
function resizeCanvas() {
  let boundingRect = canvas.getBoundingClientRect()
  canvas.width  = boundingRect.width
  canvas.height = boundingRect.height

  preview.canvas.width  = boundingRect.width
  preview.canvas.height = boundingRect.height
}

function resetGrid( list=['size', 'pixels'] ) {
  for( var item of list ) {
    switch( item ) {
      case 'size'  : grid.size   = 8; break
      case 'pixels': grid.pixels = []
    }
  }
  context.clearRect( 0, 0, canvas.width, canvas.height )
}

function fileChangeHandler( file ) {
  try {
    img = loadImageFromFile( file, () => {
      resetGrid( ['pixels'] )
      drawPixelImage();
    });
  } catch(e) {
    console.log(e)
    alert('이미지를 다시 선택해 주세요');
    return;
  }
}

// 도트로 만들기!
function generateGrid() {

  if( imgIsLoaded() ) {
    
    const kmeans = new Kmeans({ k:3, dimension:3 });
    
    // 한 셀에 들어가는 픽셀 수 + 공백 너비
    let cellSize       = grid.size + gap,
        imgRowPixelLen = img.width * 4
    grid.rowLen = Math.floor( img.height / cellSize )
    grid.colLen = Math.floor( img.width / cellSize )
    // 그리드를 캔버스 가운데로 정렬한다
    grid.startX = Math.floor( (canvas.width  - grid.colLen*cellSize + gap) / 2)
    grid.startY = Math.floor( (canvas.height - grid.rowLen*cellSize + gap) / 2)

    for( let ri=0, gi=0; ri < grid.rowLen; ri++ ) {  // row
      for( let ci=0; ci < grid.colLen; ci++ ) { // col
            // [r,g,b,a, r,g,b,a, r,g,b,a, ...]
            // 곱하기 4는 r, g, b, a 값이 반복되며 배열을 이루고 있기 때문에
            // 각 픽셀을 계산하기 위해 4칸씩 뛴다.
            // 각 셀의 맨 첫번째( 왼쪽 위 )픽셀 위치
        let lt = ci*cellSize*4 + ri*cellSize*imgRowPixelLen,
            // Right top
            rt = lt + (grid.size-1)*4
        // 오른쪽 위 좌표가 이미지 밖일경우 재조정한다
        rt = lt % imgRowPixelLen >= rt % imgRowPixelLen ?
          rt - (rt % imgRowPixelLen) : rt
        // Right bottom
        let rb = rt + (grid.size-1)*imgRowPixelLen
        // 오른쪽 아래 좌표가 이미지 밖일경우 재조정한다
        rb = rb / (imgRowPixelLen*cellSize) >= grid.rowLen ?
          rt % imgRowPixelLen + (grid.rowLen-1)*cellSize*imgRowPixelLen : rb
        // Left bottom
        let lb = rb - (rt-lt)

        const pixels = [];
        for( let top=0; top < grid.size; top++ ) {
          const row = imgRowPixelLen * top;
          for( let left=0; left < rt - lt; left+=4 ) {
            const start = lt + row + left
            pixels.push([
              imgPixels[start],
              imgPixels[start+1],
              imgPixels[start+2],
            ])
          }
        }
        kmeans.datas = pixels;
        const [r, g, b] = kmeans
          .fit()
          .reduce((result, color, idx) => {
            const scale = kmeans.classifications[idx].length;
            return result.scale > scale
              ? result
              : {color, scale};
          }, {scale: -1})
          .color
          .map( v => parseInt(v) );

        /*
        // 네 모서리의 평균값을 해당 셀 색으로 지정한다
        r = Math.floor(( 
          imgPixels[lt]   + imgPixels[rt] + 
          imgPixels[lb]   + imgPixels[rb] ) /4 )
        g = Math.floor(( 
          imgPixels[lt+1] + imgPixels[rt+1] + 
          imgPixels[lb+1] + imgPixels[rb+1] ) /4 )
        b = Math.floor(( 
          imgPixels[lt+2] + imgPixels[rt+2] + 
          imgPixels[lb+2] + imgPixels[rb+2] ) /4 )
        a = Math.floor(( 
          imgPixels[lt+3] + imgPixels[rt+3] + 
          imgPixels[lb+3] + imgPixels[rb+3] ) /4 )

        // 예외처리
        r = isNaN(r) ? 255 : r
        g = isNaN(g) ? 255 : g
        b = isNaN(b) ? 255 : b
        a = isNaN(a) ? 1   : a
        */
        
        grid.pixels[gi++] = {r, g, b, a: 255}
      }
    }
  }
}

// 캔버스에 도트를 찍는다
function drawPixelImage() {
  fitImageToFrame(img, canvas.width, canvas.height);
  getImagePixels();
  
  generateGrid()
  const gridd = new Grid({ width: grid.size, height: grid.size, gap });
  gridd.calculateGridInfo({ canvas, image: img });

  context.clearRect( 0, 0, canvas.width, canvas.height )
  if( !imgIsLoaded() ) {
    return;
  }

  // 그리기 시작하는 위치
  let x = gridd.startX,
      y = gridd.startY,
      w = gridd.width,
      i = 0,
      cellSize = gridd.width + gridd.gap,
      rad = w/2

  img.pixels = imgPixels;
  const colors = gridd.getGridColors( img );

  for( let r=0; r < gridd.rowCount; r++ ) {
    for( let c=0; c < gridd.columnCount; c++ ) {
      let color = colors[i++];
      context.beginPath()
      context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`

      if( shape == 'square' ) {
        context.fillRect( x, y, w, w )
      } else {
        context.arc( x+w/2, y+w/2, rad, 0, Math.PI*2 )
        context.fill()
      }
     
      x += cellSize
    }
    x = gridd.startX
    y += cellSize
  }
}

function getImagePixels() {
  // 이미지를 늘려서 그린다
  preview.context.clearRect( 0, 0, canvas.width, canvas.height )
  preview.context.drawImage( 
    img, 
    0, 0, img.width, img.height )

  imgPixels = 
    preview.context
    .getImageData( 0, 0, img.width, img.height )
    .data
}

function updateSize() {
  resetGrid()
  grid.size = Number( sizeInput.value )

  if( imgIsLoaded() ) {
    drawPixelImage()
  }
}

function updateGap() {
  gap = Number( gapInput.value )
  updateSize()
}

function setToSquare() {
  shape = 'square'
  if( imgIsLoaded() ) {
    drawPixelImage()
  }
}

function setToCircle() {
  shape = 'circle'
  if( imgIsLoaded() ) {
    drawPixelImage()
  }
}

function imgIsLoaded() {
  return img != undefined 
    && ( img.width > 0 && img.height > 0 )
}
