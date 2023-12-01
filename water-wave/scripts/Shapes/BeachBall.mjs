import Dot from './Dot.mjs';
import Line from './Line.mjs';
import Shape from './Shape.mjs';

export class BeachBall extends Shape {
  props = {
    x: 0,
    y: 0,
    weight: 0,
    rotate: 0,
  };
  delta = {
    x: 0,
    y: 0,
    rotate: 0,
  };
  isSvgLoaded = false;

  SVG_PATH = './resources/svg/beachball_outline_bold.svg';

  constructor({ x = 0, y = 0, weight = 1, rotate = 0 }) {
    super();
    this.props = {
      x,
      y,
      weight,
      rotate,
      img: new Image(),
    };
    this.props.img.onload = this.#onSvgLoad.bind(this);
    this.props.img.src = this.SVG_PATH;
  }

  #onSvgLoad() {
    this.props.r = this.props.img.width / 2;
    this.isSvgLoaded = true;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.isSvgLoaded) return;

    const { x, y, r, img, rotate } = this.props;

    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(rotate);

    ctx.drawImage(img, -r, -r);

    ctx.restore();
  }

  update() {
    if (!this.isSvgLoaded) return;

    this.props.x += this.delta.x;
    this.props.y += this.delta.y;
    this.props.rotate += this.delta.rotate;

    this.delta.x *= 0.85;
    this.delta.y *= 0.85;
    this.delta.rotate *= 0.95;

    this.delta.y += this.props.weight * 0.1;
  }

  collision(shapes) {
    if (!this.isSvgLoaded) return;
    // 부력 가중치
    const buoyancyWegiht = 0.001;

    // 두 점에 대해 충돌 계산을 할 경우 부력이 2배로 적용 될 것.
    // 추후 Line 에서 충돌 계산 메서드를 제공하고, 그걸 가져다 쓰는 방식으로
    // 진행할 수 있게 개선
    shapes.forEach((shape) => {
      if (!(shape instanceof Line)) return;

      const { r, x, y } = this.props;
      const targetDotIndex = shape.nearestDotIndexOf(x);
      if (targetDotIndex === -1) return;

      const dots = shape.props.dots ?? [];
      const dot = dots[targetDotIndex];
      if (!this.#_conflict(dot)) return;

      // 부력 계산
      const distance = Math.abs(dot.props.y - y);
      const area = Math.PI * r ** 2;

      // 물에 완전히 잠김
      if (distance > r) {
        this.delta.y -= area * buoyancyWegiht;
        return;
      }

      let theta = 2 * Math.acos(distance / r);
      let volumn = (theta - Math.sin(theta)) * r ** 2 * 0.5;
      // 반 이상 물에 잠김
      if (y > dot.props.y) {
        volumn = area - volumn;
      }
      this.delta.y -= volumn * buoyancyWegiht;

      // 기울기를 계산해 공이 굴러가게 한다
      const prevDot = dots[targetDotIndex - 1];
      const nextDot = dots[targetDotIndex + 1];
      const leftSlope = dot.props.y - prevDot.props.y;
      const rightSlope = nextDot.props.y - dot.props.y;
      const deltaX = (leftSlope + rightSlope) * 0.003;
      this.delta.x += deltaX;
      this.delta.rotate += deltaX * 0.05;
    });
  }

  conflict() {}

  #_conflict(shape) {
    const { x, y, r } = this.props;

    if (shape === this) return false;
    if (!(shape instanceof Dot)) return false;

    const xDiff = x - shape.props.x;
    if (isNaN(xDiff)) {
      debugger;
      return false;
    }
    if (Math.abs(xDiff) > r) return false;

    if (y + r < shape.props.y) return false;

    return true;
  }
}
