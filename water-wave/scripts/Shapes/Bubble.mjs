import Dot from './Dot.mjs';

class Bubble extends Dot {
	constructor(args) {
		super(args);
		this.props.p = this.pulsation(args.r, 2);
	}

	draw(context) {
		const { color, x, y, r } = this.props;
		context.save();
		context.globalCompositeOperation = 'source-atop';
		context.beginPath();
		context.fillStyle = color;
		context.arc(x, y, r, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}

	update() {
		const {
			r,
			y,
			p: { vec, dir },
		} = this.props;

		this.props.y -= 5 + r * 0.1;
		this.props.x += vec * dir;
		this.props.p.dist -= vec;

		if (this.props.p.dist < 0) {
			this.props.p = this.pulsation(r, y);
		}
	}

	pulsation(r, p) {
		const dist = (1 / (2 * Math.PI * r)) * Math.sqrt(3 * p + 4 / r) * 10;
		const vec = dist * 0.05;
		return {
			dir: Math.random() < 0.5 ? -1 : 1,
			dist,
			vec,
		};
	}

	collision(shapes) {
		shapes.forEach((s) => {
			if (s === this) return;

			if (s instanceof Dot) {
				const info = s.conflictWithDot(this);
				if (!info.conflict) return;
				this.props.x += this.r + s.r - info.distance;
			}
		});
	}
}

export default Bubble;
