const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');

let x = 50, y = 50;
let dx = 2, dy = 3;
const radius = 20;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'lime';
  ctx.fill();
  x += dx;
  y += dy;
  if (x < radius || x > canvas.width - radius) dx = -dx;
  if (y < radius || y > canvas.height - radius) dy = -dy;
  requestAnimationFrame(draw);
}
draw();