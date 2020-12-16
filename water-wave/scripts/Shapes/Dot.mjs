import Shape from './Shape.mjs';

class Dot extends Shape {
  constructor({id=-1, x=0, y=0, r=0, friction=0, color='black'}={}) {
    super();
    this.props = {
      id, x, y, r, friction, color,
      v: 0,
      w: 0.01,
      initPos: {x, y}
    }
  }

  get id() { return this.props.id; }
  get r() { return this.props.r; }
  get v() { return this.props.v; }
  get friction() { return this.props.friction; }

  set id(v) { this.props.id = v; }

  set r(v) { this.props.r = v; }
  set v(v) { this.props.v = v; }
  set friction(v) { this.props.friction = v; }

  static sum(...dots) {
    return dots.reduce((sum, d) => {
      sum.x += d.x;
      sum.y += d.y;
      return sum;
    }, new Dot());
  }

  sub( dot ) {
    return new Dot({
      x: this.x - dot.x,
      y: this.y - dot.y,
    });
  }

  multiply( value ) {
    return new Dot({
      x: this.x * value,
      y: this.y * value,
    });
  }

  draw( context ) {
    const { color, x, y, r } = this.props;
    context.beginPath();
    context.fillStyle = color;
    context.arc( x, y, r, 0, Math.PI*2 );
    context.fill();
  }

  update() {}
  collision( shapes ) {}

  conflictWithDot( dot ) {
    const {x, y, r} = this.props;
    const distance = Math.sqrt((dot.x - x)**2 + (dot.y - y)**2);
    return {
      point: dot,
      distance,
      conflict: distance <= r + dot.r,
    };
  }
}

export default Dot;
