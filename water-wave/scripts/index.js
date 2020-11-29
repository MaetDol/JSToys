const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const startDot = _=> new Dot({id:-1, x:200, y:200, r:4});
const endDot = _=> new Dot({id:-2, x:1000, y:200, r:4});

const line = new Line({
  dot1: startDot(),
  dot2: endDot(),
  friction: 0.9,
  dotDistance: 50,
  color: '#39a4ff8c'
});

const sub1 = new SubLine({
  dot1: startDot(),
  dot2: endDot(),
  friction: 0.92,
  dotDistance: 50,
  color: '#ff4425c9',
  parent: line,
  weight: 0.7,
});

const sub2 = new SubLine({
  dot1: startDot(),
  dot2: endDot(),
  friction: 0.9,
  dotDistance: 50,
  color:'#ffff218c', 
  parent: sub1,
  weight: 0.7,
});

const cursor = new (class extends Dot {
  draw( context ) {
    context.beginPath();
    context.fillStyle = '#00000088';
    context.arc( this.x, this.y, this.r, 0, Math.PI*2 );
    context.fill();
  }
  conflict( dot ) {
    const {x, y, r} = this;
    const distance = Math.sqrt((dot.x - x)**2 + (dot.y - y)**2);
    return distance < r;
  }
})({id:-3, x:-50, y:-50, r:20});

const renderer = new Renderer( 
  canvas.width, canvas.height, ctx, 
  [
    [sub1, sub2],
    [line, cursor], 
  ], 
);
renderer.render();

canvas.addEventListener('mousemove', e => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
});


window.addEventListener('resize', e => {
  const w = e.target.innerWidth;
  const h = e.target.innerHeight;
  canvas.width = w;
  canvas.height = h;
  renderer.width = w;
  renderer.height = h;
});
