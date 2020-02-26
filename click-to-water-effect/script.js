window.onload = function () {
	displayLen = document.getElementById("figureLength");
	
	figureArray = new Array();
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	canvas.addEventListener("click", function c (e) {
		for (i = 0; i < Math.random() * 6 + 3; i++) {
			var figure = {};
			figure.x = e.clientX;
			figure.y = e.clientY;
			figure.r = 75;
			getVector(figure);
			figureArray.push(figure);
		}
	});
	requestAnimationFrame(animate);
};

function getVector(c) {
	c.vx = Math.random() * 250;
	c.vy = -(Math.random() * 600 + 100);
	c.vx *= (Math.random() >= 0.5) ? 1 : -1;
}

function animate () {
	requestAnimationFrame(animate);
	displayLen.innerHTML = "Length: " + figureArray.length;
	context.clearRect(0, 0, canvas.width, canvas.height);
	if (figureArray != undefined) {
		for (i = 0; i < figureArray.length; i++) {
			var temp = figureArray[i];
			context.beginPath();
			context.globalAlpha = 0.6;
			context.fillStyle = "lightblue";
			context.arc(temp.x, temp.y, temp.r, 0, Math.PI * 2, false);
			context.closePath();
			context.fill();
			
			temp.x += temp.vx * 0.05;
			temp.y += temp.vy * 0.05 + 10;
			temp.vx *= 0.95;
			temp.vy *= 0.95;
			temp.r *= 0.95;
			if (temp.r < 3) {
				figureArray.splice(i, 1);
			}
		}
	}
}
