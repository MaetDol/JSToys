window.addEventListener( 'load', initLoad );

var imgPixels,
    img   = new Image(),
    info  = Symbol('info'),
    shape = 'circle',
    gap   = 1,
    grid  = {},
    sizeInput,
    gapInput,
    context,
    canvas,
    preview = {}

function initLoad() {
  const fileInput = document.getElementById('file')
  const fileWrap  = document.querySelector('.input-file label')
  canvas    = document.getElementById('canvas')
  context   = canvas.getContext('2d')
  sizeInput = document.getElementById('sizeRange')
  gapInput  = document.getElementById('gapRange')

  preview.canvas  = document.querySelector('.image-preview')
  preview.context = preview.canvas.getContext('2d')

  resizeCanvas()
  resetGrid()
  setToCircle()

  // dialog로 파일을 받았을 때 이벤트 처리
  fileInput.addEventListener('change', getSource )
  // drag and drop 이벤트를 위한 초기화작업. 다른 drag이벤트들의
  // preventDefault와 stopPropagation을 진행해야 하는데
  // 왜인지 모르겠다 검색 필요
  ;(['dragenter', 'dragover', 'dragleave', 'drop']).forEach( e => {
    fileWrap.addEventListener( e, e => {
      e.preventDefault()
      e.stopPropagation()
    })
  })
  fileWrap.addEventListener('drop', e => {
    let dt = e.dataTransfer
    getSource( {target: { files: dt.files }} )
  })
}

function resizeCanvas() {
  let boundingRect = canvas.getBoundingClientRect()
  canvas.width  = boundingRect.width
  canvas.height = boundingRect.height

  preview.canvas.width  = boundingRect.width
  preview.canvas.height = boundingRect.height
}

function init() {
  drawPixelImage()
}

function resetGrid( list=['size', 'pixels'] ) {
  for( var i in list ) {
    switch( list[i] ) {
      case 'size'  : grid.size   = 8; break
      case 'pixels': grid.pixels = []
    }
  }
  context.clearRect( 0, 0, canvas.width, canvas.height )
}

function getSource(e) {
  const files = e?.target?.files
  img = new Image()
  img[info] = {}

  resetGrid( ['pixels'] )
  // input 태그에 파일이 들어있는지 확인
  if( !( files && files[0] ) ) {
    return false
  }

  // File 인터페이스형식의 데이터를 DataURLs 형식으로 변환시킨다
  var reader = new FileReader()
  reader.onload = function (e) {
    img.src = e.target.result
  }
  reader.readAsDataURL( files[0] )

  // 로딩 기다리기. count 말고 readyState는 어떤지?
  var count = 0
  var retry = setInterval( function() {
    if( count++ > 10 ) {
      clearInterval( retry )
      alert( '이미지를 다시 선택해 주세요' )
      return
    }
    if( !imgIsLoaded() ) {
      return
    }

    clearInterval( retry )
    drawPixelImage()
  }, 10 )
}

function fitImageToCanvas() {
  // 이미지가 캔버스에 딱맞는 사이즈를 계산한다(contain)
  if( imgIsLoaded() ) {
    let w, h
    if( img.width > img.height ) {
      w = canvas.width
      h = img.height / img.width * canvas.width
    } else {
      w = img.width / img.height * canvas.height
      h = canvas.height
    }
    // 계산한 사이즈를 할당한 후 픽셀데이터를 얻는다
    img[info].width  = Math.floor( w )
    img[info].height = Math.floor( h )
    getImagePixels()
  }
}

// 도트로 만들기!
function generateGrid() {

  if( imgIsLoaded() ) {
    // 한 셀에 들어가는 픽셀 수 + 공백 너비
    let cellSize       = grid.size + gap,
        imgRowPixelLen = img[info].width * 4
    grid.rowLen = Math.floor( img[info].height / cellSize )
    grid.colLen = Math.floor( img[info].width / cellSize )
    // 그리드를 캔버스 가운데로 정렬한다
    grid.startX = Math.floor( (canvas.width  - grid.colLen*cellSize + gap) / 2)
    grid.startY = Math.floor( (canvas.height - grid.rowLen*cellSize + gap) / 2)

    for( let ri=0, gi=0; ri < grid.rowLen; ri++ ) {  // row
      for( let ci=0; ci < grid.colLen; ci++ ) { // col
        let r, g, b, a,
            // [r,g,b,a, r,g,b,a, r,g,b,a, ...]
            // 곱하기 4는 r, g, b, a 값이 반복되며 배열을 이루고 있기 때문에
            // 각 픽셀을 계산하기 위해 4칸씩 뛴다.
            // 각 셀의 맨 첫번째( 왼쪽 위 )픽셀 위치
            lt = ci*cellSize*4 + ri*cellSize*imgRowPixelLen,
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
        
        grid.pixels[gi++] = {r, g, b, a}
      }
    }
  }
}

// 캔버스에 도트를 찍는다
function drawPixelImage() {
  fitImageToCanvas()
  generateGrid()
  context.clearRect( 0, 0, canvas.width, canvas.height )
  if( !imgIsLoaded() ) {
    return;
  }

  // 그리기 시작하는 위치
  let x = grid.startX,
      y = grid.startY,
      w = grid.size,
      i = 0,
      cellSize = grid.size + gap,
      rad = w/2

  for( let r=0; r < grid.rowLen; r++ ) {
    for( let c=0; c < grid.colLen; c++ ) {
      let color = grid.pixels[i++]
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
    x = grid.startX
    y += cellSize
  }
}

function getImagePixels() {
  // 이미지를 늘려서 그린다
  preview.context.clearRect( 0, 0, canvas.width, canvas.height )
  preview.context.drawImage( 
    img, 
    0, 0, img.width,       img.height,
    0, 0, img[info].width, img[info].height )

  imgPixels = 
    preview.context
    .getImageData( 0, 0, img[info].width, img[info].height )
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
