class Renderer {
  #shapes;
  #FRAME_RATE = 60;
  #FRAME_INTERVAL = 1000 / this.#FRAME_RATE;
  #lastFrameTimestamp = null;
  fps = 0;

  constructor(w, h, context, layers) {
    this.layers = layers;
    this.ctx = context;
    this.w = w;
    this.h = h;
  }

  set width(w) {
    this.w = w;
  }
  set height(h) {
    this.h = h;
  }

  render(timestamp) {
    if (!this.#lastFrameTimestamp) {
      this.#lastFrameTimestamp = timestamp;
    }

    const interval = timestamp - this.#lastFrameTimestamp;
    if (interval < this.#FRAME_INTERVAL) {
      this.loopRender();
      return;
    }

    this.ctx.clearRect(0, 0, this.w, this.h);

    this.layers.forEach((layer) => {
      layer.forEach((s) => {
        s.draw(this.ctx);
        s.collision(layer);
      });

      layer.forEach((s) => s.update());
    });

    this.fps = 1000 / interval;
    this.#lastFrameTimestamp = timestamp;
    this.loopRender();
  }

  loopRender() {
    requestAnimationFrame((timestamp) => this.render(timestamp));
  }
}

export default Renderer;
