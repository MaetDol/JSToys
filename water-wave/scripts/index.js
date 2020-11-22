const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const line = new Line(
  new Dot({id:-1, x:100, y:200, r:4}),
  new Dot({id:-2, x:800, y:200, r:4}),
  0.9,
  20,
);

const cursor = new (class extends Dot {
  draw( context ) {
    context.beginPath();
    context.fillStyle = '#00000088';
    context.arc( this.x, this.y, this.r, 0, Math.PI*2 );
    context.fill();
  }
})({id:-3, x:-50, y:-50, r:10});
const layer = new Layer( canvas.width, canvas.height, ctx, [line, cursor] );
layer.render();

canvas.addEventListener('mousemove', e => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
});