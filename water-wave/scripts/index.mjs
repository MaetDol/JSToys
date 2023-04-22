import Renderer from './Renderer.mjs';
import { Bubble, Dot, Line, Shape, SubLine } from './Shapes/all.mjs';
import TaskQueue, { Task } from './TaskQueue.mjs';

const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const endX = canvas.width + 200;
const halfHeight = canvas.height / 2;
const startDot = (_) => new Dot({ id: -1, x: -200, y: halfHeight, r: 4 });
const endDot = (_) => new Dot({ id: -2, x: endX, y: halfHeight, r: 4 });

const line = new Line({
  dot1: startDot(),
  dot2: endDot(),
  friction: 0.9,
  dotDistance: 50,
  color: '#39a4ff7f',
  height: halfHeight,
});

const sub1 = new SubLine({
  dot1: startDot(),
  dot2: endDot(),
  friction: 0.92,
  dotDistance: 50,
  color: '#ff442599',
  parent: line,
  weight: 0.7,
  height: halfHeight,
});

const sub2 = new SubLine({
  dot1: startDot(),
  dot2: endDot(),
  friction: 0.9,
  dotDistance: 50,
  color: '#ffff217f',
  parent: sub1,
  weight: 0.7,
  height: halfHeight,
});

const cursor = new (class extends Dot {
  prevX = 0;
  prevY = 0;

  // 기울기
  slope = 0;
  // 절편
  intercept = 0;

  conflict(dot) {
    // 계산식이 복잡해짐에 따라, 필요 케이스가 아니라면 미리 리턴한다
    // 마우스 x 좌표가 해당 점과 충돌할만한 거리가 아니라면 미리 리턴한다
    const pad = this.r * 1.5;
    const inXRange1 = this.prevX - pad < dot.x && dot.x < this.x + pad;
    const inXRange2 = this.prevX + pad > dot.x && dot.x > this.x - pad;
    if (!inXRange1 && !inXRange2) return false;

    const inYRange1 = this.prevY - pad < dot.y && dot.y < this.y + pad;
    const inYRange2 = this.prevY + pad > dot.y && dot.y > this.y - pad;
    if (!inYRange1 && !inYRange2) return false;

    if (cursor.x === cursor.prevX) return true;
    if (cursor.y === cursor.prevY) return true;

    // 충돌을 확인할 점과 마우스가 움직인 직선의
    // 가장 가까운 점의 좌표를 구한다
    const dx =
      (-cursor.intercept + dot.x / cursor.slope + dot.y) /
      (cursor.slope + 1 / cursor.slope);
    const dy = cursor.slope * dx + cursor.intercept;

    const dist = distance({ x: dx, y: dy }, dot);
    if (dist < this.r + pad) return true;

    return false;
  }

  update() {
    this.v *= 0.6;

    const diffY = this.y - this.prevY;
    if (diffY !== 0) {
      let speed = threshold(this.v + diffY, 30, -30);
      // 아래에서 위로 가는 경우, 감속
      if (Math.sign(diffY) < 0) speed *= 0.6;

      this.v = speed;
    }
  }
})({ id: -3, x: -50, y: -50, r: 20, color: '#00000088' });

const duck = new (class extends Shape {
  #accessories = [];

  constructor() {
    super();
    const img = document.getElementById('duck');
    this.props = {
      img,
      rotation: 0,
      x: 0,
      y: 0,
    };
  }

  draw(context) {
    const { x, y, rotation, img } = this.props;
    const { width: w, height: h } = img;

    context.save();
    context.strokeStyle = 'black';
    context.translate(x, y);
    context.rotate(rotation);
    context.drawImage(img, -w / 2, -h * 0.9);
    context.restore();

    this.#accessories.forEach((s) => s.draw(context));
  }

  isDuckArea(x, y) {
    const { img, x: centerX, y: centerY, rotation } = this.props;
    const { width, height } = img;

    const origin = {
      x: centerX,
      y: centerY,
    };

    const left = centerX - width / 2;
    const top = centerY - height;

    // left-top
    const lt = getRotatedPoint({ x: left, y: top }, origin, rotation);
    // left-bottom
    const lb = getRotatedPoint({ x: left, y: top + height }, origin, rotation);
    // right-top
    const rt = getRotatedPoint({ x: left + width, y: top }, origin, rotation);
    // right-bottom
    const rb = getRotatedPoint(
      { x: left + width, y: top + height },
      origin,
      rotation
    );

    return checkInsideUsingRayCasting([lt, rt, rb, lb], { x, y });
  }

  quak() {
    const speaking = this.#accessories.filter((s) => s.type === 'SPEECH');
    if (speaking.length > 3) return;

    const SPEECH_SET = [
      {
        text: `🐤`,
      },
      {
        text: `🐤`,
      },
      {
        text: `'QUAK'`,
      },
      {
        text: `'QUAK'`,
      },
      {
        text: '...',
      },
    ];
    const additionalRotate = randomRange(degToRadian(-60), degToRadian(60));
    const text = new (class extends Shape {
      type = 'SPEECH';
      id = Date.now();

      text = '';
      color = '#494B4D';
      opacity = 0;
      scale = 0.6;

      status = null;

      constructor() {
        super();

        const speech =
          SPEECH_SET[Math.floor(randomRange(0, SPEECH_SET.length))];
        this.text = speech.text;
        this.status = 'FADE-IN';
      }

      draw(context) {
        const { x, y, img, rotation } = duck.props;

        context.save();
        context.font = '24px "Bebas Neue"';
        const col = this.color + this.opacity.toString(16).padStart(2, '0');
        context.fillStyle = col;
        const textSize = context.measureText(this.text);

        context.translate(x, y);
        context.rotate(rotation * 1.8 + additionalRotate);
        context.scale(this.scale, this.scale);
        context.fillText(this.text, -textSize.width, -img.height - 24);
        context.restore();
      }
      update() {
        if (this.status === 'FADE-IN') {
          if (this.opacity >= 255) {
            this.status = 'HOLD';
            setTimeout(
              () => (this.status = 'FADE-OUT'),
              this.text.length * 200
            );
            return;
          }
          this.opacity = Math.min(255, Math.floor((this.opacity + 1) ** 1.3));
          this.scale = Math.min(1, this.scale * 1.07);
          return;
        }

        if (this.status === 'FADE-OUT') {
          if (this.opacity <= 1) {
            this.status = 'REMOVE';
            return;
          }
          this.opacity = Math.max(0, Math.floor((this.opacity + 1) * 0.6));
          return;
        }

        if (this.status === 'REMOVE') {
          duck.removeAccessory(this);
          return;
        }
      }
      collision() {}
    })();

    this.addAccessory(text);
  }

  addAccessory(shape) {
    this.#accessories.push(shape);
  }

  removeAccessory(shape) {
    this.#accessories = this.#accessories.filter((s) => s.id !== shape.id);
  }

  update() {
    this.#accessories.forEach((s) => s.update());
  }
  collision() {}
})();
line.floating(duck, 0.8);

const waveText = new (class extends Shape {
  draw(context) {
    context.fillStyle = '#494B4D';
    context.font = '120px "Bebas Neue"';
    let lastX = 120;
    const top = halfHeight + 60;
    [...'WAVE'].forEach((ch) => {
      const text = context.measureText(ch);
      context.fillText(ch, lastX, top);
      lastX += text.width + 25;
    });
  }
  update() {}
  collision() {}
})();

const bubble = new (class {
  constructor({ start, end, bottom }) {
    this.group = [];
    this.queue = new TaskQueue();
    this.start = start;
    this.end = end;
    this.distance = end - start;
    this.bottom = bottom;
    this.range = 100;

    this.bubbling();
    this.queue.consume();
  }

  filtering() {
    const group = this.group;
    for (let i = group.length - 1; i >= 0; i--) {
      const bubble = group[i];
      if (bubble.y < 0) group.splice(i, 1);
    }
  }

  bubbling() {
    this.filtering();
    const counts = Math.ceil(Math.random() * 6) + 2;
    const centerX = this.start + Math.random() * this.distance;
    for (let i = 0; i < counts; i++) {
      const r = 10 * Math.random() + 4;
      const x = centerX + Math.random() * this.range - this.range / 2;
      const y = this.bottom + Math.random() * this.range * (20 / r);
      const alpha = Math.ceil(Math.random() * (255 * 0.6) + 255 * 0.2);
      this.group.push(
        new Bubble({
          x,
          y,
          r,
          color: '#FFFFFF' + alpha.toString(16),
        })
      );
    }
    this.queue.add(
      new Task({
        job: () => this.bubbling(),
        delay: 2000 + 500 * Math.random(),
      })
    );
  }
})({ start: line.props.start.x, end: line.props.end.x, bottom: canvas.height });

const renderer = new Renderer(canvas.width, canvas.height, ctx, [
  [waveText],
  [sub1, sub2],
  [line, cursor],
  bubble.group,
]);
renderer.render();

canvas.addEventListener('mousemove', (e) => {
  const prevX = cursor.x;
  const prevY = cursor.y;

  cursor.x = e.clientX;
  cursor.y = e.clientY;

  setLinearFunctionInfo(prevX, prevY);
  resetCursorPrev();
});

canvas.addEventListener('click', (e) => {
  const isDuckClicked = duck.isDuckArea(e.clientX, e.clientY);
  if (!isDuckClicked) return;

  duck.quak();
});

window.addEventListener('resize', (e) => {
  const w = e.target.innerWidth;
  const h = e.target.innerHeight;
  canvas.width = renderer.width = w;
  canvas.height = renderer.height = h;
});

function waveLoop(line, queue) {
  const waveTask = (dot, delay) => {
    return new Task({
      job: () => (dot.v -= 8),
      delay,
    });
  };

  const wave = () => {
    const { dots } = line.props;
    dots.forEach((d, i) => queue.add(waveTask(d, 60)));
  };

  queue.add(
    new Task({
      job: () => {
        wave();
        waveLoop(line, queue);
      },
      delay: 8000,
    })
  );
}

const queue = new TaskQueue();
waveLoop(line, queue);
queue.consume();

// ---- Utils, need to separate file

function distance(dot1, dot2) {
  return Math.sqrt((dot1.x - dot2.x) ** 2 + (dot1.y - dot2.y) ** 2);
}

function throttle(fn, duration) {
  let running = false;
  return (...args) => {
    if (running) return;
    running = true;
    fn.apply(null, args);
    setTimeout(() => (running = false), duration);
  };
}

function debounce(fn, duration) {
  let id = null;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn.apply(null, args), duration);
  };
}

const setLinearFunctionInfo = throttle((x, y) => {
  cursor.prevX = x;
  cursor.prevY = y;

  cursor.slope = (cursor.y - y) / (cursor.x - x);
  cursor.intercept = y - cursor.slope * x;
}, 1000 / 60);

const resetCursorPrev = debounce(() => {
  cursor.prevX = cursor.x;
  cursor.prevY = cursor.y;
}, 1000 / 60);

function threshold(value, maxLimit, minLimit) {
  if (value > maxLimit) return maxLimit;
  if (value < minLimit) return minLimit;
  return value;
}

function getRotatedPoint(point, originPoint, radian) {
  const x = point.x - originPoint.x;
  const y = point.y - originPoint.y;

  const hypo = Math.sqrt(x ** 2 + y ** 2);
  const theta = Math.atan2(y, x);

  const movedX = originPoint.x + hypo * Math.cos(radian + theta);
  const movedY = originPoint.y + hypo * Math.sin(radian + theta);

  return { x: movedX, y: movedY };
}

function checkInsideUsingRayCasting(polygon, { x, y }) {
  let intersections = 0;

  for (let j = -1, i = 0; i < polygon.length; i++, j++) {
    const a = polygon.at(j);
    const b = polygon[i];

    // 세로 선상으로 두 점의 사이에 있다면, 수평으로 직선을 그어
    // 충돌하는지 확인할 수 있을 것이다
    const isAcrossY = a.y > y !== b.y > y;
    if (!isAcrossY) continue;

    // 확인하려는 좌표 기준 수평선을 그어, 두 점으로 이어진 직선에
    // 교차하는 점이 있는지 확인한다
    const vertexSlope = (a.x - b.x) / (a.y - b.y);
    const acrossXCoordinate = vertexSlope * (y - b.y) + b.x;

    // 양쪽 다 확인 할 필요 없이, 한 쪽(오른쪽) 만 확인해도 판별할 수 있다
    if (x < acrossXCoordinate) intersections++;
  }

  return intersections % 2 !== 0;
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function degToRadian(deg) {
  return deg * (Math.PI / 180);
}
