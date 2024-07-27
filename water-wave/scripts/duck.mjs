import { Shape } from './Shapes/all.mjs';
import { LIFE_QUOTE_TYPE, SPEECH_SET } from './speech-set.mjs';
import {
	checkInsideUsingRayCasting,
	degToRadian,
	getRotatedPoint,
	randomRange,
} from './utils.mjs';

export class Duck extends Shape {
	#accessories = [];
	scale = 1;

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
		context.scale(this.scale, this.scale);
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
			rotation,
		);

		return checkInsideUsingRayCasting([lt, rt, rb, lb], { x, y });
	}

	quak() {
		const speaking = this.#accessories.filter(
			(s) => s.accessoryType === 'SPEECH',
		);
		if (speaking.length > 3) return;

		const isTalkAboutLife = speaking.some(
			(s) => s.textType === LIFE_QUOTE_TYPE,
		);
		if (isTalkAboutLife) return;

		const duck = this;
		const additionalRotate = randomRange(degToRadian(-60), degToRadian(60));
		const text = new (class extends Shape {
			accessoryType = 'SPEECH';
			id = Date.now();

			text = '';
			textType = null;
			soundUrl = null;

			color = '#494B4D';
			opacity = 0;
			scale = 0.6;

			status = null;

			constructor() {
				super();

				const speech =
					SPEECH_SET[Math.floor(randomRange(0, SPEECH_SET.length))];
				this.text = speech.text;
				this.textType = speech.type;
				this.soundUrl = speech.soundUrl;

				this.status = 'FADE-IN';

				this.play();
			}

			play() {
				if (!this.soundUrl) return;

				const audio = new Audio(this.soundUrl);
				audio.play();
			}

			draw(context) {
				const { x, y, img, rotation } = duck.props;

				context.save();
				const FONT_SIZE = 24;
				const FONT =
					this.textType === LIFE_QUOTE_TYPE
						? `bold ${FONT_SIZE}px Eulyoo1945`
						: `${FONT_SIZE}px "Bebas Neue"`;
				context.font = FONT;

				const col = this.color + this.opacity.toString(16).padStart(2, '0');
				context.fillStyle = col;

				context.translate(x, y);
				const rotate =
					this.textType === LIFE_QUOTE_TYPE
						? 0
						: rotation * 1.8 + additionalRotate;
				context.rotate(rotate);
				context.scale(this.scale, this.scale);

				const texts = this.text.split('\n');
				const LINE_HEIGHT = FONT_SIZE * 1.4;
				let top = img.height + LINE_HEIGHT * texts.length;

				texts.forEach((txt) => {
					const textSize = context.measureText(txt);
					const left =
						this.textType === LIFE_QUOTE_TYPE ? 450 : textSize.width / 2;

					context.fillText(txt, -left, -top);
					top -= LINE_HEIGHT;
				});

				context.restore();
			}
			update() {
				if (this.status === 'FADE-IN') {
					if (this.opacity >= 255) {
						this.status = 'HOLD';
						const duration =
							this.textType === LIFE_QUOTE_TYPE
								? this.text.length * 80
								: this.text.length * 200;
						setTimeout(() => (this.status = 'FADE-OUT'), duration);
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

	squeeze() {
		this.scale = 0.8;
	}

	addAccessory(shape) {
		this.#accessories.push(shape);
	}

	removeAccessory(shape) {
		this.#accessories = this.#accessories.filter((s) => s.id !== shape.id);
	}

	update() {
		if (this.scale !== 1) {
			this.scale += (1 - this.scale) * 0.2;
		}
		this.#accessories.forEach((s) => s.update());
	}

	collision() {}
}
