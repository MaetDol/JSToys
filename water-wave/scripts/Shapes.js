class Shape {
  draw(context) { throw 0; }
  update() { throw 0; }
  collision(shapes) { throw 0; }
  conflict(shape) { throw 0; }
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

  gradientOf( dot1, dot2 ) {
    return (dot1.y - dot2.y) / (dot1.x - dot2.x);
  }

  collision( shapes ) {
    shapes.filter( s => s.conflict(this) ).forEach( s => {
      this.y = s.y + s.r;
    });
  }
}

class Line extends Shape {
  constructor({ dot1, dot2, friction=0, dotDistance=3, color }) {
    super();
    const width = Math.abs( dot1.x - dot2.x ) + Math.abs( dot1.y - dot2.y );
    const dotCount = Math.floor( width / dotDistance ) -1;
    const dots = Array( dotCount ).fill(0).map((_, i) => 
        new DotOfLine({
          id: i,
          x: dot1.x + (i+1) * dotDistance,
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
      color,
    };
  }

  gradientOf( dot1, dot2 ) {
    return (dot1.y - dot2.y) / (dot1.x - dot2.x);
  }

  constBOf( gradient, dot ) {
    return dot.y - gradient*dot.x;
  }

  draw( context ) {
    const { start, end, dots } = this.props;

    const water = new Path2D();
    water.moveTo(start.x, start.y);

    let direction = 0;
    let pairControlPoint = {
      x: start.x + (dots[0].x - start.x)/2,
      y: start.y,
    };
    dots.forEach((d, i, ds) => {
      const prev = ds[i-1] || start;
      const next = ds[i+1] || end;

      const nextDirection = Math.sign( next.y - d.y );
      const isSameDirection = direction && direction === nextDirection;
      let f = x=>{};
      if( isSameDirection ) {
        const a = this.gradientOf( pairControlPoint, d );
        const b = this.constBOf( a, d );
        f = (x, y) => {
          const cp_y = a*x + b;
          return cp_y * nextDirection < y * nextDirection ? 
            {x, y: cp_y} : {x: (y-b)/a, y};
        };
      }
      const controlPoint = isSameDirection ? pairControlPoint : {x: pairControlPoint.x, y: d.y};
      direction = nextDirection;

      water.bezierCurveTo(
        pairControlPoint.x, pairControlPoint.y,
        controlPoint.x, controlPoint.y,
        d.x, d.y
      );
      
      const nextCp_x = d.x + (next.x - d.x)/2;
      pairControlPoint = isSameDirection ? f(nextCp_x, next.y) : { x: nextCp_x, y: d.y };

    });

    const prev = dots[dots.length-1];
    const dist = end.x - prev.x;
    water.bezierCurveTo(
      prev.x + dist/2, prev.y,
      end.x - dist/2, end.y,
      end.x, end.y,
    );

    water.lineTo(end.x, end.y);
    water.lineTo(end.x, end.y + 200);
    water.lineTo(start.x, start.y + 200);
    water.closePath();

    context.fillStyle = this.props.color;
    context.fill( water );


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

  conflict( shape ) { return false; }

}

class SubLine extends Line {
  constructor(args){
    super(args);
    this.w = args.weight;
    this.p = args.parent;
  }
  update() {
    const {dots, prevState, friction, w} = this.props;
    dots.forEach((d, i) => {
      const parentDot = this.p.props.dots[i];
      const parentDistance = parentDot.props.initPos.y - parentDot.y;
      const distance = d.props.initPos.y - d.y;
      d.v += -(parentDistance * this.w - distance) * 0.03;
      d.update([...prevState]);
    });
    prevState.forEach((d, i) => d.props = {...dots[i].props});
  }
}
