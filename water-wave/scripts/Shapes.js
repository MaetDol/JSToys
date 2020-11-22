class Shape {
  draw(context) { throw 0; }
  update() { throw 0; }
  collision(shapes) { throw 0; }
}

class Dot extends Shape {
  constructor({id, x, y, r, friction=0}) {
    super();
    this.props = {
      id, x, y, r, friction,
      v: 0,
      w: 0.01,
      initPos: {x, y}
    }
  }

  get id() { return this.props.id; }
  get x() { return this.props.x; }
  get y() { return this.props.y; }
  get r() { return this.props.r; }
  get v() { return this.props.v; }
  get friction() { return this.props.friction; }

  set id(v) { this.props.id = v; }
  set x(v) { this.props.x = v; }
  set y(v) { this.props.y = v; }
  set r(v) { this.props.r = v; }
  set v(v) { this.props.v = v; }
  set friction(v) { this.props.friction = v; }

  draw( context ) {
    context.beginPath();
    context.fillStyle = 'black';
    context.arc( this.x, this.y, this.r, 0, Math.PI*2 );
    context.fill();
  }

  update() {}
  collision( shapes ) {}
}

class DotOfLine extends Dot {    
  constructor(args) { 
    super(args);
  }

  update( shapes ) {
    let {y, v, w, friction, initPos:{y:initY}} = this.props;
    this.y += v;
    let nv = (v + (initY - y) * w ) * friction;

    const thisIdx = shapes.findIndex( d => d.id === this.id );
    const prev = shapes[thisIdx-1];
    const next = shapes[thisIdx+1];
    if( prev ) nv += (prev.y-y) * w;
    if( next ) nv += (next.y-y) * w;
    this.v = Math.abs(nv) > 0.001 ? nv : v;
  }

  collision( shapes ) {
  }
}

class Line extends Shape {
  constructor( dot1, dot2, friction=0, DOT_DISTANCE=3 ) {
    super();
    const width = Math.abs( dot1.x - dot2.x ) + Math.abs( dot1.y - dot2.y );
    const dotCount = Math.floor( width / DOT_DISTANCE ) -1;
    const dots = Array( dotCount ).fill(0).map((_, i) => 
        new DotOfLine({
          id: i,
          x: dot1.x + (i+1) * DOT_DISTANCE, 
          y: dot1.y,
          r: 2, friction 
        })
    );
    const prevState = dots.map(({id, x, y, r, friction}) => 
      new DotOfLine({id, x, y, r, friction})
    );

    dots[~~(dots.length/2)].v = 30;
    dots[~~(dots.length/2)].v = 30;

    this.props = {
      start: dot1,
      end: dot2,
      friction,
      dots,
      prevState,
    };
  }

  gradientOf( dot1, dot2 ) {
    return (dot1.y - dot2.y) / (dot1.x - dot2.x);
  }

  draw( context ) {
    const { start, end, dots } = this.props;
    context.beginPath();
    context.moveTo(start.x, start.y);

    let prevVec = {x:0, y:0};
    let nextVec = {};
    dots.forEach((d, i, ds) => {
      const prev = ds[i-1] || start;
      const next = ds[i+1] || end;
      const a = this.gradientOf( prev, next );
      const dx = (next.x - d.x);
      const dy = a * dx;
      context.quadraticCurveTo (
        d.x, d.y,
        next.x, next.y
      );

      prevVec = {x: dx, y: dy};
    });
    context.lineTo(end.x, end.y);

    context.stroke();
    context.closePath();

    start.draw( context )
    end.draw( context )

    for( const d of dots ) {
      d.draw( context );
    }
  }

  update() {
    const { start, end, prevState, dots } = this.props;
    dots.forEach(d => d.update([start, ...prevState, end]));
    prevState.forEach((d, i) => d.props = {...dots[i].props});
  }

  collision( shapes ) {
    const s = shapes.filter( s => s !== this );
    this.props.dots.forEach( d => d.collision(s) );
  }

}