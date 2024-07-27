import Line from './Line.mjs';

class SubLine extends Line {
	constructor(args) {
		super(args);
		this.w = args.weight;
		this.p = args.parent;
	}
	update() {
		const { dots, prevState, friction, w } = this.props;
		dots.forEach((d, i) => {
			const parentDot = this.p.props.dots[i];
			const parentDistance = parentDot.props.initPos.y - parentDot.y;
			const distance = d.props.initPos.y - d.y;
			d.v += -(parentDistance * this.w - distance) * 0.03;
			d.update([...prevState]);
		});
		prevState.forEach((d, i) => (d.props = { ...dots[i].props }));
	}
	collision() {
		return false;
	}
}

export default SubLine;
