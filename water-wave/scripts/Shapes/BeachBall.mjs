import Dot from './Dot.mjs';
import Line from './Line.mjs';
import Shape from './Shape.mjs';

export class BeachBall extends Shape {
  props = {};
  delta = {
    x: 0,
    y: 0,
  };

  constructor({ x, y, r }) {
    super();
    this.props = {
      x,
      y,
      r,
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

    if (Math.abs(this.delta.y) < 0.001) {
      this.delta.y = 0;
    } else {
      this.delta.x *= 0.98;
      this.delta.y *= 0.98;
    }

    this.delta.y += 1;
  }

  collision(shapes) {
    // 두 점에 대해 충돌 계산을 할 경우 부력이 2배로 적용 될 것.
    // 추후 Line 에서 충돌 계산 메서드를 제공하고, 그걸 가져다 쓰는 방식으로
    // 진행할 수 있게 개선
    shapes.forEach((shape) => {
      if (!shape instanceof Line) return;
      shape.props.dots?.forEach((d) => {
        if (!this._conflict(d)) return;
        this.delta.y *= -0.3;

        const { r, y } = this.props;

        let dif = r - Math.abs(d.props.y - y);
        let theta = 2 * Math.acos(dif / r);
        let volumn = (theta * r ** 2) / 2;
        if (d.props.y < y) {
          debugger;
          volumn = 2 * Math.PI * r - volumn;
        }
        console.log(volumn);
        this.delta.y -= volumn * 0.0005;
      });
    });
  }

  conflict() {}

  _conflict(shape) {
    const { x, y, r: _r } = this.props;
    const r = 30;

    if (shape === this) return false;
    if (!shape instanceof Dot) return false;

    const xDiff = x - shape.props.x;
    if (isNaN(xDiff)) {
      debugger;
      return false;
    }
    if (Math.abs(xDiff) > r) return false;

    const yDiff = y - shape.props.y;
    if (isNaN(yDiff)) return false;
    if (Math.abs(yDiff) > r) return false;

    return true;
  }
}
