import Dot from './Dot.mjs';
import Line from './Line.mjs';
import Shape from './Shape.mjs';

export class BeachBall extends Shape {
  props = {
    x: 0,
    y: 0,
    weight: 0,
  };
  delta = {
    x: 0,
    y: 0,
  };

  constructor({ x, y, r, weight }) {
    super();
    this.props = {
      x,
      y,
      r,
      weight,
    };
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const { x, y, r } = this.props;

    ctx.beginPath();
    ctx.fillStyle = '#555555';
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.props.x += this.delta.x;
    this.props.y += this.delta.y;

    this.delta.x *= 0.81;
    this.delta.y *= 0.81;

    this.delta.y += this.props.weight * 0.1;
  }

  collision(shapes) {
    // 두 점에 대해 충돌 계산을 할 경우 부력이 2배로 적용 될 것.
    // 추후 Line 에서 충돌 계산 메서드를 제공하고, 그걸 가져다 쓰는 방식으로
    // 진행할 수 있게 개선
    shapes.forEach((shape) => {
      if (!shape instanceof Line) return;
      for (const d of shape.props.dots ?? []) {
        if (!this._conflict(d)) continue;

        const { r, y } = this.props;

        // 부력 계산
        const distance = Math.abs(d.props.y - y);
        const area = Math.PI * r ** 2;

        if (distance > r) {
          this.delta.y -= area * 0.001;
          return;
        }

        let theta = 2 * Math.acos(distance / r);
        let volumn = (theta - Math.sin(theta)) * r ** 2 * 0.5;
        if (y > d.props.y) {
          volumn = area - volumn;
        }

        this.delta.y -= volumn * 0.001;
        return;
      }
    });
  }

  conflict() {}

  _conflict(shape) {
    const { x, y, r } = this.props;

    if (shape === this) return false;
    if (!shape instanceof Dot) return false;

    const xDiff = x - shape.props.x;
    if (isNaN(xDiff)) {
      debugger;
      return false;
    }
    if (Math.abs(xDiff) > r) return false;

    if (y + r < shape.props.y) return false;
    // const yDiff = y - shape.props.y;
    // if (isNaN(yDiff)) return false;
    // if (Math.abs(yDiff) > r) return false;

    return true;
  }
}
