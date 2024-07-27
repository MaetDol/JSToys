class Shape {
	draw(context) {
		throw new Error('Not implemented draw');
	}
	update() {
		throw new Error('Not implemented update');
	}
	collision(shapes) {
		throw new Error('Not implemented collision');
	}
	conflict(shape) {
		throw new Error('Not implemented conflict');
	}

	get x() {
		return this.props.x;
	}
	get y() {
		return this.props.y;
	}

	set x(v) {
		this.props.x = v;
	}
	set y(v) {
		this.props.y = v;
	}
}

export default Shape;
