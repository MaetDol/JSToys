const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const endX = canvas.width + 200;
const halfHeight = canvas.height / 2;
const startDot = _=> new Dot({id:-1, x:-200, y:halfHeight, r:4});
const endDot = _=> new Dot({id:-2, x:endX, y:halfHeight, r:4});

const line = new Line({
  dot1: startDot(),
  dot2: endDot(),
  friction: 0.9,
  dotDistance: 50,
  color: '#39a4ff8c',
  height: halfHeight,
});

const sub1 = new SubLine({
  dot1: startDot(),
  dot2: endDot(),
  friction: 0.92,
  dotDistance: 50,
  color: '#ff4425c9',
  parent: line,
  weight: 0.7,
  height: halfHeight - 100,
});

const sub2 = new SubLine({
  dot1: startDot(),
  dot2: endDot(),
  friction: 0.9,
  dotDistance: 50,
  color:'#ffff218c', 
  parent: sub1,
  weight: 0.7,
  height: halfHeight - 50,
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
  canvas.width = renderer.width = w;
  canvas.height = renderer.height = h;
});



function waveLoop( line, queue ) {
  const waveTask = ( dot, delay ) => {
    return new Task({
      job: () => dot.v -= 8,
      delay,
    });
  };

  const wave = () => {
    const {dots} = line.props;
    dots.forEach((d, i) => queue.add( waveTask(d, 60) ));
  };

  queue.add( new Task({
    job: () => {
      wave();
      waveLoop( line, queue );
    },
    delay: 8000,
  }));
}

const queue = new TaskQueue();
waveLoop( line, queue );
queue.consume();
