class Shape {
  draw(context) { throw 0; }
  update() { throw 0; }
  collision(shapes) { throw 0; }
  conflict(shape) { throw 0; }
  
  get x() { return this.props.x; }
  get y() { return this.props.y; }

  set x(v) { this.props.x = v; }
  set y(v) { this.props.y = v; }
}

export default Shape;
