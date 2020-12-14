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
  color:'#ffff217f', 
  parent: sub1,
  weight: 0.7,
  height: halfHeight,
});

const cursor = new (class extends Dot {
  conflict( dot ) {
    const {x, y, r} = this;
    const distance = Math.sqrt((dot.x - x)**2 + (dot.y - y)**2);
    return distance < r;
  }
})({id:-3, x:-50, y:-50, r:20, color:'#00000088'});

const duck = new (class extends Shape {
  constructor() { 
    super(); 
    const img = new Image();
    img.src = '../duck.png';
    this.props = { img }; 
  }
  draw( context ) {
    const {x, y, rotation, img } = this.props;
    const { width:w, height:h } = img;

    context.save();
    context.strokeStyle = 'black';
    context.translate(x, y);
    context.rotate( rotation );
    context.drawImage( img, -w/2, -h*0.9 );
    context.restore();
  }
  update() {}
  collision() {}
})();
line.floating( duck, 0.8 );

const waveText = new (class extends Shape {
  draw( context ) {
    context.fillStyle = '#494B4D';
    context.font = '120px "Bebas Neue"';
    let lastX = 120;
    const top = halfHeight + 60;
    [...'WAVE'].forEach( ch => {
      const text = context.measureText( ch );
      context.fillText( ch, lastX, top );
      lastX += text.width + 25;
    });
  }
  update() {}
  collision() {}
})();

const bubble = new class {
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
    for( let i=group.length; i >= 0; i-- ) {
      const bubble = group[i];
      if( bubble.y < 0 ) group.splice( i, 1 );
    }
  }

  bubbling() {
    const counts = Math.ceil( Math.random() * 6 ) + 2;
    const centerX = this.start + Math.random() * this.distance;
    for( let i=0; i < counts; i++ ) {
      const r = 10 * Math.random() + 4;
      const x = centerX + Math.random() * this.range - this.range/2;
      const y = this.bottom + Math.random() * this.range * (20/r);
      const alpha = Math.ceil( Math.random() * (255*0.6) + (255*0.2) );
      this.group.push( new Bubble({
        x, y, r,
        color: '#FFFFFF' + alpha.toString(16),
      }));
    }
    this.queue.add( new Task({
      job: () => this.bubbling(),
      delay: 2000 + 500 * Math.random()
    }));
  }
}({ start: line.props.start.x, end: line.props.end.x, bottom: canvas.height });

const renderer = new Renderer( 
  canvas.width, canvas.height, ctx, 
  [
    [waveText],
    [sub1, sub2],
    [line, cursor], 
    bubble.group,
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
