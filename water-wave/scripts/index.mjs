import { Duck } from './duck.mjs';
import Renderer from './Renderer.mjs';
import { Bubble, Dot, Line, Shape, SubLine } from './Shapes/all.mjs';
import { BeachBall } from './Shapes/BeachBall.mjs';
import TaskQueue, { Task } from './TaskQueue.mjs';
import { debounce } from './utils.mjs';

const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const endX = canvas.width + 200;
const halfHeight = canvas.height / 2;
const startDot = (y = halfHeight, x = -200) => new Dot({ id: -1, x, y, r: 4 });
const endDot = (y = halfHeight, x = endX) => new Dot({ id: -2, x, y, r: 4 });

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

const duck = new Duck();
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

const beachball = new BeachBall({
  x: canvas.width * 0.8,
  y: 600,
  weight: 15,
});

const renderer = new Renderer(canvas.width, canvas.height, ctx, [
  [waveText],
  [sub1, sub2],
  [beachball, line, cursor],
  bubble.group,
]);
renderer.render();

const mousemove = (e) => {
  const prevX = cursor.x;
  const prevY = cursor.y;

  cursor.x = e.clientX;
  cursor.y = e.clientY;

  setLinearFunctionInfo(prevX, prevY);
  resetCursorPrev();
};
canvas.addEventListener('mousemove', mousemove);

canvas.addEventListener('click', (e) => {
  const isDuckClicked = duck.isDuckArea(e.clientX, e.clientY);
  if (!isDuckClicked) return;

  duck.quak();
  duck.squeeze();
});

const resizeHandler = debounce((e) => {
  // 디바운스 처리
  const w = e.target.innerWidth;
  const h = e.target.innerHeight;
  canvas.width = renderer.width = w;
  canvas.height = renderer.height = h;
  line.resize(startDot(h / 2, -200), endDot(h / 2, w + 200));
  sub1.resize(startDot(h / 2, -200), endDot(h / 2, w + 200));
  sub2.resize(startDot(h / 2, -200), endDot(h / 2, w + 200));
}, 100);
window.addEventListener('resize', resizeHandler);

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
