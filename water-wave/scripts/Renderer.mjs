class Renderer {
  #shapes;

  #FRAME_RATE = 60;
  #FRAME_INTERVAL = Math.floor(1000 / this.#FRAME_RATE);
  #lastFrameTimestamp = null;

  #startedAt = null;
  #frameCount = 0;

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

  get fps() {
    return (
      (this.#frameCount / (document.timeline.currentTime - this.#startedAt)) *
      1000
    );
  }

  render() {
    this.#startedAt = document.timeline.currentTime;
    this.#lastFrameTimestamp = document.timeline.currentTime;
    this.loopRender();
  }

  drawAnimationFrame(timestamp) {
    this.loopRender();

    const interval = timestamp - this.#lastFrameTimestamp;
    if (interval < this.#FRAME_INTERVAL) {
      return;
    }

    this.#frameCount++;
    // 해당 프레임 렌더링 밀린 시간만큼 조정
    this.#lastFrameTimestamp =
      document.timeline.currentTime - (interval % this.#FRAME_INTERVAL);

    // Draw
    this.ctx.clearRect(0, 0, this.w, this.h);

    this.layers.forEach((layer) => {
      layer.forEach((s) => {
        s.draw(this.ctx);
        s.collision(layer);
      });

      layer.forEach((s) => s.update());
    });
  }

  loopRender() {
    requestAnimationFrame((timestamp) => this.drawAnimationFrame(timestamp));
  }
}

export default Renderer;
