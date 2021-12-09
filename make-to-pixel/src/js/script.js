import Kmeans from './k-means-js/index.js';
import { fitImageToFrame, loadImageFromFile } from './image.js';
import Grid from './grid.js';
import Canvas from './canvas.js';

window.addEventListener( 'DOMContentLoaded', initLoad );

var imgPixels,
    img   = new Image(),
    shape = 'circle',
    gap   = 1,
    grid  = { size: 8 },
    context,
    canvas,
    preview = {}

function $(s) {
  return document.querySelector(s);
}

function initLoad() {
  const previewCanvas = new Canvas({ canvas: $('.image-preview') });
  const paletteCanvas = new Canvas({ canvas: $('#canvas') });

  const grid = new Grid({
    width: $('#sizeRange').valueAsNumber,
    height: $('#sizeRange').valueAsNumber,
    gap: $('#gapRange').valueAsNumber,
  });
  const setGap = event => {
    grid.gap = event.target.valueAsNumber;
    render();
  };
  const setSize = event => {
    grid.height = grid.width = $('#sizeRange').valueAsNumber;
    render();
  }

  let shape = $('[name="shape"]:checked').value;
  const setShape = event => {
    shape = event.target.checked
      ? event.target.value
      : shape;
    render();
  };
  
  let image = null;
  const onImageLoad = newImage => {
    image = newImage;
    render();
  };

  const render = () => {
    drawPixelImage({
      previewCanvas,
      paletteCanvas,
      image,
      grid,
      shape,
    });
  }

  $('#file').addEventListener('change', e => 
    fileChangeHandler( e.target.files[0], onImageLoad )
  );
  $('.input-file label').addEventListener('drop', e => {
    fileChangeHandler( e.dataTransfer.files[0], onImageLoad )
    e.stopPropagation();
    e.preventDefault();
  });

  $('#sizeRange').addEventListener( 'change', setSize );
  $('#gapRange').addEventListener('change', setGap );
  $('.radio-circle').addEventListener('change', setShape );
  $('.radio-square').addEventListener('change', setShape );

  // drag and drop 이벤트를 위한 초기화작업. 다른 drag이벤트들의
  // preventDefault와 stopPropagation을 진행해야 하는데
  // 왜인지 모르겠다 검색 필요
  ;(['dragenter', 'dragover', 'dragleave', 'drop']).forEach( e => {
    $('.input-file label').addEventListener( e, e => {
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

function fileChangeHandler( file, callback ) {
  try {
    loadImageFromFile( file, callback );
  } catch(e) {
    console.log(e)
    alert('이미지를 다시 선택해 주세요');
    return;
  }
}

// 캔버스에 도트를 찍는다
function drawPixelImage({ previewCanvas, paletteCanvas, image, grid, shape }) {
  const previewSize = fitImageToFrame(
    image, 
    previewCanvas.width, 
    previewCanvas.height
  );
  
  const canvasSize = fitImageToFrame(
    image,
    paletteCanvas.width,
    paletteCanvas.height
  );

  grid.calculateGridInfo( 
    canvasSize.width, canvasSize.height,
    paletteCanvas.width, paletteCanvas.height 
  );
  const colors = grid.getGridColors( 
    previewSize.width, 
    previewSize.height, 
    previewCanvas.getPixels( image )
  );

  paletteCanvas.drawCell({
    x: grid.startX,
    y: grid.startY,
    dotSize: grid.width,
    gap: grid.gap,
    rows: grid.rowCount,
    columns: grid.columnCount,
    dots: colors,
    shape: shape,
  });
}

function updateSize( event ) {
  grid.size = Number( event.target.value )

  if( imgIsLoaded() ) {
    drawPixelImage()
  }
}

function updateGap( event ) {
  gap = Number( event.target.value )

  if( imgIsLoaded() ) {
    drawPixelImage()
  }
}

function setToSquare() {
  shape = 'SQUARE'
  if( imgIsLoaded() ) {
    drawPixelImage()
  }
}

function setToCircle() {
  shape = 'CIRCLE'
  if( imgIsLoaded() ) {
    drawPixelImage()
  }
}

function imgIsLoaded() {
  return img != undefined 
    && ( img.width > 0 && img.height > 0 )
}
