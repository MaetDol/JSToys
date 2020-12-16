class Renderer {
  #shapes;
  constructor( w, h, context, layers ) {
    this.layers = layers;
    this.ctx = context;
    this.w = w;
    this.h = h;
  }

  set width(w) { this.w = w; }
  set height(h) { this.h = h; }

  render() {
    this.ctx.clearRect( 0, 0, this.w, this.h );

    this.layers.forEach( layer => {
      layer.forEach( s => {
        s.draw( this.ctx );
        s.collision( layer );
      });
      
      layer.forEach( s => s.update() );
    });
    requestAnimationFrame( _=> this.render() );
  }
}

export default Renderer;
