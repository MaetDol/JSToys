import Dot from './Dot.mjs';
import Shape from './Shape.mjs';

class DotOfLine extends Dot {
  constructor(args) {
    super(args);
  }

  update(shapes) {
    let {
      y,
      v,
      w,
      friction,
      initPos: { y: initY },
    } = this.props;
    this.y += v;
    let nv = (v + (initY - y) * w) * friction;

    const thisIdx = shapes.findIndex((d) => d.id === this.id);
    const prev = shapes[thisIdx - 1];
    const next = shapes[thisIdx + 1];
    if (prev) nv += (prev.y - y) * w;
    if (next) nv += (next.y - y) * w;
    this.v = Math.abs(nv) > 0.001 ? nv : v;
  }

  gradientOf(dot1, dot2) {
    return (dot1.y - dot2.y) / (dot1.x - dot2.x);
  }

  collision(shapes) {
    shapes
      .filter((s) => s.conflict(this))
      .forEach((s) => {
        this.y = s.y + s.r;
      });
  }
}

class Line extends Shape {
  constructor({ dot1, dot2, friction = 0, dotDistance = 3, color, height }) {
    super();
    const width = Math.abs(dot1.x - dot2.x) + Math.abs(dot1.y - dot2.y);
    const dotCount = Math.floor(width / dotDistance) - 1;
    const dots = Array(dotCount)
      .fill(0)
      .map(
        (_, i) =>
          new DotOfLine({
            id: i,
            x: dot1.x + (i + 1) * dotDistance,
            y: dot1.y,
            r: 2,
            friction,
            color: '',
          })
      );
    dots.forEach((d, i, arr) => {
      d.bezier = {
        cp1: arr[i - 1] || dot1,
        cp2: d,
      };
    });
    const prevState = dots.map(
      ({ id, x, y, r, friction }) => new DotOfLine({ id, x, y, r, friction })
    );

    dots[~~(dots.length / 2)].v = 30;
    dots[~~(dots.length / 2)].v = 30;

    this.props = {
      start: dot1,
      end: dot2,
      friction,
      dots,
      prevState,
      color,
      dotDistance,
      height,
      floated: [],
    };
  }

  bezierCurveFormula(t, start, end, cp1, cp2) {
    const dis = 1 - t;
    start = start.multiply(dis ** 3);
    cp1 = cp1.multiply(3 * dis ** 2 * t);
    cp2 = cp2.multiply(3 * dis * t ** 2);
    end = end.multiply(t ** 3);
    return Dot.sum(start, cp1, cp2, end);
  }

  gradientOfBezier(t, start, end, cp1, cp2) {
    const dis = 1 - t;
    const x =
      3 * dis ** 2 * (cp1.x - start.x) +
      6 * dis * t * (cp2.x - cp1.x) +
      3 * t ** 2 * (end.x - cp2.x);
    const y =
      3 * dis ** 2 * (cp1.y - start.y) +
      6 * dis * t * (cp2.y - cp1.y) +
      3 * t ** 2 * (end.y - cp2.y);
    return y / x;
  }

  gradientOf(dot1, dot2) {
    return (dot1.y - dot2.y) / (dot1.x - dot2.x);
  }

  constBOf(gradient, dot) {
    return dot.y - gradient * dot.x;
  }

  draw(context) {
    const { start, end, dots, height, floated } = this.props;

    floated.forEach((s) => s.draw(context));

    const water = new Path2D();
    water.moveTo(start.x, start.y);

    let direction = 0;
    let pairControlPoint = new Dot({
      x: start.x + (dots[0].x - start.x) / 2,
      y: start.y,
    });
    dots.forEach((d, i, ds) => {
      const prev = ds[i - 1] || start;
      const next = ds[i + 1] || end;

      const leftDirection = Math.sign(d.y - prev.y);
      const rightDirection = Math.sign(next.y - d.y);
      const isLinear = leftDirection === rightDirection;
      const isMidOfLinear = isLinear && direction === leftDirection;

      const leftDistance = d.x - prev.x;
      const rightDistance = next.x - d.x;
      let controlPoints;
      if (isLinear) {
        const basePoint = isMidOfLinear ? pairControlPoint : prev;
        const a = this.gradientOf(basePoint, d);
        const b = this.constBOf(a, d);
        const f = (x, y) => {
          const cp_y = a * x + b;
          const isBetweenDots = cp_y * leftDirection < y * leftDirection;
          return new Dot(
            isBetweenDots ? { x, y: cp_y } : { x: (y - b) / a, y }
          );
        };
        const distance = d.x - basePoint.x;
        controlPoints = [
          isMidOfLinear ? pairControlPoint : f(basePoint.x + distance / 2, d.y),
          f(d.x + rightDistance / 2, next.y),
        ];
      } else {
        controlPoints = [
          new Dot({
            x: leftDistance / 2 + prev.x,
            y: d.y,
          }),
          new Dot({
            x: rightDistance / 2 + d.x,
            y: d.y,
          }),
        ];
      }
      direction = leftDirection;

      water.bezierCurveTo(
        pairControlPoint.x,
        pairControlPoint.y,
        controlPoints[0].x,
        controlPoints[0].y,
        d.x,
        d.y
      );
      d.bezier = {
        cp1: pairControlPoint,
        cp2: controlPoints[0],
      };
      pairControlPoint = controlPoints[1];
    });

    const prev = dots[dots.length - 1];
    const dist = end.x - prev.x;
    water.bezierCurveTo(
      prev.x + dist / 2,
      prev.y,
      end.x - dist / 2,
      end.y,
      end.x,
      end.y
    );

    water.lineTo(end.x, end.y);
    water.lineTo(end.x, end.y + height);
    water.lineTo(start.x, start.y + height);
    water.closePath();

    context.fillStyle = this.props.color;
    context.fill(water);
  }

  update() {
    const { start, end, prevState, dots, floated, dotDistance } = this.props;
    dots.forEach((d) => d.update([start, ...prevState, end]));
    prevState.forEach((d, i) => (d.props = { ...dots[i].props }));

    floated.forEach((s) => {
      const idx = this.dotIndexOf(s.x);
      if (idx < 0 || idx >= dots.length) return;

      const next = dots[idx];
      const prev = dots[idx - 1] || start;
      const { cp1, cp2 } = next.bezier;
      const t = (s.x - prev.x) / dotDistance;
      const gradient = this.gradientOfBezier(t, prev, next, cp1, cp2);
      s.props.y = this.bezierCurveFormula(t, prev, next, cp1, cp2).y;
      s.props.rotation = Math.atan(gradient);
    });
  }

  dotIndexOf(x) {
    const { start, end, dotDistance } = this.props;
    if (x < start.x || x > end.x) return -1;

    return Math.floor((x - start.x) / dotDistance);
  }

  collision(shapes) {
    const { start, end, dots, dotDistance } = this.props;
    for (const s of shapes) {
      if (s === this) continue;

      const idx = this.dotIndexOf(s.x);
      if (idx >= dots.length || idx < 0) continue;

      const prev = dots[idx - 1] || start;
      const dot = dots[idx] || end;
      const { cp1, cp2 } = dot.bezier;
      const t = (s.x - prev.x) / dotDistance;
      const conflictPoint = this.bezierCurveFormula(t, prev, dot, cp1, cp2);
      if (s.conflict(conflictPoint)) {
        const f = Math.abs((conflictPoint.y - s.y) * 0.2);
        dot.v += f * t;
        prev.v += f * (1 - t);
      }
    }
  }

  conflict(shape) {
    return false;
  }
  floating(shape, xPosition) {
    const { start, end } = this.props;
    shape.x = start.x + (end.x - start.x) * xPosition;
    this.props.floated.push(shape);
  }
}

export default Line;
