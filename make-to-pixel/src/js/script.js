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

// 캔버스에 도트를 찍는다
function drawPixelImage() {
  fitImageToFrame(img, canvas.width, canvas.height);
  getImagePixels();
  
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
