class Shape {

  constructor(i) {
    for( let attr in i ) {
      this[attr] = i[attr]
    }
    
    if( i.color == undefined ) {
      this.color = 'rgba(0,0,0,0)'
    }
    if( typeof i.color === 'string' ) {
      this.setColor( this.color )
    }
    

    if( i.doFill === Shape.FILL ) {
      this.fillOrStroke = ctx => {
        ctx.fillStyle = this.color
        ctx.fill()
      }
    } else {
      if( i.lineCap == undefined ) {
        this.lineCap = 'butt'
      }
      this.fillOrStroke = ctx => { 
        ctx.strokeStyle = this.color
        ctx.lineWidth   = this.lineWidth
        ctx.lineCap     = this.lineCap
        ctx.stroke() 
      }
    }
    
    if( i.depth == undefined ) {
      this.depth = 0
    }
    
    if( i.shadow != undefined ) {
      this.shadow.color = stringColorToObject( i.shadow.color )
    }
    
  }

  beforeDraw( ctx ) {
    ctx.beginPath()
    if( this.shadow != undefined ) {
      ctx.shadowColor   = objectToRgba( this.shadow.color )
      ctx.shadowBlur    = this.shadow.blur
      ctx.shadowOffsetX = this.shadow.offsetX
      ctx.shadowOffsetY = this.shadow.offsetY
    } else {
      ctx.shadowColor = 'transparent'
    }
  }

  draw() {
    return
  }

  afterDraw( ctx ) {
    this.fillOrStroke( ctx )
    ctx.closePath()
  }
  
  isCollision() {
    return false
  }
  
  setColor( str ) {
    this.color = str
    this.colorObject = stringColorToObject( str )
  }
}
Shape.FILL       = 4
Shape.STROKE     = 5

class Sector extends Shape {

  constructor(i) {
    super(i)
    this.startAngle       = (i.startAngle - 90) / 180 * Math.PI
    this.endAngle         = (i.endAngle   - 90) / 180 * Math.PI
    this.originStartAngle = i.startAngle / 180 * Math.PI
    this.originEndAngle   = i.endAngle   / 180 * Math.PI
    this.rSquared         = i.r * i.r
  }

  draw( ctx ) {

    ctx.moveTo( this.x, this.y )
    ctx.arc(
      this.x, this.y, this.r,
      this.startAngle, this.endAngle,
      false )
  }
  
  isCollision(x, y) {
    let cx = x - this.x,
        cy = y - this.y
    let dis = cx*cx + cy*cy
    if( dis > this.rSquared ) {
      return false
    }
    
    let mouseRadian = toPositiveRadian( Math.atan2(cy, cx) + Math.PI/2 )
    return this.originStartAngle <= mouseRadian
        && this.originEndAngle   >= mouseRadian
  }
}

class Circle extends Sector {
  
  constructor(i) {
    super(i)
    this.startAngle       = 0
    this.endAngle         = Math.PI * 2
    this.originStartAngle = 0
    this.originEndAngle   = 360
  }
}

class Rectangle extends Shape {

  draw( ctx ) {
    ctx.rect(
      this.x, this.y,
      this.w, this.h )
  }
}

class Stroke extends Shape {
  
  constructor(i) {
    super(i)
    for( let i in this.points ) {
      this.points[i] = {
        x: this.points[i].x + this.x,
        y: this.points[i].y + this.y
      }
    }
    this.doFill = Shape.STROKE
  }
  
  draw( ctx ) {
    ctx.moveTo( this.x, this.y )
    for( let i in this.points ) {
      let p = this.points[i]
      ctx.lineTo( p.x, p.y )
    }
  }
}

class Text extends Shape {
  
  constructor(i) {
    super(i)
    if( i.doFill === Shape.FILL ) {
      this.fillOrStroke = ctx => {
        ctx.fillStyle = this.color
        ctx.fillText( this.text, this.x, this.y )
      }
    } else {
      if( i.lineCap == undefined ) {
        this.lineCap = 'butt'
      }
      this.fillOrStroke = ctx => { 
        ctx.strokeStyle = this.color
        ctx.lineWidth   = this.lineWidth
        ctx.lineCap     = this.lineCap
        ctx.strokeText( this.text, this.x, this.y )
      }
    }
  }
  
  draw( ctx ) {
    ctx.textBaseline = 'middle'
    ctx.font = this.font.size + ' ' + this.font.family
  }
}

class Tooltip extends Shape {
  
  constructor(i) {
    super(i)
    
    this.tooltip = {}
    let id   = undefined,
        base = {
          doFill: Shape.FILL,
          color:  '#04081f',
          depth:  5,
          shadow: {
            color:   'rgba(0,0,0,0.3)',
            blur:    12,
            offsetX: 2,
            offsetY: 2
          }
        }
    
    if( i.font == undefined ) {
      i.font    = {}
      this.font = {}
    }
    this.labelGap    = 4
    this.textPadding = 32
    this.textHeight  = !i.font.size   ? 30           : i.font.size
    this.font.family = !i.font.family ? 'sans-serif' : i.font.family
    this.font.size   = this.textHeight
    this.line        = {w:2,   h:120, maxHeight: 120}
    this.box         = {w:120, h:40}
    this.maxHeight   = this.line.maxHeight + this.textHeight + this.labelGap

    // tooltip point
    id = i.canvas.createCircle({
      ...base, shadow: {...base.shadow},
      r: 6
    })
    this.tooltip.point = i.canvas.getObject(id)
    
    // tooltip extension line
    id = i.canvas.createRect({
      ...base, shadow: {...base.shadow}
    })
    this.tooltip.line = i.canvas.getObject(id)
    
    // tooltip box
    id = i.canvas.createRect({
      ...base, shadow: {...base.shadow}
    })
    this.tooltip.box = i.canvas.getObject(id)
    
    // tooltip text
    id = i.canvas.createText({
      ...base, shadow: {...base.shadow},
      color: "#ebebf3",
      font: {
        family: this.font.family,
        size:   this.font.size
      }
    })
    this.tooltip.text = i.canvas.getObject(id)
    
    // tooltip label background
    id = i.canvas.createRect({
      ...base, shadow: {...base.shadow},
      color: "rgba(248,248,253,0.8)"
    })
    this.tooltip.labelBackground = i.canvas.getObject(id)
    
    // tooltip label
    id = i.canvas.createText({
      ...base, shadow: {...base.shadow},
      color: "rgb(33,33,48)",
      font: {
        family: this.font.family,
        size:   this.font.size
      }
    })
    this.tooltip.label = i.canvas.getObject(id)
    
    this.setText( i.text )
    this.setLabel( i.label )
    this.setPosition( i.x, i.y )
  }
  
  setPosition(x, y) {
    
    this.x = x
    this.y = y
    
    this.tooltip.point.x = x
    this.tooltip.point.y = y
    
    if( y < this.maxHeight ) {
      this.line.h = y - this.textHeight - this.labelGap
    } else {
      this.line.h = this.line.maxHeight
    }
    this.tooltip.line.x = x - this.line.w/2
    this.tooltip.line.y = y - this.line.h
    this.tooltip.line.w = this.line.w
    this.tooltip.line.h = this.line.h
    
    this.tooltip.box.x  = x - this.box.w*0.3
    this.tooltip.box.y  = y - this.line.h
    
    this.tooltip.text.x = this.tooltip.box.x + this.box.w/2 - this.textWidth/2
    this.tooltip.text.y = this.tooltip.box.y + this.box.h/2
    
    this.tooltip.label.x = this.tooltip.box.x
    this.tooltip.label.y = this.tooltip.box.y + this.box.h/2 - this.labelGap - this.textHeight
    
    this.tooltip.labelBackground.x = this.tooltip.box.x
    this.tooltip.labelBackground.y = this.tooltip.box.y - this.labelGap - this.tooltip.labelBackground.h
  }
  
  setText( str ) {
    str = str.toString()
    this.canvas.context.textBaseline = 'middle'
    this.canvas.context.font = 
      `${this.font.size}px ${this.font.family}`
    this.textWidth = this.canvas.context.measureText( str ).width
    this.box.w = this.textWidth + this.textPadding * 2
    this.box.h = this.textHeight + 4
    
    this.tooltip.box.w  = this.textWidth + this.textPadding*2
    this.tooltip.box.h  = this.box.h
    
    this.tooltip.text.x = this.tooltip.box.x + this.box.w/2 - this.textWidth/2
    this.tooltip.text.y = this.tooltip.box.y + this.box.h/2
    
    this.tooltip.text.text = str
  }
  
  setLabel( str ) {
    this.canvas.context.textBaseline = 'middle'
    this.canvas.context.font = 
      `${this.tooltip.text.font.size} ${this.tooltip.text.font.family}`
    this.labelWidth = this.canvas.context.measureText( str ).width
    
    this.tooltip.labelBackground.w = this.labelWidth
    this.tooltip.labelBackground.h = this.textHeight
    
    this.tooltip.label.text = str
  }
  
  hide() {
    for( let k in this.tooltip ) {
      this.tooltip[k].display = false
    }
    this.display = false
  }
  
  show() {
    for( let k in this.tooltip ) {
      this.tooltip[k].display = true
    }
    this.display = true
  }
  
  draw() {
    return
  }
}

class Canvas {

  constructor( canvas, w, h ) {
    if( canvas == undefined ) {
      canvas = document.createElement('canvas')
    }
    canvas.width  = w
    canvas.height = h

    this.self    = canvas
    this.context = canvas.getContext('2d')
    this.objects = []
  }

  setSize(w, h) {
    this.self.width  = w
    this.self.height = h
  }

  createSector(i) {
    let obj = new Sector(i)
    return this.addObject( obj )
  }
  
  createCircle(i) {
    let obj = new Circle(i)
    return this.addObject( obj )
  }

  createRect(i) {
    let obj = new Rectangle(i)
    return this.addObject( obj )
  }
  
  createStroke(i) {
    let obj = new Stroke(i)
    return this.addObject( obj )
  }
  
  createText(i) {
    let obj = new Text(i)
    return this.addObject( obj )
  }

  addObject( obj ) {
    let d = obj.depth
    if( this.objects[d] == undefined ) {
      this.objects[d] = []
    }
    let i = this.objects[d].push( obj ) - 1
    return `${d}.${i}`
  }

  getObject( id ) {
    let depth, idx
    [depth, idx] = id.split('.')
    return this.objects[depth][idx]
  }

  draw() {
    this.context.clearRect( 0, 0, this.self.width, this.self.height )
    for( let d in this.objects ) {
      let objsAtSameDepth = this.objects[d]
      for( let i in objsAtSameDepth ) {
        let obj = objsAtSameDepth[i]
        if( obj.display === false ) {
          continue
        }

        obj.beforeDraw( this.context )
        obj.draw(       this.context )
        obj.afterDraw(  this.context )
      }
    }
    if( this.doAnimate ) {
      requestAnimationFrame( this.draw.bind(this) )
    }
  }
}
Canvas.CIRCLE		  = 1
Canvas.SECTOR		  = 2
Canvas.RECTANGLE	= 3

const REGEX_TYPE = /^(hsla?|#|rgba?|\w+)/
const REGEX_HEX  = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/
const REGEX_RGBA = /^rgba?\((\d+),(\d+),(\d+),?(\d(\.\d+)?)?\)$/
const REGEX_HSLA = /^hsla?\((\d+),(\d+)%,(\d+)%,?(\d(\.\d+)?)?\)$/
function stringColorToObject( str ) {
  str = str.replace(/\s/g, '')
  str = str.toLowerCase()
  
  const type = str.match( REGEX_TYPE ) 
  if( type == null ) {
    return false
  }
  
  let r, g, b, a, _
  switch( type[0] ) {
    case '#':
      // #FFF or #FFFF
      if( str.length < 7 ) {
        ;[r, g, b, a] = hexToDecimal( 
          str[1]+str[1], 
          str[2]+str[2], 
          str[3]+str[3],
          str[4]+str[4] )
      } else {
        ;[_, r, g, b, a] = hexToDecimal( 
          ...str.match( REGEX_HEX ) )
      }
      a = a / 255
      break
    case 'hsl':
    case 'hsla':
      /*
        You can get information about converting RGB <-> HSL below blog post.
        http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
      */
      let h, s, l
      ;[_, h, s, l, a] = stringsToDecimal( 
        ...str.match( REGEX_HSLA ))

      s = s / 100
      l = l / 100
      h = h / 360
      // It's gray.
      if( s === 0 ) {
        r=g=b = Math.round( l * 255 )
      } else {
        let t1 = l < 0.5 ? l*(1+s) : l+s-(l*s)
        let t2 = 2*l - t1
        let tmp_r = between0_1( h + 0.333 ),
            tmp_g = between0_1( h ),
            tmp_b = between0_1( h - 0.333 )
        r = hueToRgb( tmp_r, t1, t2 )
        g = hueToRgb( tmp_g, t1, t2 )
        b = hueToRgb( tmp_b, t1, t2 )
      }
      break
    case 'rgb':
    case 'rgba':
      ;[_, r, g, b, a] = str.match( REGEX_RGBA )
      ;[r, g, b, a] = stringsToDecimal( r, g, b, a )
      break
    default:
      // It's color names! yet can't parsing it.
      return stringColorToObject('#FFF')
  }
  
  return {
    r, g, b,
    a: isNaN(a) ? 1 : a
  }
}

function objectToRgba(obj) {
  return `rgba(${obj.r}, ${obj.g}, ${obj.b}, ${obj.a})`
}

function hexToDecimal( ...hexes ) {
  const r = []
  for( let i in hexes ) {
    r[i] = parseInt( hexes[i], 16 )
  }
  return r
}

function stringsToDecimal( ...strs ) {
  const r = []
  for( let i in strs ) {
    r[i] = parseFloat( strs[i] )
  }
  return r
}

function between0_1(f) {
  while(f<0) f++
  while(f>1) f--
  return f
}

function hueToRgb(h, a, b) {
  let val
  if     ( h*6 < 1 ) val = b + (a - b) * 6 * h
  else if( h*2 < 1 ) val = a
  else if( h*3 < 2 ) val = b + (a - b) * (0.666 - h) * 6
  else               val = b
  return Math.round( val * 255 )
}

function toRadian( degree ) {
  return (degree - 90) / 180 * Math.PI
}

function toDegree( radian ) {
  return radian*180/Math.PI
}

const PI_2_TIMES = Math.PI * 2
function toPositiveRadian( rad ) {
  return (rad + PI_2_TIMES) % PI_2_TIMES
}

function generatePieChart(d) {
  const bgColor     = '#FFF'
  const shadowColor = 'rgba(0,0,0,0.3)'

  let pies       = [],
      dataSum    = 0,
      startColor = {},
      endColor   = {},
      colorDiff  = {}
  // If color provide via root object
  if( d.color !== undefined ) {
    if( d.color.from === undefined ) {
      startColor = stringColorToObject( d.color )
      endColor   = {
        r: (startColor.r + 170) % 256,
        g: (startColor.g + 160) % 256,
        b: (startColor.b + 190) % 256,
        a: startColor.a
      }
    } else {
      startColor = stringColorToObject( d.color.from )
      endColor   = stringColorToObject( d.color.to )
    }
    colorDiff = {
      r: Math.floor( (endColor.r - startColor.r) / d.values.length ),
      g: Math.floor( (endColor.g - startColor.g) / d.values.length ),
      b: Math.floor( (endColor.b - startColor.b) / d.values.length ),
      a: (endColor.a - startColor.a) / d.values.length
    }
  }

  // Organize chart values
  let col_i = 0
  d.values.forEach( (data, i, src) => {
    const label = Object.keys( data )[0]
    const obj   = data[label]
    const value = obj.value === undefined ? obj : obj.value
    dataSum += value

    // Setting up color info
    let color = obj.color
    // If color value is set to root
    if( obj.color === undefined ) {
      color = {
        r: startColor.r + colorDiff.r*col_i,
        g: startColor.g + colorDiff.g*col_i,
        b: startColor.b + colorDiff.b*col_i,
        a: startColor.a + colorDiff.a*col_i++
      }
      color = objectToRgba( color )
    }

    pies[i] = {
      label: label,
      srcValue: value,
      color: color,
      depth: 1
    }
  })

  // Get deg from percentage of value
  const r = d.radius == undefined ? d.canvas.self.width/3 : d.radius
  let lastAngle = 0
  for( let i=0; i < pies.length; i++ ) {
    const val = pies[i].srcValue
    const deg = val / dataSum * 360
    const startAngle = lastAngle
    lastAngle = startAngle + deg
    const displayValue = d.showPercentage ? 
      Math.floor(( val / dataSum * 100 )) + '%' : val

    pies[i] = { 
      ...pies[i],
      r: r,
      deg: deg,
      startAngle: startAngle,
      endAngle: lastAngle,
      value: displayValue
    }
  }

  const centerCoordinates = d.canvas.self.width/2
  const sectors = []
  const base = {
    x:      d.x !== undefined ? d.x : centerCoordinates, 
    y:      d.y !== undefined ? d.y : centerCoordinates,
    doFill: Shape.FILL
  }
  // Create sectors
  for( let i in pies ) {
    let obj = {
      ...base,
      ...pies[i]
    }
    let id = d.canvas.createSector(obj)
    sectors.push( d.canvas.getObject(id) )
  }

  // Area for collision optimize. is it worth?
  // also shadow
  const shadow = { offsetX:2, offsetY: 2 }
  let pieAreaId = d.canvas.createCircle({
    ...base, r: r-2,
    color:      bgColor,
    shadow: {
      ...shadow,
      color:    shadowColor,
      blur:     16
    }
  }),
      pieArea = d.canvas.getObject( pieAreaId ),
      tooltip = new Tooltip({
        canvas: d.canvas, 
        x:0, 
        y:0, 
        text:'', 
        label:'',
        font: {...d.font}
      })
  tooltip.hide()

  // Optional donut
  let donutCircle = {isCollision: _=> false}
  if( d.donut || d.doughnut ) {
    const donut = d.donut || d.doughnut
    const radius = typeof donut === 'number' ? donut : r / 1.618
    // donut hole
    let donutId = d.canvas.createCircle({
      ...base,
      depth: 2,
      r: radius,
      color: bgColor
    })
    donutCircle = d.canvas.getObject( donutId )
  
    // hole shadow
    let gradient = d.canvas.context.createRadialGradient( 
      base.x, base.y, 0,
      base.x + shadow.offsetX, base.y + shadow.offsetY, radius
    )
    const blur = 12
    gradient.addColorStop( 0, 'transparent')
    gradient.addColorStop( (radius - blur*1.5) / radius, `transparent`)
    gradient.addColorStop( (radius - blur*1.2) / radius, `rgba(0,0,0,${0.1*0.1})`)
    gradient.addColorStop( (radius - blur/2) / radius, `rgba(0,0,0,${0.1*0.6})`)
    gradient.addColorStop( 1, 'rgba(0,0,0,0.12)')
    d.canvas.createCircle({
      ...base,
      depth: 3,
      r: radius,
      color: gradient
    })
  }
  
  let getConflictSector = (x, y) => {
    for( let i in sectors ) {
      if( sectors[i].isCollision( x, y ) ) {
        return sectors[i]
      }
    }
    return null
  }
  let hoverEvent = (e) => {
    const x = e.offsetX
    const y = e.offsetY

    const isHoveringPieChart =
      pieArea.isCollision( x, y ) 
      && !donutCircle.isCollision( x, y )
      
    if( !isHoveringPieChart ) {
      if( tooltip.display ) {
        tooltip.hide()
        d.canvas.draw()
      }
      return
    }
    tooltip.setPosition( x, y )
    let s = getConflictSector( x, y )
    if( s != null ) {
      tooltip.setText( s.value )
      tooltip.setLabel( s.label )
      if( !tooltip.display ) {
        tooltip.show()
      }
      d.canvas.draw()
    }
  }
  
  d.canvas.draw()
  d.canvas.self.addEventListener('mousemove',  hoverEvent )
  
  return {sectors, pieArea}
}