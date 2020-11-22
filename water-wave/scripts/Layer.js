class Layer {
  #shapes;
  constructor( w, h, context, shapes ) {
    this.#shapes = shapes;
    this.ctx = context;
    this.w = w;
    this.h = h;
  }

  add(s) { this.#shapes.push(s); }
  delete(s) { 
    const shs = this.#shapes
    shs.splice( shs.indexOf(s), 1 );
  }

  render() {
    this.ctx.clearRect( 0, 0, this.w, this.h );
    for( const s of this.#shapes ) {
      s.draw( this.ctx );
      s.collision( this.#shapes );
    }
    
    for( const s of this.#shapes ) {
      s.update();
    }
    requestAnimationFrame( _=> this.render() );
  }
}