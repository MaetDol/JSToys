import Canvas from './canvas.js';
import Grid from './grid.js';
import { fitImageToFrame, loadImageFromFile } from './image.js';
import { $, debounce } from './utils.js';

window.addEventListener( 'DOMContentLoaded', initLoad );

function initLoad() {
  const previewCanvas = new Canvas({ canvas: $('.image-preview') });
  const paletteCanvas = new Canvas({ canvas: $('#canvas') });

  const grid = new Grid({
    width: $('#sizeRange').valueAsNumber,
    height: $('#sizeRange').valueAsNumber,
    gap: $('#gapRange').valueAsNumber,
  });
  $('.gap p span').innerText = $('#gapRange').valueAsNumber;
  $('.size p span').innerText = $('#sizeRange').valueAsNumber;

  const setGap = event => {
    $('.gap p span').innerText = 
      grid.gap = event.target.valueAsNumber;
    render();
  };
  const setSize = event => {
    $('.size p span').innerText = 
      grid.height = grid.width = event.target.valueAsNumber;
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

  const render = debounce(() => {
    if( !image ) return;

    drawPixelImage({
      previewCanvas,
      paletteCanvas,
      image,
      grid,
      shape,
    });
  }, 200);

  $('#sizeRange').addEventListener( 'change', setSize );
  $('#gapRange').addEventListener('change', setGap );
  $('.radio-circle').addEventListener('change', setShape );
  $('.radio-square').addEventListener('change', setShape );

  $('#file').addEventListener('change', e => 
    fileChangeHandler( e.target.files[0], onImageLoad )
  );
  window.addEventListener('drop', e => {
    fileChangeHandler( e.dataTransfer.files[0], onImageLoad )
  });
  ['dragover', 'drop'].forEach( e => {
    window.addEventListener( e, e => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  document.addEventListener('paste', e => {
    const file = e.clipboardData.files[0];
    if( !file ) return;
    fileChangeHandler( file, onImageLoad );
  });

  window.addEventListener('resize', debounce(() => {
    previewCanvas.resize();
    paletteCanvas.resize();
    render();
  }, 100));
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
